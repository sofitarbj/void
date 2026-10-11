/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { getModelCapabilities } from './modelCapabilities.js';
import { ProviderName } from './voidSettingsTypes.js';

export const ITokenUsageService = createDecorator<ITokenUsageService>('tokenUsageService');

const TOTAL_TOKENS_STORAGE_KEY = 'codeen.totalTokensUsed';
const ESTIMATED_COST_STORAGE_KEY = 'codeen.estimatedCostUsed';
const DAILY_TOKENS_STORAGE_KEY = 'codeen.dailyTokenUsage.v1';

export type TokenUsageInfo = {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	providerName?: string;
	modelName?: string;
};

export type ModelDayEntry = {
	tokens: number;
	cost: number;
};

export type DailyTokenEntry = {
	date: string;
	tokens: number;
	cost: number;
	promptTokens?: number;
	completionTokens?: number;
	models: Record<string, ModelDayEntry>;
};

const FREE_PROVIDERS = new Set<string>(['ollama', 'vLLM', 'lmStudio']);

export function estimateCost(tokens: TokenUsageInfo): number {
	if (!tokens.providerName || FREE_PROVIDERS.has(tokens.providerName)) {
		return 0;
	}
	if (!tokens.modelName) {
		return 0;
	}

	try {
		const caps = getModelCapabilities(tokens.providerName as ProviderName, tokens.modelName, undefined);
		const { input, output } = caps.cost;
		return (tokens.inputTokens / 1_000_000) * input + (tokens.outputTokens / 1_000_000) * output;
	} catch {
		// Fallback standard si modèle non répertorié
		return (tokens.inputTokens / 1_000_000) * 1.0 + (tokens.outputTokens / 1_000_000) * 3.0;
	}
}

export function formatDollarCount(amount: number): string {
	if (amount === 0) return '$0';
	const abs = Math.abs(amount);
	if (abs < 0.01) return '<$0.01';
	if (abs < 1000) return `$${amount.toFixed(2)}`;
	if (abs < 1_000_000) return `$${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	if (abs < 1_000_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	return `$${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
}

export function formatTokenCount(tokens: number): string {
	if (tokens < 1000) return tokens.toString();
	if (tokens < 1_000_000) return `${(tokens / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	if (tokens < 1_000_000_000) return `${(tokens / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	return `${(tokens / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
}

export interface ITokenUsageService {
	readonly _serviceBrand: undefined;
	readonly onTokenUsageChanged: Event<void>;

	getTotalTokensUsed(): number;
	getEstimatedCost(): number;
	getDailyUsage(): DailyTokenEntry[];
	recordUsage(info: TokenUsageInfo): void;
	resetUsage(): void;
}

class TokenUsageService implements ITokenUsageService {
	readonly _serviceBrand: undefined;

	private readonly _onTokenUsageChanged = new Emitter<void>();
	readonly onTokenUsageChanged: Event<void> = this._onTokenUsageChanged.event;

	private _totalTokens: number = 0;
	private _estimatedCost: number = 0;
	private _dailyUsage: DailyTokenEntry[] = [];

	constructor(
		@IStorageService private readonly storageService: IStorageService,
	) {
		this._loadState();
	}

	private _loadState(): void {
		this._totalTokens = this.storageService.getNumber(TOTAL_TOKENS_STORAGE_KEY, StorageScope.APPLICATION, 0);
		this._estimatedCost = parseFloat(this.storageService.get(ESTIMATED_COST_STORAGE_KEY, StorageScope.APPLICATION, '0')) || 0;

		const dailyStr = this.storageService.get(DAILY_TOKENS_STORAGE_KEY, StorageScope.APPLICATION, '[]');
		try {
			this._dailyUsage = JSON.parse(dailyStr);
			if (!Array.isArray(this._dailyUsage)) {
				this._dailyUsage = [];
			}
		} catch {
			this._dailyUsage = [];
		}
	}

	private _saveState(): void {
		this.storageService.store(TOTAL_TOKENS_STORAGE_KEY, this._totalTokens, StorageScope.APPLICATION, StorageTarget.USER);
		this.storageService.store(ESTIMATED_COST_STORAGE_KEY, this._estimatedCost.toString(), StorageScope.APPLICATION, StorageTarget.USER);
		this.storageService.store(DAILY_TOKENS_STORAGE_KEY, JSON.stringify(this._dailyUsage), StorageScope.APPLICATION, StorageTarget.USER);
		this._onTokenUsageChanged.fire();
	}

	getTotalTokensUsed(): number {
		return this._totalTokens;
	}

	getEstimatedCost(): number {
		return this._estimatedCost;
	}

	getDailyUsage(): DailyTokenEntry[] {
		return this._dailyUsage;
	}

	recordUsage(info: TokenUsageInfo): void {
		if (info.totalTokens <= 0) {
			return;
		}

		const cost = estimateCost(info);
		this._totalTokens += info.totalTokens;
		this._estimatedCost += cost;

		// Mise à jour de l'historique journalier
		const today = new Date().toISOString().split('T')[0];
		let todayEntry = this._dailyUsage.find(e => e.date === today);

		if (!todayEntry) {
			todayEntry = {
				date: today,
				tokens: 0,
				cost: 0,
				models: {}
			};
			this._dailyUsage.push(todayEntry);
		}

		todayEntry.tokens += info.totalTokens;
		todayEntry.cost += cost;
		todayEntry.promptTokens = (todayEntry.promptTokens || 0) + (info.inputTokens || 0);
		todayEntry.completionTokens = (todayEntry.completionTokens || 0) + (info.outputTokens || 0);

		if (info.modelName) {
			const modelKey = info.providerName ? `${info.providerName}:${info.modelName}` : info.modelName;
			if (!todayEntry.models[modelKey]) {
				todayEntry.models[modelKey] = { tokens: 0, cost: 0 };
			}
			todayEntry.models[modelKey].tokens += info.totalTokens;
			todayEntry.models[modelKey].cost += cost;
		}

		// Rétention max : 365 jours
		if (this._dailyUsage.length > 365) {
			this._dailyUsage = this._dailyUsage.slice(-365);
		}

		this._saveState();
	}

	resetUsage(): void {
		this._totalTokens = 0;
		this._estimatedCost = 0;
		this._dailyUsage = [];
		this._saveState();
	}
}

registerSingleton(ITokenUsageService, TokenUsageService, InstantiationType.Delayed);

/*--------------------------------------------------------------------------------------
*  Copyright 2025 Glass Devtools, Inc. All rights reserved.
*  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
*--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ChatMode, ModelSelection } from '../common/voidSettingsTypes.js';
import { getModelCapabilities } from '../common/modelCapabilities.js';
import { IVoidSettingsService } from '../common/voidSettingsService.js';
import {
	BudgetAllocation,
	BudgetProfile,
	CHARS_PER_TOKEN_ESTIMATE,
	ContextElement,
	ContextLevel,
	CostEstimate,
	DEFAULT_BUDGET_PERCENTAGES,
} from '../common/contextBudgetServiceTypes.js';


export interface IContextBudgetService {
	readonly _serviceBrand: undefined;

	computeBudget(params: {
		modelSelection: ModelSelection;
		chatMode: ChatMode;
		turnNumber: number;
		historyTokens: number;
	}): BudgetAllocation;

	estimateTokens(text: string): number;

	estimateCost(params: {
		inputTokens: number;
		outputTokens: number;
		modelSelection: ModelSelection;
		cachedInputTokens?: number;
	}): CostEstimate;

	getBudgetProfile(modelSelection: ModelSelection): BudgetProfile;

	canFit(element: ContextElement, remainingBudget: number): boolean;
}

export const IContextBudgetService = createDecorator<IContextBudgetService>('contextBudgetService');


class ContextBudgetService extends Disposable implements IContextBudgetService {
	readonly _serviceBrand: undefined;

	constructor(
		@IVoidSettingsService private readonly _settingsService: IVoidSettingsService,
	) {
		super();
	}

	estimateTokens(text: string): number {
		return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
	}

	getBudgetProfile(modelSelection: ModelSelection): BudgetProfile {
		const { overridesOfModel } = this._settingsService.state;
		const caps = getModelCapabilities(modelSelection.providerName, modelSelection.modelName, overridesOfModel);
		const inputCost = caps.cost.input;

		if (inputCost === 0) return 'relaxed';
		if (inputCost < 1.0) return 'standard';
		return 'strict';
	}

	computeBudget(params: {
		modelSelection: ModelSelection;
		chatMode: ChatMode;
		turnNumber: number;
		historyTokens: number;
	}): BudgetAllocation {
		const { modelSelection, chatMode, turnNumber } = params;
		const { overridesOfModel } = this._settingsService.state;
		const caps = getModelCapabilities(modelSelection.providerName, modelSelection.modelName, overridesOfModel);

		const contextWindow = caps.contextWindow;
		const reservedOutput = caps.reservedOutputTokenSpace ?? 4096;
		const safetyMargin = Math.floor(contextWindow * 0.05);
		const totalAvailable = Math.max(contextWindow - reservedOutput - safetyMargin, 2000);

		const percentages = { ...DEFAULT_BUDGET_PERCENTAGES[chatMode] };

		if (turnNumber <= 1) {
			percentages.history = 0;
			percentages[1] += 0.10;
			percentages[2] += 0.15;
		} else if (turnNumber >= 5) {
			percentages.history = Math.min(0.40, percentages.history + 0.15);
			percentages[1] = Math.max(0.05, percentages[1] - 0.07);
			percentages[2] = Math.max(0.10, percentages[2] - 0.08);
		}

		const profile = this.getBudgetProfile(modelSelection);
		let multiplier = 1.0;
		if (profile === 'strict') multiplier = 0.7;
		else if (profile === 'relaxed') multiplier = 1.3;

		const budgetPerLevel: Record<ContextLevel, number> = {
			0: Math.floor(totalAvailable * percentages[0]),
			1: Math.floor(totalAvailable * percentages[1] * multiplier),
			2: Math.floor(totalAvailable * percentages[2] * multiplier),
			3: Math.floor(totalAvailable * percentages[3] * multiplier),
			4: Math.floor(totalAvailable * percentages[4]),
			5: 0,
		};

		const historyBudget = Math.floor(totalAvailable * percentages.history);

		return {
			modelName: modelSelection.modelName,
			contextWindow,
			reservedOutput,
			safetyMargin,
			totalAvailable,
			budgetPerLevel,
			historyBudget,
		};
	}

	estimateCost(params: {
		inputTokens: number;
		outputTokens: number;
		modelSelection: ModelSelection;
		cachedInputTokens?: number;
	}): CostEstimate {
		const { inputTokens, outputTokens, modelSelection, cachedInputTokens = 0 } = params;
		const { overridesOfModel } = this._settingsService.state;
		const caps = getModelCapabilities(modelSelection.providerName, modelSelection.modelName, overridesOfModel);

		const cacheReadRate = caps.cost.cache_read ?? caps.cost.input;
		const uncachedInput = Math.max(0, inputTokens - cachedInputTokens);

		const inputCost = (uncachedInput * caps.cost.input + cachedInputTokens * cacheReadRate) / 1_000_000;
		const outputCost = (outputTokens * caps.cost.output) / 1_000_000;

		return {
			inputTokens,
			outputTokens,
			cachedInputTokens,
			inputCost,
			outputCost,
			totalCost: inputCost + outputCost,
			currency: 'USD',
		};
	}

	canFit(element: ContextElement, remainingBudget: number): boolean {
		return element.estimatedTokens <= remainingBudget;
	}
}

registerSingleton(IContextBudgetService, ContextBudgetService, InstantiationType.Delayed);

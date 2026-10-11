/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IVoidBudgetService } from '../common/voidBudgetService.js';
import { BudgetCheckResult, DEFAULT_BUDGET_STATE, VoidBudgetState } from '../common/voidBudgetServiceTypes.js';

const VOID_BUDGET_STORAGE_KEY = 'void.budgetServiceStorage';

class VoidBudgetService extends Disposable implements IVoidBudgetService {
	readonly _serviceBrand: undefined;

	private readonly _onDidChangeState = new Emitter<void>();
	readonly onDidChangeState: Event<void> = this._onDidChangeState.event;

	state: VoidBudgetState;

	constructor(
		@IStorageService private readonly _storageService: IStorageService,
	) {
		super();
		this.state = this._readState();
		this._maybeResetDailyCounters();
		// Reset session counter on every startup
		this._setState({ requestsThisSession: 0 });
	}

	// ─── Storage ──────────────────────────────────────────────────────────────

	private _readState(): VoidBudgetState {
		const raw = this._storageService.get(VOID_BUDGET_STORAGE_KEY, StorageScope.WORKSPACE);
		if (!raw) return { ...DEFAULT_BUDGET_STATE };
		try {
			return { ...DEFAULT_BUDGET_STATE, ...JSON.parse(raw) } as VoidBudgetState;
		} catch {
			return { ...DEFAULT_BUDGET_STATE };
		}
	}

	private _storeState(): void {
		this._storageService.store(
			VOID_BUDGET_STORAGE_KEY,
			JSON.stringify(this.state),
			StorageScope.WORKSPACE,
			StorageTarget.MACHINE
		);
	}

	private _setState(partial: Partial<VoidBudgetState>): void {
		this.state = { ...this.state, ...partial };
		this._storeState();
		this._onDidChangeState.fire();
	}

	// ─── Daily counter reset ───────────────────────────────────────────────────

	private _maybeResetDailyCounters(): void {
		const today = new Date().toISOString().slice(0, 10);
		if (this.state.dailyResetDate !== today) {
			this._setState({
				requestsToday: 0,
				tokensEstimatedToday: 0,
				dailyResetDate: today,
			});
		}
	}

	// ─── Budget check ─────────────────────────────────────────────────────────

	checkBudget(): BudgetCheckResult {
		this._maybeResetDailyCounters();

		const { maxRequestsPerDay, maxTokensPerDay, requestsToday, tokensEstimatedToday } = this.state;

		if (maxRequestsPerDay > 0 && requestsToday >= maxRequestsPerDay) {
			return {
				allowed: false,
				reason: `Daily request limit reached (${requestsToday}/${maxRequestsPerDay}). Resets at midnight.`
			};
		}

		if (maxTokensPerDay > 0 && tokensEstimatedToday >= maxTokensPerDay) {
			return {
				allowed: false,
				reason: `Daily token limit reached (~${tokensEstimatedToday}/${maxTokensPerDay} tokens). Resets at midnight.`
			};
		}

		return { allowed: true };
	}

	// ─── Record request ────────────────────────────────────────────────────────

	recordRequest(estimatedTokens: number = 0): void {
		this._maybeResetDailyCounters();
		this._setState({
			requestsThisSession: this.state.requestsThisSession + 1,
			requestsToday: this.state.requestsToday + 1,
			tokensEstimatedToday: this.state.tokensEstimatedToday + estimatedTokens,
		});
	}

	// ─── Budget configuration ──────────────────────────────────────────────────

	setMaxRequestsPerDay(n: number): void {
		this._setState({ maxRequestsPerDay: Math.max(0, n) });
	}

	setMaxTokensPerDay(n: number): void {
		this._setState({ maxTokensPerDay: Math.max(0, n) });
	}

	// ─── Command blocklist ─────────────────────────────────────────────────────

	setCommandBlocklist(patterns: string[]): void {
		this._setState({ commandBlocklist: patterns });
	}

	isCommandBlocked(command: string): boolean {
		if (!command || this.state.commandBlocklist.length === 0) return false;
		const lower = command.toLowerCase();
		return this.state.commandBlocklist.some(pattern =>
			pattern.trim().length > 0 && lower.includes(pattern.toLowerCase())
		);
	}

	// ─── Session reset ─────────────────────────────────────────────────────────

	resetSessionCounter(): void {
		this._setState({ requestsThisSession: 0 });
	}
}

registerSingleton(IVoidBudgetService, VoidBudgetService, InstantiationType.Delayed);

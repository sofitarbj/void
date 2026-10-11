/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { BudgetCheckResult, VoidBudgetState } from './voidBudgetServiceTypes.js';

export interface IVoidBudgetService {
	readonly _serviceBrand: undefined;

	readonly state: VoidBudgetState;
	onDidChangeState: Event<void>;

	// Check if an LLM request is allowed under current budget
	checkBudget(): BudgetCheckResult;

	// Record a completed LLM request
	recordRequest(estimatedTokens?: number): void;

	// Budget configuration
	setMaxRequestsPerDay(n: number): void;
	setMaxTokensPerDay(n: number): void;

	// Command blocklist
	setCommandBlocklist(patterns: string[]): void;
	isCommandBlocked(command: string): boolean;

	// Reset session counter (called on IDE startup)
	resetSessionCounter(): void;
}

export const IVoidBudgetService = createDecorator<IVoidBudgetService>('voidBudgetService');

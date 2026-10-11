/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

/**
 * Context Budget Service — Types
 *
 * Manages token budget allocation per context level to minimize LLM costs.
 * Budget is computed BEFORE prompt construction, not after.
 */

import { ChatMode } from './voidSettingsTypes.js';

export type ContextLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface BudgetAllocation {
	modelName: string;
	contextWindow: number;
	reservedOutput: number;
	safetyMargin: number;
	totalAvailable: number;
	budgetPerLevel: Record<ContextLevel, number>;
	historyBudget: number;
}

export interface ContextElement {
	level: ContextLevel;
	key: string;
	content: string;
	estimatedTokens: number;
}

export interface CostEstimate {
	inputTokens: number;
	outputTokens: number;
	cachedInputTokens: number;
	inputCost: number;
	outputCost: number;
	totalCost: number;
	currency: 'USD';
}

export type BudgetProfile = 'strict' | 'standard' | 'relaxed';

export const CHARS_PER_TOKEN_ESTIMATE = 3.5;

export const DEFAULT_BUDGET_PERCENTAGES: Record<ChatMode, Record<ContextLevel | 'history', number>> = {
	agent: {
		0: 0.03,
		1: 0.12,
		2: 0.20,
		3: 0.30,
		4: 0.05,
		5: 0,
		history: 0.25,
	},
	gather: {
		0: 0.03,
		1: 0.15,
		2: 0.25,
		3: 0.25,
		4: 0.05,
		5: 0,
		history: 0.22,
	},
	normal: {
		0: 0.05,
		1: 0.25,
		2: 0.35,
		3: 0,
		4: 0.05,
		5: 0,
		history: 0.25,
	},
};

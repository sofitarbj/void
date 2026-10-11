/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

/**
 * Void Budget Service — API call tracking and limits
 *
 * Tracks LLM requests per session and per day, enforces configurable limits.
 * Entirely local — no external telemetry.
 */

export type VoidBudgetState = {
	// Counts
	requestsThisSession: number;
	requestsToday: number;
	tokensEstimatedToday: number;

	// Reset timestamp (ISO date string for the current day)
	dailyResetDate: string;

	// Limits (0 = unlimited)
	maxRequestsPerDay: number;
	maxTokensPerDay: number;

	// Blocklist (command substrings to reject)
	commandBlocklist: string[];
}

export const DEFAULT_BUDGET_STATE: VoidBudgetState = {
	requestsThisSession: 0,
	requestsToday: 0,
	tokensEstimatedToday: 0,
	dailyResetDate: new Date().toISOString().slice(0, 10),
	maxRequestsPerDay: 0,  // 0 = unlimited
	maxTokensPerDay: 0,    // 0 = unlimited
	commandBlocklist: [],
}

export type BudgetCheckResult =
	| { allowed: true }
	| { allowed: false; reason: string }

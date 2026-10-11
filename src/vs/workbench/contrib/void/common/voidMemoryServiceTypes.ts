/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

/**
 * Void Memory Service — Types
 *
 * Provides persistent context (Knowledge Items) across sessions.
 * Each KI is a distilled, curated insight extracted from past conversations.
 */

// A single knowledge item — a distilled insight from past work
export type VoidKnowledgeItem = {
	id: string;           // UUID
	title: string;        // Short human-readable title (≤ 80 chars)
	summary: string;      // Detailed content of the KI
	tags: string[];       // Keywords for relevance filtering
	createdAt: string;    // ISO date string
	updatedAt: string;    // ISO date string
	threadId?: string;    // Optional: source thread ID
}

// The full persisted memory state
export type VoidMemoryState = {
	knowledgeItems: VoidKnowledgeItem[];
	lastConversationSummary: string | undefined;  // Summary of the last session
	userRules: string | undefined;                // User-defined persistent instructions
}

// What gets injected into the prompt
export type VoidMemoryContext = {
	knowledgeItems: VoidKnowledgeItem[];
	lastConversationSummary: string | undefined;
	userRules: string | undefined;
}

export const MAX_KI_ITEMS = 20;            // Max knowledge items to keep
export const MAX_KI_SUMMARY_CHARS = 800;  // Max chars per KI summary
export const MAX_USER_RULES_CHARS = 2000; // Max chars for user rules

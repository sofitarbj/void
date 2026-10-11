/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { VoidKnowledgeItem, VoidMemoryContext, VoidMemoryState } from './voidMemoryServiceTypes.js';

export interface IVoidMemoryService {
	readonly _serviceBrand: undefined;

	// State
	readonly state: VoidMemoryState;
	onDidChangeState: Event<void>;

	// Knowledge Items CRUD
	addKnowledgeItem(item: Omit<VoidKnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): void;
	updateKnowledgeItem(id: string, updates: Partial<Pick<VoidKnowledgeItem, 'title' | 'summary' | 'tags'>>): void;
	deleteKnowledgeItem(id: string): void;
	getKnowledgeItems(): VoidKnowledgeItem[];

	// User Rules
	setUserRules(rules: string): void;
	getUserRules(): string | undefined;

	// Session summary
	setLastConversationSummary(summary: string): void;
	getLastConversationSummary(): string | undefined;

	// Get the full context for prompt injection
	getMemoryContext(): VoidMemoryContext;
}

export const IVoidMemoryService = createDecorator<IVoidMemoryService>('voidMemoryService');

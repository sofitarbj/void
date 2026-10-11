/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IVoidMemoryService } from '../common/voidMemoryService.js';
import { VoidKnowledgeItem, VoidMemoryContext, VoidMemoryState, MAX_KI_ITEMS } from '../common/voidMemoryServiceTypes.js';

const VOID_MEMORY_STORAGE_KEY = 'void.memoryServiceStorage';

const _defaultState = (): VoidMemoryState => ({
	knowledgeItems: [],
	lastConversationSummary: undefined,
	userRules: undefined,
});

class VoidMemoryService extends Disposable implements IVoidMemoryService {
	readonly _serviceBrand: undefined;

	private readonly _onDidChangeState = new Emitter<void>();
	readonly onDidChangeState: Event<void> = this._onDidChangeState.event;

	state: VoidMemoryState;

	constructor(
		@IStorageService private readonly _storageService: IStorageService,
	) {
		super();
		this.state = this._readState();
	}

	// ─── Private storage helpers ───────────────────────────────────────────────

	private _readState(): VoidMemoryState {
		const raw = this._storageService.get(VOID_MEMORY_STORAGE_KEY, StorageScope.APPLICATION);
		if (!raw) return _defaultState();
		try {
			return JSON.parse(raw) as VoidMemoryState;
		} catch {
			return _defaultState();
		}
	}

	private _storeState(): void {
		this._storageService.store(
			VOID_MEMORY_STORAGE_KEY,
			JSON.stringify(this.state),
			StorageScope.APPLICATION,
			StorageTarget.USER
		);
	}

	private _setState(partial: Partial<VoidMemoryState>): void {
		this.state = { ...this.state, ...partial };
		this._storeState();
		this._onDidChangeState.fire();
	}

	// ─── Knowledge Items ───────────────────────────────────────────────────────

	addKnowledgeItem(item: Omit<VoidKnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): void {
		const now = new Date().toISOString();
		const newItem: VoidKnowledgeItem = {
			...item,
			id: generateUuid(),
			createdAt: now,
			updatedAt: now,
		};

		// Keep most recent MAX_KI_ITEMS items, drop oldest
		const updated = [newItem, ...this.state.knowledgeItems].slice(0, MAX_KI_ITEMS);
		this._setState({ knowledgeItems: updated });
	}

	updateKnowledgeItem(id: string, updates: Partial<Pick<VoidKnowledgeItem, 'title' | 'summary' | 'tags'>>): void {
		const now = new Date().toISOString();
		const updated = this.state.knowledgeItems.map(ki =>
			ki.id === id ? { ...ki, ...updates, updatedAt: now } : ki
		);
		this._setState({ knowledgeItems: updated });
	}

	deleteKnowledgeItem(id: string): void {
		const updated = this.state.knowledgeItems.filter(ki => ki.id !== id);
		this._setState({ knowledgeItems: updated });
	}

	getKnowledgeItems(): VoidKnowledgeItem[] {
		return this.state.knowledgeItems;
	}

	// ─── User Rules ───────────────────────────────────────────────────────────

	setUserRules(rules: string): void {
		this._setState({ userRules: rules || undefined });
	}

	getUserRules(): string | undefined {
		return this.state.userRules;
	}

	// ─── Session Summary ──────────────────────────────────────────────────────

	setLastConversationSummary(summary: string): void {
		this._setState({ lastConversationSummary: summary || undefined });
	}

	getLastConversationSummary(): string | undefined {
		return this.state.lastConversationSummary;
	}

	// ─── Prompt Context Builder ───────────────────────────────────────────────

	getMemoryContext(): VoidMemoryContext {
		return {
			knowledgeItems: this.state.knowledgeItems,
			lastConversationSummary: this.state.lastConversationSummary,
			userRules: this.state.userRules,
		};
	}
}

registerSingleton(IVoidMemoryService, VoidMemoryService, InstantiationType.Delayed);


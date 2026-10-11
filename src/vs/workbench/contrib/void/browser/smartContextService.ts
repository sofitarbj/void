/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextBudgetService } from './contextBudgetService.js';
import { CHARS_PER_TOKEN_ESTIMATE } from '../common/contextBudgetServiceTypes.js';

/**
 * Smart Context Service — manages context compression and deduplication.
 *
 * Responsibilities:
 * - Compress file contents to fit budget (imports + signatures + relevant zone)
 * - Compress terminal output (keep errors + tail)
 * - Summarize conversation history (keep recent 3 turns, summarize older)
 * - Deduplicate tool results (detect re-reads of same file)
 */

export interface ISmartContextService {
	readonly _serviceBrand: undefined;

	compressFileContent(content: string, maxTokens: number): string;
	compressTerminalOutput(output: string, maxChars?: number): string;
	compressHistory(messages: { role: string; content: string }[], maxTokens: number): { recentMessages: { role: string; content: string }[]; summary: string };
	isFileAlreadyRead(threadId: string, filePath: string, contentHash: string): boolean;
	recordFileRead(threadId: string, filePath: string, contentHash: string): void;
	clearThreadCache(threadId: string): void;
}

export const ISmartContextService = createDecorator<ISmartContextService>('smartContextService');


class SmartContextService extends Disposable implements ISmartContextService {
	readonly _serviceBrand: undefined;

	private readonly _fileReadCache: Map<string, Map<string, string>> = new Map();

	constructor(
		@IContextBudgetService private readonly _budgetService: IContextBudgetService,
	) {
		super();
	}

	compressFileContent(content: string, maxTokens: number): string {
		const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN_ESTIMATE);
		if (content.length <= maxChars) return content;

		const lines = content.split('\n');

		const result: string[] = [];
		const importLines: string[] = [];
		const signatureLines: string[] = [];

		for (let i = 0; i < Math.min(lines.length, 30); i++) {
			const trimmed = lines[i].trim();
			if (/^(import|export|from|require|const|let|var|type|interface|class|function|enum|abstract|declare)\b/.test(trimmed)) {
				importLines.push(lines[i]);
			}
		}

		for (let i = 0; i < lines.length; i++) {
			const trimmed = lines[i].trim();
			if (/^(export\s+)?(async\s+)?(function|class|interface|type|enum)\s+\w/.test(trimmed)) {
				signatureLines.push(lines[i]);
			} else if (/^(export\s+)?(const|let|var)\s+\w+\s*[:=]/.test(trimmed) && lines[i].length < 120) {
				signatureLines.push(lines[i]);
			}
		}

		result.push(...importLines);
		if (importLines.length > 0) result.push('');
		result.push(`// ... (${lines.length} lines total, showing structure) ...`);
		result.push('');
		result.push(...signatureLines.slice(0, 30));

		const text = result.join('\n');
		if (text.length > maxChars) {
			return text.slice(0, maxChars - 20) + '\n// ... truncated ...';
		}
		return text;
	}

	compressTerminalOutput(output: string, maxChars: number = 2000): string {
		if (output.length <= maxChars) return output;

		const lines = output.split('\n');

		const errorLines = lines.filter(l =>
			/error|fail|exception|warn|ERR!|ENOENT|EACCES|EPERM|Cannot find|not found|refused/i.test(l)
		).slice(-15);

		const lastLines = lines.slice(-20);

		const combined = [...new Set([...errorLines, ...lastLines])];
		const text = combined.join('\n');

		if (text.length > maxChars) {
			return text.slice(0, maxChars - 20) + '\n... truncated ...';
		}
		return text;
	}

	compressHistory(
		messages: { role: string; content: string }[],
		maxTokens: number,
	): { recentMessages: { role: string; content: string }[]; summary: string } {
		const totalTokens = messages.reduce((acc, m) => acc + this._budgetService.estimateTokens(m.content), 0);

		if (totalTokens <= maxTokens) {
			return { recentMessages: messages, summary: '' };
		}

		const turns: { role: string; content: string }[][] = [];
		let currentTurn: { role: string; content: string }[] = [];
		for (const m of messages) {
			if (m.role === 'user' && currentTurn.length > 0) {
				turns.push(currentTurn);
				currentTurn = [];
			}
			currentTurn.push(m);
		}
		if (currentTurn.length > 0) turns.push(currentTurn);

		const recentCount = Math.min(3, turns.length);
		const recentTurns = turns.slice(-recentCount);
		const olderTurns = turns.slice(0, -recentCount);

		const summaryParts = olderTurns.map((turn, i) => {
			const userMsg = turn.find(m => m.role === 'user');
			const assistantMsg = turn.find(m => m.role === 'assistant');
			const userSnippet = userMsg ? userMsg.content.slice(0, 80).replace(/\n/g, ' ') : '';
			const assistantSnippet = assistantMsg ? assistantMsg.content.slice(0, 80).replace(/\n/g, ' ') : '';
			return `[Turn ${i + 1}] User: ${userSnippet}... → Assistant: ${assistantSnippet}...`;
		});

		const recentMessages = recentTurns.flat();
		const summary = summaryParts.length > 0
			? `<conversation_history_summary>\n${summaryParts.join('\n')}\n</conversation_history_summary>`
			: '';

		return { recentMessages, summary };
	}

	isFileAlreadyRead(threadId: string, filePath: string, contentHash: string): boolean {
		const cache = this._fileReadCache.get(threadId);
		if (!cache) return false;
		return cache.get(filePath) === contentHash;
	}

	recordFileRead(threadId: string, filePath: string, contentHash: string): void {
		if (!this._fileReadCache.has(threadId)) {
			this._fileReadCache.set(threadId, new Map());
		}
		this._fileReadCache.get(threadId)!.set(filePath, contentHash);
	}

	clearThreadCache(threadId: string): void {
		this._fileReadCache.delete(threadId);
	}
}

registerSingleton(ISmartContextService, SmartContextService, InstantiationType.Delayed);

/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { CreateSystemDocParams, SystemDoc, SystemDocComment, SystemDocMetadata, SystemDocType, UpdateSystemDocParams } from '../common/systemDocsServiceTypes.js';

export interface ISystemDocsService {
	readonly _serviceBrand: undefined;

	createDoc(params: CreateSystemDocParams): Promise<SystemDoc>;
	updateDoc(params: UpdateSystemDocParams): Promise<void>;
	getDoc(id: string): Promise<SystemDoc | null>;
	listDocs(type?: SystemDocType): Promise<SystemDoc[]>;
	deleteDoc(id: string): Promise<void>;
	addComment(docId: string, comment: Omit<SystemDocComment, 'id' | 'createdAt'>): Promise<void>;
	resolveComment(docId: string, commentId: string): Promise<void>;
	openDocInEditor(id: string): Promise<void>;
}

export const ISystemDocsService = createDecorator<ISystemDocsService>('systemDocsService');

class SystemDocsService extends Disposable implements ISystemDocsService {
	readonly _serviceBrand: undefined;

	private readonly VOID_DIR = '.void';
	private readonly DOCS_DIR = 'docs';
	private readonly INDEX_FILE = 'index.json';

	constructor(
		@IFileService private readonly fileService: IFileService,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
	) {
		super();
	}

	private async getVoidDocsUri(): Promise<URI | null> {
		const workspace = this.workspaceService.getWorkspace();
		if (!workspace.folders.length) return null;
		const rootUri = workspace.folders[0].uri;
		return URI.joinPath(rootUri, this.VOID_DIR, this.DOCS_DIR);
	}

	private async ensureVoidDocsDir(): Promise<URI | null> {
		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return null;

		try {
			await this.fileService.createFolder(docsUri);
		} catch {
			// Directory already exists
		}

		return docsUri;
	}

	private async readIndex(): Promise<Record<string, SystemDocMetadata>> {
		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return {};

		const indexUri = URI.joinPath(docsUri, this.INDEX_FILE);
		try {
			const content = await this.fileService.readFile(indexUri);
			return JSON.parse(content.value.toString());
		} catch {
			return {};
		}
	}

	private async writeIndex(index: Record<string, SystemDocMetadata>): Promise<void> {
		const docsUri = await this.ensureVoidDocsDir();
		if (!docsUri) return;

		const indexUri = URI.joinPath(docsUri, this.INDEX_FILE);
		const content = JSON.stringify(index, null, 2);
		await this.fileService.writeFile(indexUri, VSBuffer.fromString(content));
	}

	private getDocFileName(id: string, type: SystemDocType): string {
		const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		return `${type}_${timestamp}_${id.slice(0, 8)}.md`;
	}

	async createDoc(params: CreateSystemDocParams): Promise<SystemDoc> {
		const docsUri = await this.ensureVoidDocsDir();
		if (!docsUri) throw new Error('No workspace folder found');

		const id = generateUuid();
		const now = new Date().toISOString();

		const metadata: SystemDocMetadata = {
			type: params.type,
			title: params.title,
			createdAt: now,
			updatedAt: now,
			threadId: params.threadId,
			version: 1,
			tags: params.tags,
		};

		const doc: SystemDoc = {
			id,
			metadata,
			content: params.content,
			comments: [],
		};

		// Write markdown file
		const fileName = this.getDocFileName(id, params.type);
		const fileUri = URI.joinPath(docsUri, fileName);
		const fileContent = this.formatDocContent(doc);
		await this.fileService.writeFile(fileUri, VSBuffer.fromString(fileContent));

		// Update index
		const index = await this.readIndex();
		index[id] = metadata;
		await this.writeIndex(index);

		return doc;
	}

	async updateDoc(params: UpdateSystemDocParams): Promise<void> {
		const doc = await this.getDoc(params.id);
		if (!doc) throw new Error(`Document ${params.id} not found`);

		if (params.content) {
			doc.content = params.content;
		}

		if (params.metadata) {
			doc.metadata = { ...doc.metadata, ...params.metadata };
		}

		doc.metadata.updatedAt = new Date().toISOString();
		doc.metadata.version += 1;

		// Write updated file
		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return;

		const fileName = this.getDocFileName(params.id, doc.metadata.type);
		const fileUri = URI.joinPath(docsUri, fileName);
		const fileContent = this.formatDocContent(doc);
		await this.fileService.writeFile(fileUri, VSBuffer.fromString(fileContent));

		// Update index
		const index = await this.readIndex();
		index[params.id] = doc.metadata;
		await this.writeIndex(index);
	}

	async getDoc(id: string): Promise<SystemDoc | null> {
		const index = await this.readIndex();
		const metadata = index[id];
		if (!metadata) return null;

		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return null;

		const fileName = this.getDocFileName(id, metadata.type);
		const fileUri = URI.joinPath(docsUri, fileName);

		try {
			const content = await this.fileService.readFile(fileUri);
			const parsed = this.parseDocContent(content.value.toString());
			return {
				id,
				metadata,
				content: parsed.content,
				comments: parsed.comments,
			};
		} catch {
			return null;
		}
	}

	async listDocs(type?: SystemDocType): Promise<SystemDoc[]> {
		const index = await this.readIndex();
		const docs: SystemDoc[] = [];

		for (const [id, metadata] of Object.entries(index)) {
			if (type && metadata.type !== type) continue;
			const doc = await this.getDoc(id);
			if (doc) docs.push(doc);
		}

		return docs.sort((a, b) => b.metadata.updatedAt.localeCompare(a.metadata.updatedAt));
	}

	async deleteDoc(id: string): Promise<void> {
		const doc = await this.getDoc(id);
		if (!doc) return;

		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return;

		const fileName = this.getDocFileName(id, doc.metadata.type);
		const fileUri = URI.joinPath(docsUri, fileName);

		try {
			await this.fileService.del(fileUri);
		} catch {
			// File already deleted
		}

		const index = await this.readIndex();
		delete index[id];
		await this.writeIndex(index);
	}

	async addComment(docId: string, comment: Omit<SystemDocComment, 'id' | 'createdAt'>): Promise<void> {
		const doc = await this.getDoc(docId);
		if (!doc) return;

		const newComment: SystemDocComment = {
			...comment,
			id: generateUuid(),
			createdAt: new Date().toISOString(),
		};

		doc.comments = doc.comments || [];
		doc.comments.push(newComment);

		await this.updateDoc({ id: docId, content: doc.content });
	}

	async resolveComment(docId: string, commentId: string): Promise<void> {
		const doc = await this.getDoc(docId);
		if (!doc || !doc.comments) return;

		const comment = doc.comments.find(c => c.id === commentId);
		if (comment) {
			comment.resolved = true;
			await this.updateDoc({ id: docId, content: doc.content });
		}
	}

	async openDocInEditor(id: string): Promise<void> {
		const doc = await this.getDoc(id);
		if (!doc) return;

		const docsUri = await this.getVoidDocsUri();
		if (!docsUri) return;

		const fileName = this.getDocFileName(id, doc.metadata.type);
		const fileUri = URI.joinPath(docsUri, fileName);

		// TODO: Open in custom preview editor instead of raw markdown
		// For now, just ensure file exists
		await this.fileService.exists(fileUri);
	}

	private formatDocContent(doc: SystemDoc): string {
		const frontmatter = `---
title: ${doc.metadata.title}
type: ${doc.metadata.type}
created: ${doc.metadata.createdAt}
updated: ${doc.metadata.updatedAt}
version: ${doc.metadata.version}
thread: ${doc.metadata.threadId}
${doc.metadata.tags ? `tags: ${doc.metadata.tags.join(', ')}` : ''}
---

`;

		let content = frontmatter + doc.content;

		if (doc.comments && doc.comments.length > 0) {
			content += '\n\n---\n## Comments\n\n';
			for (const comment of doc.comments) {
				const status = comment.resolved ? '✓' : '○';
				content += `${status} **Lines ${comment.lineStart}-${comment.lineEnd}**: ${comment.content}\n`;
			}
		}

		return content;
	}

	private parseDocContent(raw: string): { content: string; comments: SystemDocComment[] } {
		const parts = raw.split('---\n## Comments\n\n');
		const mainContent = parts[0].replace(/^---\n[\s\S]*?\n---\n\n/, '');
		const comments: SystemDocComment[] = [];

		if (parts[1]) {
			const commentLines = parts[1].split('\n').filter(l => l.trim());
			for (const line of commentLines) {
				const match = line.match(/^([✓○]) \*\*Lines (\d+)-(\d+)\*\*: (.+)$/);
				if (match) {
					comments.push({
						id: generateUuid(),
						lineStart: parseInt(match[2]),
						lineEnd: parseInt(match[3]),
						content: match[4],
						createdAt: new Date().toISOString(),
						resolved: match[1] === '✓',
					});
				}
			}
		}

		return { content: mainContent, comments };
	}
}

registerSingleton(ISystemDocsService, SystemDocsService, InstantiationType.Delayed);

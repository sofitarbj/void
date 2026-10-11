/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen AI. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IWorkspaceContextService, WorkbenchState } from '../../../../platform/workspace/common/workspace.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IVoidMemoryService } from '../common/voidMemoryService.js';
import { URI } from '../../../../base/common/uri.js';

const BOOTSTRAP_STORAGE_KEY = 'codeen.projectMemory.bootstrapped';

export class ProjectMemoryBootstrapContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.codeenProjectMemoryBootstrap';

	constructor(
		@IWorkspaceContextService private readonly _workspaceContextService: IWorkspaceContextService,
		@IFileService private readonly _fileService: IFileService,
		@IVoidMemoryService private readonly _voidMemoryService: IVoidMemoryService,
		@IStorageService private readonly _storageService: IStorageService,
	) {
		super();

		this._register(this._workspaceContextService.onDidChangeWorkbenchState(() => {
			this._bootstrapProjectMemory();
		}));

		this._bootstrapProjectMemory();
	}

	private async _bootstrapProjectMemory(): Promise<void> {
		if (this._workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return;
		}

		const alreadyBootstrapped = this._storageService.getBoolean(BOOTSTRAP_STORAGE_KEY, StorageScope.WORKSPACE, false);
		if (alreadyBootstrapped) {
			return;
		}

		const folders = this._workspaceContextService.getWorkspace().folders;
		if (!folders || folders.length === 0) {
			return;
		}

		const rootUri = folders[0].uri;

		try {
			const projectProfile = await this._analyzeWorkspaceRoot(rootUri);
			if (projectProfile) {
				this._voidMemoryService.addKnowledgeItem({
					title: `Profil Initial : ${projectProfile.name}`,
					summary: projectProfile.summary,
					tags: ['architecture', 'bootstrap', 'stack', ...projectProfile.tags],
				});

				this._storageService.store(
					BOOTSTRAP_STORAGE_KEY,
					true,
					StorageScope.WORKSPACE,
					StorageTarget.MACHINE
				);
			}
		} catch (err) {
			console.warn('[Codeen] Erreur lors du bootstrap de mémoire de projet:', err);
		}
	}

	private async _analyzeWorkspaceRoot(rootUri: URI): Promise<{ name: string; summary: string; tags: string[] } | null> {
		let projectName = rootUri.path.split('/').filter(Boolean).pop() || 'Projet';
		const tags: string[] = [];
		const summaryParts: string[] = [];

		// 1. Détection Node.js / TypeScript / JavaScript (package.json)
		const packageJsonUri = URI.joinPath(rootUri, 'package.json');
		try {
			const stat = await this._fileService.stat(packageJsonUri);
			if (stat.isFile) {
				const content = await this._fileService.readFile(packageJsonUri);
				const parsed = JSON.parse(content.value.toString());
				if (parsed.name) {
					projectName = parsed.name;
				}
				tags.push('nodejs', 'javascript');
				const deps = Object.keys(parsed.dependencies || {}).concat(Object.keys(parsed.devDependencies || {}));
				if (deps.includes('typescript')) tags.push('typescript');
				if (deps.includes('react')) tags.push('react');
				if (deps.includes('electron')) tags.push('electron');

				summaryParts.push(`Environnement Node.js (nom: ${projectName}, dépendances clés: ${deps.slice(0, 8).join(', ')})`);
			}
		} catch {
			// Pas de package.json
		}

		// 2. Détection Rust (Cargo.toml)
		const cargoUri = URI.joinPath(rootUri, 'Cargo.toml');
		try {
			const stat = await this._fileService.stat(cargoUri);
			if (stat.isFile) {
				tags.push('rust', 'cargo');
				summaryParts.push('Projet Rust géré par Cargo.');
			}
		} catch { }

		// 3. Détection Python (pyproject.toml / requirements.txt)
		const pyprojectUri = URI.joinPath(rootUri, 'pyproject.toml');
		const reqUri = URI.joinPath(rootUri, 'requirements.txt');
		try {
			const hasPyproject = (await this._fileService.exists(pyprojectUri));
			const hasReq = (await this._fileService.exists(reqUri));
			if (hasPyproject || hasReq) {
				tags.push('python');
				summaryParts.push('Environnement Python détecté.');
			}
		} catch { }

		// 4. Détection Go (go.mod)
		const goModUri = URI.joinPath(rootUri, 'go.mod');
		try {
			if (await this._fileService.exists(goModUri)) {
				tags.push('golang');
				summaryParts.push('Module Go détecté.');
			}
		} catch { }

		// 5. Détection Spec-Kit / Specify
		const specifyUri = URI.joinPath(rootUri, '.specify');
		try {
			const stat = await this._fileService.stat(specifyUri);
			if (stat.isDirectory) {
				tags.push('spec-kit', 'specifications');
				summaryParts.push('Gouvernance Spec-Kit active avec cadre de spécifications.');
			}
		} catch { }

		if (summaryParts.length === 0) {
			summaryParts.push(`Dossier de projet : ${projectName}`);
		}

		return {
			name: projectName,
			summary: summaryParts.join(' | '),
			tags,
		};
	}
}

registerWorkbenchContribution2(
	ProjectMemoryBootstrapContribution.ID,
	ProjectMemoryBootstrapContribution,
	WorkbenchPhase.AfterRestored
);

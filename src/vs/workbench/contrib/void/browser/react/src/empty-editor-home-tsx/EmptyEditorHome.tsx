/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import { useAccessor, useIsDark } from '../util/services.js';
import { VOID_CTRL_L_ACTION_ID } from '../../../actionIDs.js';
import { CodeenLogoFull, CODEEN_ID_SVG } from '../util/CodeenWordmark.js';
import {
	FolderOpen,
	FilePlus,
	GitBranch,
	Zap,
	CheckCircle2
} from 'lucide-react';

import '../styles.css';

/**
 * Carte d'action "Coder avec l'IA" avec identité officielle Codeen
 */
const CodeWithAICard: React.FC<{
	onClick: () => void;
	keyLabel: string;
	className?: string;
}> = ({ onClick, keyLabel, className = '' }) => {
	return (
		<div
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			}}
			className={`flex items-center justify-between p-3 rounded-sm bg-surface-panel/90 hover:bg-surface-elevated text-text-primary transition-all group text-left shadow-md border border-primary/25 hover:border-primary/50 cursor-pointer ${className}`}
		>
			<div className="flex items-center gap-3.5 min-w-0">
				<div className="w-9 h-9 rounded-sm bg-primary/15 text-primary flex items-center justify-center border border-primary/30 shrink-0 p-1.5 group-hover:scale-105 transition-transform">
					<img
						src={CODEEN_ID_SVG}
						alt="Codeen"
						className="w-full h-full object-contain select-none pointer-events-none"
					/>
				</div>
				<div className="flex flex-col min-w-0">
					<span className="text-sm font-semibold text-primary group-hover:brightness-110 transition-colors">
						Coder avec l'IA
					</span>
					<span className="text-xs text-text-secondary truncate">
						Écrivez vos prompts et laissez l'IA concevoir
					</span>
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0 ml-3">
				<span className="font-mono text-[10.5px] text-text-muted">
					{keyLabel || 'Ctrl+L'}
				</span>
				<span className="px-2.5 py-1 text-xs font-medium text-surface-base bg-primary group-hover:bg-primary-hover rounded-sm shadow-xs transition-colors pointer-events-none">
					Cliquez ici
				</span>
			</div>
		</div>
	);
};

export const EmptyEditorHome = () => {
	const isDark = useIsDark();
	const accessor = useAccessor();
	const keybindingService = accessor.get('IKeybindingService');
	const commandService = accessor.get('ICommandService');
	const workspaceContextService = accessor.get('IWorkspaceContextService');

	// Détection réactive de l'état : Workspace / Dossier ouvert ou non
	const [hasWorkspace, setHasWorkspace] = useState<boolean>(() => {
		try {
			const state = workspaceContextService?.getWorkbenchState ? workspaceContextService.getWorkbenchState() : 1;
			const folders = workspaceContextService?.getWorkspace?.()?.folders || [];
			return state !== 1 && folders.length > 0;
		} catch {
			return false;
		}
	});

	useEffect(() => {
		const updateWorkspace = () => {
			try {
				const state = workspaceContextService?.getWorkbenchState ? workspaceContextService.getWorkbenchState() : 1;
				const folders = workspaceContextService?.getWorkspace?.()?.folders || [];
				setHasWorkspace(state !== 1 && folders.length > 0);
			} catch {
				setHasWorkspace(false);
			}
		};

		updateWorkspace();

		const d1 = workspaceContextService?.onDidChangeWorkbenchState?.(updateWorkspace);
		const d2 = workspaceContextService?.onDidChangeWorkspaceFolders?.(updateWorkspace);

		return () => {
			d1?.dispose?.();
			d2?.dispose?.();
		};
	}, [workspaceContextService]);

	// Mise à jour réactive des raccourcis clavier
	const [, setKeybindingVersion] = useState(0);
	useEffect(() => {
		const listener = keybindingService?.onDidUpdateKeybindings?.(() => setKeybindingVersion(v => v + 1));
		return () => { listener?.dispose?.(); };
	}, [keybindingService]);

	const getKeyLabel = (commandId: string, fallback?: string): string => {
		return keybindingService?.lookupKeybinding?.(commandId)?.getLabel() ?? fallback ?? '';
	};

	const handleOpenAIChat = async () => {
		try {
			await commandService.executeCommand('void.sidebar.open');
		} catch {
			await commandService.executeCommand(VOID_CTRL_L_ACTION_ID);
		}
	};

	return (
		<div
			className={`@@void-scope ${isDark ? 'dark' : ''} h-full w-full overflow-y-auto bg-surface-base text-text-primary select-none`}
			style={{ height: '100%', maxHeight: '100%', overflowY: 'auto' }}
		>
			<div className="min-h-full w-full flex flex-col items-center justify-center relative px-6 py-12">
				{/* Ambient Radial Glow Accent Behind Logo */}
				<div className="absolute w-[520px] h-[360px] bg-gradient-to-tr from-primary/10 via-agent-cyan/5 to-transparent blur-[120px] rounded-full pointer-events-none -top-10" />

				<div className="my-auto w-full max-w-2xl flex flex-col items-center relative z-10">
					{/* Official Codeen Identity: Logo Agrandie */}
					<div className="flex flex-col items-center text-center select-none">
						<CodeenLogoFull size="hero" style={{ height: '92px' }} />

						{/* Slogan officiel pour les développeurs */}
						<div className="mt-4 flex flex-col items-center">
							<p
								className="text-sm md:text-base text-text-secondary font-medium tracking-normal text-center max-w-xl"
								style={{ fontFamily: 'Outfit, sans-serif' }}
							>
								Un éditeur de code conçu spécialement pour les Africains
							</p>
						</div>
					</div>

					{/* ─── DEUX ÉTATS DE L'ÉDITEUR VIDE ─── */}
					{hasWorkspace ? (
						/* ÉTAT 2 : Un dossier / workspace EST ouvert -> Affichage minimaliste ultra-zen */
						<div className="w-full max-w-xl mt-9 flex flex-col items-stretch">
							<CodeWithAICard
								onClick={handleOpenAIChat}
								keyLabel={getKeyLabel(VOID_CTRL_L_ACTION_ID, 'Ctrl+L')}
							/>
						</div>
					) : (
						/* ÉTAT 1 : Aucun dossier / workspace ouvert -> Quick Actions bien centrées */
						<div className="w-full max-w-xl mt-9 bg-surface-elevated/70 backdrop-blur-md rounded-sm p-5 border border-border-hairline flex flex-col gap-3 shadow-xl">
							{/* Quick Actions Header (sans badge v1.99) */}
							<div className="flex items-center gap-2 pb-2 border-b border-border-hairline">
								<Zap className="w-4 h-4 text-primary" />
								<span
									className="font-semibold text-sm text-on-surface"
									style={{ fontFamily: 'Outfit, sans-serif' }}
								>
									Quick Actions
								</span>
							</div>

							<div className="flex flex-col gap-1.5">
								{/* Item: Open Folder */}
								<button
									type="button"
									onClick={() => commandService.executeCommand('workbench.action.files.openFolder')}
									className="flex items-center justify-between p-2.5 rounded-sm hover:bg-surface-hover text-text-primary transition-all group text-left cursor-pointer border border-transparent hover:border-border-hairline"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-8 h-8 rounded-sm bg-surface-panel flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-border-hairline">
											<FolderOpen className="w-4 h-4" />
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
												Open Folder / Workspace
											</span>
											<span className="text-xs text-text-muted truncate">
												Choose existing directory on your filesystem
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary bg-surface-panel px-2 py-1 rounded shadow-sm border border-border-hairline shrink-0 ml-2">
										<span>{getKeyLabel('workbench.action.files.openFolder', 'Ctrl+O')}</span>
									</div>
								</button>

								{/* Item: Clone Git Repo */}
								<button
									type="button"
									onClick={() => commandService.executeCommand('git.clone')}
									className="flex items-center justify-between p-2.5 rounded-sm hover:bg-surface-hover text-text-primary transition-all group text-left cursor-pointer border border-transparent hover:border-border-hairline"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-8 h-8 rounded-sm bg-surface-panel flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-border-hairline">
											<GitBranch className="w-4 h-4" />
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
												Clone Git Repository
											</span>
											<span className="text-xs text-text-muted truncate">
												Clone from GitHub, GitLab, or remote URL
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary bg-surface-panel px-2 py-1 rounded shadow-sm border border-border-hairline shrink-0 ml-2">
										<span>{getKeyLabel('git.clone', 'Ctrl+Shift+G')}</span>
									</div>
								</button>

								{/* Item: Scratchpad */}
								<button
									type="button"
									onClick={() => commandService.executeCommand('workbench.action.files.newUntitledFile')}
									className="flex items-center justify-between p-2.5 rounded-sm hover:bg-surface-hover text-text-primary transition-all group text-left cursor-pointer border border-transparent hover:border-border-hairline"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-8 h-8 rounded-sm bg-surface-panel flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-border-hairline">
											<FilePlus className="w-4 h-4" />
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
												New Scratchpad File
											</span>
											<span className="text-xs text-text-muted truncate">
												Create an ephemeral in-memory draft buffer
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary bg-surface-panel px-2 py-1 rounded-sm shadow-sm border border-border-hairline shrink-0 ml-2">
										<span>{getKeyLabel('workbench.action.files.newUntitledFile', 'Ctrl+N')}</span>
									</div>
								</button>

								{/* Item: Coder avec l'IA */}
								<CodeWithAICard
									onClick={handleOpenAIChat}
									keyLabel={getKeyLabel(VOID_CTRL_L_ACTION_ID, 'Ctrl+L')}
								/>
							</div>
						</div>
					)}

					{/* Footer minimaliste et épuré */}
					<div className="mt-10 flex items-center justify-center gap-3 text-center font-mono text-[11px] text-text-muted relative z-10">
						<span className="text-text-secondary font-medium">Codeen v1.99.3</span>
						<span className="text-border-subtle">·</span>
						<span
							onClick={() => commandService.executeCommand('workbench.action.openDocumentation')}
							className="text-text-secondary hover:text-primary cursor-pointer transition-colors"
						>
							Documentation
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

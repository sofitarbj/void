/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { h, getActiveWindow } from '../../../../base/browser/dom.js';
import { mountTokenUsageDialog } from './react/out/void-token-usage-tsx/index.js';
import { OPEN_TOKEN_USAGE_DIALOG_COMMAND_ID } from './tokenUsageStatusBar.js';

export class TokenUsageDialogContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.codeenTokenUsageDialog';

	private _mountResult: { rerender: (props?: any) => void; dispose: () => void } | undefined;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();
		this._initialize();
		this._registerCommand();
	}

	private _initialize(): void {
		const targetWindow = getActiveWindow();
		const workbench = targetWindow.document.querySelector('.monaco-workbench');
		if (!workbench) return;

		const container = h('div.codeen-token-usage-dialog-container').root;
		container.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
		workbench.appendChild(container);

		const handleClose = () => {
			container.style.pointerEvents = 'none';
		};

		this.instantiationService.invokeFunction((accessor: ServicesAccessor) => {
			this._mountResult = mountTokenUsageDialog(container, accessor, { isOpen: false, onClose: handleClose }) ?? undefined;
			if (this._mountResult?.dispose) {
				this._register(toDisposable(this._mountResult.dispose));
			}
		});

		this._register(toDisposable(() => {
			container.parentElement?.removeChild(container);
		}));

		this._register(
			CommandsRegistry.registerCommand(OPEN_TOKEN_USAGE_DIALOG_COMMAND_ID, () => {
				container.style.pointerEvents = 'auto';
				this._mountResult?.rerender({ isOpen: true, _ts: Date.now(), onClose: handleClose });
			})
		);
	}

	private _registerCommand(): void {
		// Command registered inside _initialize with container reference
	}
}

registerWorkbenchContribution2(TokenUsageDialogContribution.ID, TokenUsageDialogContribution, WorkbenchPhase.AfterRestored);

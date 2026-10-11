/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { ITokenUsageService, formatTokenCount, formatDollarCount } from '../common/tokenUsageService.js';
import { localize } from '../../../../nls.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';

export const ITokenUsageStatusBarService = createDecorator<ITokenUsageStatusBarService>('tokenUsageStatusBarService');

export interface ITokenUsageStatusBarService {
	readonly _serviceBrand: undefined;
}

export const OPEN_TOKEN_USAGE_DIALOG_COMMAND_ID = 'codeen.openTokenUsageDialog';

const TOKEN_USAGE_STATUS_BAR_ID = 'codeen.tokenUsage';

export class TokenUsageStatusBarService extends Disposable implements ITokenUsageStatusBarService, IWorkbenchContribution {
	static readonly ID = 'codeen.tokenUsageStatusBar';
	readonly _serviceBrand: undefined;

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@ITokenUsageService private readonly tokenUsageService: ITokenUsageService,
	) {
		super();

		const accessor = this.statusbarService.addEntry(
			{
				name: localize('codeenTokenUsage', 'Codeen Tokens & Budget'),
				text: this.getTokenText(),
				ariaLabel: localize('codeenTokenUsageAria', 'Tokens utilisés : {0}, Coût estimé : {1}', formatTokenCount(this.tokenUsageService.getTotalTokensUsed()), formatDollarCount(this.tokenUsageService.getEstimatedCost())),
				tooltip: localize('codeenTokenUsageTooltip', 'Cliquez pour ouvrir le tableau de bord de consommation et de budget'),
				command: OPEN_TOKEN_USAGE_DIALOG_COMMAND_ID,
			},
			TOKEN_USAGE_STATUS_BAR_ID,
			StatusbarAlignment.LEFT,
			100
		);

		this._register(
			this.tokenUsageService.onTokenUsageChanged(() => {
				accessor.update({
					name: localize('codeenTokenUsage', 'Codeen Tokens & Budget'),
					text: this.getTokenText(),
					ariaLabel: localize('codeenTokenUsageAria', 'Tokens utilisés : {0}, Coût estimé : {1}', formatTokenCount(this.tokenUsageService.getTotalTokensUsed()), formatDollarCount(this.tokenUsageService.getEstimatedCost())),
					tooltip: localize('codeenTokenUsageTooltip', 'Cliquez pour ouvrir le tableau de bord de consommation et de budget'),
					command: OPEN_TOKEN_USAGE_DIALOG_COMMAND_ID,
				});
			})
		);
	}

	private getTokenText(): string {
		const tokens = this.tokenUsageService.getTotalTokensUsed();
		const cost = this.tokenUsageService.getEstimatedCost();
		return `$(flame) ${formatTokenCount(tokens)} (${formatDollarCount(cost)})`;
	}
}

registerWorkbenchContribution2(TokenUsageStatusBarService.ID, TokenUsageStatusBarService, WorkbenchPhase.AfterRestored);

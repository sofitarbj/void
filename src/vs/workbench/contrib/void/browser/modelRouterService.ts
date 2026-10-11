/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IVoidSettingsService } from '../common/voidSettingsService.js';
import { ChatMode, ModelSelection } from '../common/voidSettingsTypes.js';

/**
 * Model Router Service — intelligent model selection based on task complexity.
 *
 * Classifies incoming tasks and routes to the most cost-effective model.
 * Users configure primary + economy models in settings; the router picks
 * between them based on heuristics.
 */

export type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';

export interface TaskClassification {
	complexity: TaskComplexity;
	requiresTools: boolean;
	estimatedTurns: number;
}

export interface IModelRouterService {
	readonly _serviceBrand: undefined;

	classifyTask(params: {
		userMessage: string;
		chatMode: ChatMode;
		turnNumber: number;
		mentionedFiles: number;
		hasVisibleError: boolean;
	}): TaskClassification;

	selectModel(params: {
		classification: TaskClassification;
		chatMode: ChatMode;
		currentModelSelection: ModelSelection;
	}): ModelSelection;

	getNextFallback(params: {
		currentModel: ModelSelection;
		errorType: 'rate-limit' | 'context-length' | 'timeout' | 'unknown';
	}): ModelSelection | null;
}

export const IModelRouterService = createDecorator<IModelRouterService>('modelRouterService');


const COMPLEX_KEYWORDS = /\b(refactor|architect|design|restructure|migrate|rewrite|overhaul|implement feature|create system|build from scratch)\b/i;
const MODERATE_KEYWORDS = /\b(fix|debug|update|modify|change|add|remove|move|rename|test|create|explain)\b/i;
const TRIVIAL_INDICATORS = /^(hi|hello|bonjour|salut|hey|ok|oui|yes|non|no|thanks|merci)\s*[.!?]?\s*$/i;


class ModelRouterService extends Disposable implements IModelRouterService {
	readonly _serviceBrand: undefined;

	constructor(
		@IVoidSettingsService private readonly _settingsService: IVoidSettingsService,
	) {
		super();
	}

	classifyTask(params: {
		userMessage: string;
		chatMode: ChatMode;
		turnNumber: number;
		mentionedFiles: number;
		hasVisibleError: boolean;
	}): TaskClassification {
		const { userMessage, chatMode, turnNumber, mentionedFiles, hasVisibleError } = params;
		const msgLen = userMessage.length;

		if (TRIVIAL_INDICATORS.test(userMessage) || msgLen < 15) {
			return { complexity: 'trivial', requiresTools: false, estimatedTurns: 1 };
		}

		if (chatMode === 'normal' && !hasVisibleError && mentionedFiles === 0) {
			if (msgLen < 100 && !COMPLEX_KEYWORDS.test(userMessage)) {
				return { complexity: 'simple', requiresTools: false, estimatedTurns: 1 };
			}
		}

		let score = 0;

		if (COMPLEX_KEYWORDS.test(userMessage)) score += 3;
		else if (MODERATE_KEYWORDS.test(userMessage)) score += 1;

		if (mentionedFiles > 3) score += 2;
		else if (mentionedFiles > 0) score += 1;

		if (chatMode === 'agent') score += 2;
		else if (chatMode === 'gather') score += 1;

		if (turnNumber > 5) score += 1;
		if (msgLen > 500) score += 1;
		if (hasVisibleError) score += 1;

		let complexity: TaskComplexity;
		if (score === 0) complexity = 'trivial';
		else if (score <= 2) complexity = 'simple';
		else if (score <= 4) complexity = 'moderate';
		else if (score <= 7) complexity = 'complex';
		else complexity = 'expert';

		const requiresTools = chatMode === 'agent' || chatMode === 'gather';
		const estimatedTurns = complexity === 'trivial' ? 1
			: complexity === 'simple' ? 1
				: complexity === 'moderate' ? 3
					: complexity === 'complex' ? 5
						: 8;

		return { complexity, requiresTools, estimatedTurns };
	}

	selectModel(params: {
		classification: TaskClassification;
		chatMode: ChatMode;
		currentModelSelection: ModelSelection;
	}): ModelSelection {
		const { classification, currentModelSelection } = params;
		const globalSettings = this._settingsService.state.globalSettings;

		const routerConfig = (globalSettings as any).modelRouter;
		if (!routerConfig?.enabled) {
			return currentModelSelection;
		}

		const { complexity } = classification;

		if (complexity === 'trivial' || complexity === 'simple') {
			if (routerConfig.economyModel) {
				return routerConfig.economyModel;
			}
		}

		if (complexity === 'complex' || complexity === 'expert') {
			if (routerConfig.primaryModel) {
				return routerConfig.primaryModel;
			}
		}

		return currentModelSelection;
	}

	getNextFallback(params: {
		currentModel: ModelSelection;
		errorType: 'rate-limit' | 'context-length' | 'timeout' | 'unknown';
	}): ModelSelection | null {
		const globalSettings = this._settingsService.state.globalSettings;
		const routerConfig = (globalSettings as any).modelRouter;

		if (!routerConfig?.fallbackModels || routerConfig.fallbackModels.length === 0) {
			return null;
		}

		const fallbacks: ModelSelection[] = routerConfig.fallbackModels;
		const currentKey = `${params.currentModel.providerName}/${params.currentModel.modelName}`;

		for (const fb of fallbacks) {
			const fbKey = `${fb.providerName}/${fb.modelName}`;
			if (fbKey !== currentKey) {
				return fb;
			}
		}

		return null;
	}
}

registerSingleton(IModelRouterService, ModelRouterService, InstantiationType.Delayed);

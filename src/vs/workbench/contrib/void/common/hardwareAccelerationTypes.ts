/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen AI. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { isMacintosh } from '../../../../base/common/platform.js';

export const APPLE_FOUNDATION_MODELS_DEFAULT_ENDPOINT = 'http://127.0.0.1:9999';
export const MLX_DEFAULT_ENDPOINT = 'http://127.0.0.1:8080';

export const APPLE_FOUNDATION_CHAT_MODEL_IDS = ['foundation', 'system', 'pcc'] as const;

export interface HardwareAccelerationStatus {
	isAppleSilicon: boolean;
	hasMetalSupport: boolean;
	hasWebGPUSupport: boolean;
	recommendedLocalProvider: 'ollama' | 'mlx' | 'appleFoundationModels' | 'none';
}

export const detectHardwareAcceleration = (hasWebGPUSupport: boolean = false): HardwareAccelerationStatus => {
	const isApple = isMacintosh;
	return {
		isAppleSilicon: isApple,
		hasMetalSupport: isApple,
		hasWebGPUSupport,
		recommendedLocalProvider: isApple ? 'appleFoundationModels' : 'ollama',
	};
};

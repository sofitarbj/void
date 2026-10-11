/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import React from 'react';
import { CODEEN_FULL_PNG, CODEEN_ID_PNG, CODEEN_ID_SVG } from './CodeenBrandAssets.js';

export const CODEEN_PRIMARY_COLOR = '#00dc82';

export { CODEEN_FULL_PNG, CODEEN_ID_PNG, CODEEN_ID_SVG };

/**
 * Pictogramme officiel Codeen issu directement de brand/codeenid.png
 */
export const CodeenPictogram: React.FC<{
	size?: number;
	className?: string;
	style?: React.CSSProperties;
}> = ({
	size = 24,
	className = '',
	style = {},
}) => {
	return (
		<img
			src={CODEEN_ID_PNG}
			alt="Codeen"
			className={`select-none pointer-events-none object-contain shrink-0 ${className}`}
			style={{ width: `${size}px`, height: `${size}px`, ...style }}
		/>
	);
};

/**
 * Wordmark officiel Codeen issu directement de brand/codeenfull.png
 */
export const CodeenWordmark: React.FC<{
	size?: 'sm' | 'md' | 'lg' | 'hero';
	className?: string;
	style?: React.CSSProperties;
}> = ({
	size = 'md',
	className = '',
	style = {},
}) => {
	const heightPx = size === 'hero' ? 60 : size === 'lg' ? 34 : size === 'sm' ? 18 : 26;

	return (
		<img
			src={CODEEN_FULL_PNG}
			alt="Codeen"
			className={`select-none pointer-events-none object-contain inline-block shrink-0 ${className}`}
			style={{ height: `${heightPx}px`, width: 'auto', ...style }}
		/>
	);
};

/**
 * Logo officiel complet Codeen issu directement de brand/codeenfull.png
 */
export const CodeenLogoFull: React.FC<{
	size?: 'sm' | 'md' | 'lg' | 'hero';
	className?: string;
	pictogramSize?: number;
	style?: React.CSSProperties;
}> = ({
	size = 'md',
	className = '',
	style = {},
}) => {
	const heightPx = size === 'hero' ? 76 : size === 'lg' ? 40 : size === 'sm' ? 20 : 28;

	return (
		<img
			src={CODEEN_FULL_PNG}
			alt="Codeen"
			className={`select-none pointer-events-none object-contain inline-block shrink-0 ${className}`}
			style={{ height: `${heightPx}px`, width: 'auto', ...style }}
		/>
	);
};

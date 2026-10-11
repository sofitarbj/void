/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import React from 'react';

interface CodeenLogoProps {
	size?: number;
	className?: string;
	variant?: 'mark' | 'full';
	isThinking?: boolean;
}

/**
 * Nouveau logo officiel Codeen :
 * - Variante 'mark' : Les deux "e" avec le slash vert (#00DC82) au milieu et le second "e" inversé à 180° (e/ǝ)
 * - Variante 'full' : La typographie complète Outfit 600 : "cod" + "e" + "/" (#00DC82) + "ǝ" (inversé) + "n"
 */
export const CodeenLogo: React.FC<CodeenLogoProps> = ({
	size = 32,
	className = '',
	variant = 'mark',
	isThinking = false
}) => {
	if (variant === 'full') {
		return (
			<div
				className={`inline-flex items-baseline select-none font-semibold leading-none ${className} ${isThinking ? 'animate-pulse' : ''}`}
				style={{
					fontFamily: "'Outfit', sans-serif",
					letterSpacing: '-0.065em',
					fontSize: `${size}px`
				}}
			>
				<span className="text-current">cod</span>
				<span className="text-current">e</span>
				<span
					className="text-[#00DC82] inline-block"
					style={{
						marginLeft: '-0.08em',
						marginRight: '-0.08em',
						transform: 'translateY(-0.005em) scaleY(0.68)',
						transformOrigin: 'center center',
						lineHeight: 1
					}}
				>
					/
				</span>
				<span
					className="text-current inline-block"
					style={{
						transform: 'translateY(0.275em) rotate(180deg)',
						transformOrigin: '50% 50%',
						verticalAlign: 'baseline'
					}}
				>
					e
				</span>
				<span className="text-current">n</span>
			</div>
		);
	}

	// Symbole compact 'mark' : e / ǝ
	return (
		<svg
			width={size}
			height={Math.round((size * 32) / 36)}
			viewBox="0 0 36 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${className} ${isThinking ? 'animate-pulse' : ''}`}
			role="img"
			aria-label="Codeen Logo (e/ǝ)"
		>
			{/* Premier "e" */}
			<g transform="translate(1, 0)" fill="currentColor">
				<path d="M 12 16.5 L 3 16.5 C 3.15 13.8 5.1 11.5 8 11.5 C 10.9 11.5 12.7 13.6 12.8 16 M 3.1 18 C 3.5 21.3 6.1 23 8.7 23 C 10.7 23 12.1 22.1 12.8 20.8 L 14.8 21.8 C 13.6 23.9 11.4 25.2 8.5 25.2 C 4.2 25.2 0.8 22 0.8 17.5 C 0.8 12.8 4.2 9.5 8.5 9.5 C 12.9 9.5 15.1 13 14.9 18 L 12 18 Z M 3.2 14.6 L 12.6 14.6 C 12.2 12.7 10.7 11.6 8.4 11.6 C 6 11.6 4 12.8 3.2 14.6 Z" />
			</g>

			{/* Slash vert Codeen (#00DC82) */}
			<g transform="translate(18, 17) scale(1, 0.72) translate(-18, -17)">
				<line x1="15.2" y1="26" x2="20.8" y2="8" stroke="#00DC82" strokeWidth="2.6" strokeLinecap="round" />
			</g>

			{/* Deuxième "e" inversé à 180° (ǝ) */}
			<g transform="rotate(180, 27.5, 17.3)" fill="currentColor">
				<path d="M 12 16.5 L 3 16.5 C 3.15 13.8 5.1 11.5 8 11.5 C 10.9 11.5 12.7 13.6 12.8 16 M 3.1 18 C 3.5 21.3 6.1 23 8.7 23 C 10.7 23 12.1 22.1 12.8 20.8 L 14.8 21.8 C 13.6 23.9 11.4 25.2 8.5 25.2 C 4.2 25.2 0.8 22 0.8 17.5 C 0.8 12.8 4.2 9.5 8.5 9.5 C 12.9 9.5 15.1 13 14.9 18 L 12 18 Z M 3.2 14.6 L 12.6 14.6 C 12.2 12.7 10.7 11.6 8.4 11.6 C 6 11.6 4 12.8 3.2 14.6 Z" />
			</g>
		</svg>
	);
};

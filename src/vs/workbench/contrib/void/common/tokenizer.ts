/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import { importAMDNodeModule } from '../../../../amdX.js';

type GptTokenizerModule = {
	countTokens: (text: string) => number;
};

let countTokensFn: GptTokenizerModule['countTokens'] | undefined;

// Initialisation asynchrone du module de tokenisation hors-ligne si disponible
const whenLoaded = importAMDNodeModule<GptTokenizerModule>('gpt-tokenizer', 'dist/o200k_base.js')
	.then(mod => {
		if (mod && typeof mod.countTokens === 'function') {
			countTokensFn = mod.countTokens;
		}
	})
	.catch(() => {
		// En cas d'absence du module, le fallback heuristique synchrone ci-dessous prend le relais
	});

const FALLBACK_CHARS_PER_TOKEN = 4;

/**
 * Estimation synchrone et rapide du nombre de tokens (BPE o200k_base ou ratio heuristique).
 * Conçu pour être invoqué dans des chemins critiques sans bloquer la boucle d'événements.
 */
export const estimateTokens = (text: string): number => {
	if (!text) {
		return 0;
	}
	if (countTokensFn) {
		try {
			return countTokensFn(text);
		} catch {
			// fallback en cas d'erreur ponctuelle
		}
	}
	return Math.ceil(text.length / FALLBACK_CHARS_PER_TOKEN);
};

/**
 * Permet aux appelants asynchrones d'attendre le chargement complet du dictionnaire BPE.
 */
export const whenTokenizerReady = (): Promise<void> => whenLoaded;

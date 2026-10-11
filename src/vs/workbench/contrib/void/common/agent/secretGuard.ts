/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { LLMChatMessage, LLMFIMMessage } from '../sendLLMMessageTypes.js';

const SECRET_PATTERNS: { name: string; regex: RegExp; replacement: string }[] = [
	// Clés d'API OpenAI
	{
		name: 'OpenAI API Key',
		regex: /\bsk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{20}\b/g,
		replacement: '[MASKED_OPENAI_KEY]'
	},
	{
		name: 'Generic OpenAI/OpenRouter Key',
		regex: /\bsk-[a-zA-Z0-9]{48}\b/g,
		replacement: '[MASKED_API_KEY]'
	},
	// Clés d'API Anthropic Claude
	{
		name: 'Anthropic API Key',
		regex: /\bsk-ant-sid01-[a-zA-Z0-9-_]{90,100}\b/g,
		replacement: '[MASKED_ANTHROPIC_KEY]'
	},
	// Clés d'API Google Gemini
	{
		name: 'Google Gemini API Key',
		regex: /\bAIzaSy[a-zA-Z0-9-_]{33}\b/g,
		replacement: '[MASKED_GEMINI_KEY]'
	},
	// JWT et En-tête Bearer
	{
		name: 'Authorization Bearer Token',
		regex: /(?:Authorization\s*:\s*Bearer\s+)(eyJ[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_=]*)/gi,
		replacement: 'Authorization: Bearer [MASKED_JWT_TOKEN]'
	},
	// Clés privées RSA / PEM
	{
		name: 'Private Key PEM',
		regex: /-----BEGIN (?:RSA |EC |dsa |)?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |EC |dsa |)?PRIVATE KEY-----/g,
		replacement: '[MASKED_PRIVATE_KEY]'
	},
	// Variables .env sensibles (mots de passe, URLs de base de données, tokens)
	{
		name: 'Database URL Connection String',
		regex: /(mongodb\+srv:\/\/|postgres:\/\/|mysql:\/\/)[a-zA-Z0-9_.-]+:[a-zA-Z0-9_%.-]+@[a-zA-Z0-9_.-]+:[0-9]+\/[a-zA-Z0-9_.-]+/gi,
		replacement: '$1[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]'
	},
	{
		name: 'Env Variable Secret Assignment',
		regex: /(?:PASSWORD|SECRET|TOKEN|KEY|PWD|AUTH|DATABASE_URL)\s*=\s*([^\n\r\t "'`]+)/gi,
		replacement: '=$1' // Le groupe 1 capturé contient la valeur du secret à masquer
	}
];

export class SecretGuard {
	/**
	 * Filtre et masque tout texte contenant des secrets identifiables avant de l'envoyer au LLM.
	 */
	static mask(text: string): string {
		if (!text) {
			return text;
		}

		let maskedText = text;

		for (const pattern of SECRET_PATTERNS) {
			if (pattern.name === 'Env Variable Secret Assignment') {
				// Gestion spécifique pour ne pas corrompre le nom de la variable mais masquer uniquement sa valeur
				maskedText = maskedText.replace(pattern.regex, (match, val) => {
					if (val && val.length > 3) {
						return match.replace(val, `[MASKED_${pattern.name.toUpperCase()}]`);
					}
					return match;
				});
			} else {
				maskedText = maskedText.replace(pattern.regex, pattern.replacement);
			}
		}

		return maskedText;
	}

	/**
	 * Masque les secrets dans un message de chat.
	 */
	static maskChatMessage(msg: LLMChatMessage): LLMChatMessage {
		if (!msg) return msg;

		const masked = { ...msg } as any;

		if (typeof masked.content === 'string') {
			masked.content = SecretGuard.mask(masked.content);
		} else if (Array.isArray(masked.content)) {
			masked.content = masked.content.map((item: any) => {
				if (typeof item === 'string') {
					return SecretGuard.mask(item);
				} else if (item && typeof item === 'object') {
					const newItem = { ...item };
					if (typeof newItem.text === 'string') {
						newItem.text = SecretGuard.mask(newItem.text);
					}
					if (typeof newItem.content === 'string') {
						newItem.content = SecretGuard.mask(newItem.content);
					}
					return newItem;
				}
				return item;
			});
		}

		if (Array.isArray(masked.parts)) {
			masked.parts = masked.parts.map((part: any) => {
				if (part && typeof part === 'object') {
					const newPart = { ...part };
					if (typeof newPart.text === 'string') {
						newPart.text = SecretGuard.mask(newPart.text);
					}
					if (newPart.functionResponse && typeof newPart.functionResponse.response === 'object') {
						const response = { ...newPart.functionResponse.response };
						if (typeof response.output === 'string') {
							response.output = SecretGuard.mask(response.output);
							newPart.functionResponse = {
								...newPart.functionResponse,
								response
							};
						}
					}
					return newPart;
				}
				return part;
			});
		}

		return masked;
	}

	/**
	 * Masque les secrets dans un message FIM (Fill-in-the-Middle).
	 */
	static maskFIMMessage(msg: LLMFIMMessage): LLMFIMMessage {
		if (!msg) return msg;
		return {
			...msg,
			prefix: SecretGuard.mask(msg.prefix),
			suffix: SecretGuard.mask(msg.suffix),
		};
	}
}

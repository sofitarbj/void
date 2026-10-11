/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { resolve, sep } from '../../../../../base/common/path.js';

/**
 * Valide de façon sécurisée (Fail-Closed) si un chemin cible se trouve dans le workspace.
 * Gère les fichiers/dossiers existants ainsi que les fichiers inexistants (à créer).
 */
export function isPathInWorkspace(targetPath: string, workspacePath: string): boolean {
	try {
		const resolvedTarget = resolve(targetPath);
		const resolvedWorkspace = resolve(workspacePath);

		// Détection de la casse système
		const isCaseInsensitive = typeof process !== 'undefined' && (process.platform === 'win32' || process.platform === 'darwin');
		const tPath = isCaseInsensitive ? resolvedTarget.toLowerCase() : resolvedTarget;
		const wPath = isCaseInsensitive ? resolvedWorkspace.toLowerCase() : resolvedWorkspace;

		// Confinement strict (containment structurelle)
		return tPath.startsWith(wPath + sep) || tPath === wPath;
	} catch {
		return false; // Fail-closed par défaut
	}
}

export type Decision = 'APPROVE' | 'DENY' | 'ASK_USER';

export interface Policy {
	name: string;
	tool: string; // ex: 'write_to_file', 'server/*', '*'
	decision: Decision;
	when?: (args: Record<string, any>) => boolean;
}

export class PolicyEngine {
	private sortedPolicies: Policy[] = [];

	constructor(policies: Policy[]) {
		this.sortedPolicies = this.sortPolicies(policies);
	}

	/**
	 * Trie les règles de politiques selon leur ordre de priorité (décroissant) :
	 * Specific Deny > Specific Ask > Specific Allow >
	 * Prefix Deny > Prefix Ask > Prefix Allow >
	 * Wildcard Deny > Wildcard Ask > Wildcard Allow
	 */
	private sortPolicies(policies: Policy[]): Policy[] {
		const isWildcard = (tool: string) => tool === '*';
		const isPrefix = (tool: string) => tool.endsWith('/*');
		const isSpecific = (tool: string) => !isWildcard(tool) && !isPrefix(tool);

		const buckets: Policy[][] = Array.from({ length: 9 }, () => []);

		for (const p of policies) {
			if (isSpecific(p.tool)) {
				if (p.decision === 'DENY') buckets[0].push(p);
				else if (p.decision === 'ASK_USER') buckets[1].push(p);
				else buckets[2].push(p);
			} else if (isPrefix(p.tool)) {
				if (p.decision === 'DENY') buckets[3].push(p);
				else if (p.decision === 'ASK_USER') buckets[4].push(p);
				else buckets[5].push(p);
			} else { // Wildcard
				if (p.decision === 'DENY') buckets[6].push(p);
				else if (p.decision === 'ASK_USER') buckets[7].push(p);
				else buckets[8].push(p);
			}
		}

		return buckets.flat();
	}

	/**
	 * Évalue une demande d'outil avec ses arguments selon les règles définies.
	 * Retourne la première décision correspondante ou DENY par défaut (Fail-Closed).
	 */
	evaluate(toolName: string, args: Record<string, any>): Decision {
		for (const policy of this.sortedPolicies) {
			const matchesTool = this.matchesTarget(policy.tool, toolName);
			if (matchesTool) {
				try {
					if (!policy.when || policy.when(args)) {
						return policy.decision;
					}
				} catch (error) {
					console.error(`Erreur d'évaluation du prédicat de la politique ${policy.name || policy.tool}:`, error);
					return 'DENY'; // Fail-closed en cas de crash du prédicat
				}
			}
		}

		return 'DENY'; // Par défaut, fail-closed
	}

	private matchesTarget(policyTool: string, callTarget: string): boolean {
		if (policyTool === '*') {
			return true;
		}

		if (policyTool.endsWith('/*')) {
			const policyPrefix = policyTool.slice(0, -2); // Retire '/*'
			// Gère le format MCP: 'server_name/tool_name' ou 'mcp_server_name_tool_name'
			if (callTarget.startsWith(policyPrefix)) {
				return true;
			}
			return false;
		}

		return policyTool === callTarget;
	}
}

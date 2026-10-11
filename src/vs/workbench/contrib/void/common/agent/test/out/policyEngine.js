/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
/**
 * Valide de façon sécurisée (Fail-Closed) si un chemin cible se trouve dans le workspace.
 * Gère les fichiers/dossiers existants ainsi que les fichiers inexistants (à créer).
 */
export function isPathInWorkspace(targetPath, workspacePath) {
    try {
        const resolvedTarget = path.resolve(targetPath);
        // Détermination du plus proche parent existant pour résoudre les symlinks/junctions
        let currentPath = resolvedTarget;
        while (!fs.existsSync(currentPath)) {
            const parent = path.dirname(currentPath);
            if (parent === currentPath) {
                // Atteint la racine sans trouver de dossier existant
                break;
            }
            currentPath = parent;
        }
        // Si aucun parent n'existe (ce qui n'arrive jamais en pratique car la racine existe), fail-closed
        if (!fs.existsSync(currentPath)) {
            return false;
        }
        // Résolution canonique (suit les liens symboliques et jonctions)
        const canonicalParent = fs.realpathSync(currentPath);
        const canonicalWorkspace = fs.realpathSync(path.resolve(workspacePath));
        // Résolution du reste du chemin qui n'existe pas encore (calcul purement lexical sur le chemin canonique)
        const relativePart = path.relative(currentPath, resolvedTarget);
        const canonicalTarget = path.resolve(canonicalParent, relativePart);
        // Détection de la casse système
        const isCaseInsensitive = process.platform === 'win32' || process.platform === 'darwin';
        const tPath = isCaseInsensitive ? canonicalTarget.toLowerCase() : canonicalTarget;
        const wPath = isCaseInsensitive ? canonicalWorkspace.toLowerCase() : canonicalWorkspace;
        // Confinement strict (containment structurelle)
        const sep = path.sep;
        return tPath.startsWith(wPath + sep) || tPath === wPath;
    }
    catch {
        return false; // Fail-closed par défaut
    }
}
export class PolicyEngine {
    sortedPolicies = [];
    constructor(policies) {
        this.sortedPolicies = this.sortPolicies(policies);
    }
    /**
     * Trie les règles de politiques selon leur ordre de priorité (décroissant) :
     * Specific Deny > Specific Ask > Specific Allow >
     * Prefix Deny > Prefix Ask > Prefix Allow >
     * Wildcard Deny > Wildcard Ask > Wildcard Allow
     */
    sortPolicies(policies) {
        const isWildcard = (tool) => tool === '*';
        const isPrefix = (tool) => tool.endsWith('/*');
        const isSpecific = (tool) => !isWildcard(tool) && !isPrefix(tool);
        const buckets = Array.from({ length: 9 }, () => []);
        for (const p of policies) {
            if (isSpecific(p.tool)) {
                if (p.decision === 'DENY')
                    buckets[0].push(p);
                else if (p.decision === 'ASK_USER')
                    buckets[1].push(p);
                else
                    buckets[2].push(p);
            }
            else if (isPrefix(p.tool)) {
                if (p.decision === 'DENY')
                    buckets[3].push(p);
                else if (p.decision === 'ASK_USER')
                    buckets[4].push(p);
                else
                    buckets[5].push(p);
            }
            else { // Wildcard
                if (p.decision === 'DENY')
                    buckets[6].push(p);
                else if (p.decision === 'ASK_USER')
                    buckets[7].push(p);
                else
                    buckets[8].push(p);
            }
        }
        return buckets.flat();
    }
    /**
     * Évalue une demande d'outil avec ses arguments selon les règles définies.
     * Retourne la première décision correspondante ou DENY par défaut (Fail-Closed).
     */
    evaluate(toolName, args) {
        for (const policy of this.sortedPolicies) {
            const matchesTool = this.matchesTarget(policy.tool, toolName);
            if (matchesTool) {
                try {
                    if (!policy.when || policy.when(args)) {
                        return policy.decision;
                    }
                }
                catch (error) {
                    console.error(`Erreur d'évaluation du prédicat de la politique ${policy.name || policy.tool}:`, error);
                    return 'DENY'; // Fail-closed en cas de crash du prédicat
                }
            }
        }
        return 'DENY'; // Par défaut, fail-closed
    }
    matchesTarget(policyTool, callTarget) {
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

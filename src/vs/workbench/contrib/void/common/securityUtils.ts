/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

/**
 * Void Security Utils — Terminal Command Classification
 *
 * Classifies shell commands as safe (read-only) or unsafe (mutating/destructive).
 * Used to drive auto-approve logic and prompt warnings.
 */

// Commands that are always safe (read-only, no side effects)
const SAFE_COMMAND_PREFIXES = [
	'cat ', 'cat\t', 'echo ', 'echo\t',
	'ls ', 'ls\t', 'ls\n', 'ls',
	'pwd', 'whoami', 'hostname', 'date', 'uname',
	'which ', 'where ', 'type ',
	'head ', 'tail ', 'wc ', 'grep ', 'find ',
	'git status', 'git log', 'git diff', 'git show', 'git branch', 'git remote',
	'git stash list', 'git tag',
	'npm list', 'npm ls', 'npm outdated', 'npm audit',
	'node --version', 'node -v', 'npm --version', 'npm -v',
	'python --version', 'python3 --version',
	'env', 'printenv', 'set',
	'ps ', 'ps\t', 'ps\n', 'ps',
	'df ', 'du ', 'free ',
	'curl --help', 'wget --help',
	'test ', 'true', 'false',
]

// Command patterns that are always destructive/risky
const UNSAFE_COMMAND_PATTERNS: RegExp[] = [
	/\brm\s+(-[rRfFi]+\s+)?[^-]/,          // rm (with or without flags)
	/\bmkdir\b/,                             // creating directories (side effect)
	/\bmv\b/,                               // move/rename files
	/\bcp\b/,                               // copy files
	/\bchmod\b/,                            // change permissions
	/\bchown\b/,                            // change ownership
	/\bsudo\b/,                             // privilege escalation
	/\bsu\b/,                               // switch user
	/\bkill\b/, /\bkillall\b/,             // kill processes
	/\bshutdown\b/, /\breboot\b/,           // system control
	/\bformat\b/, /\bdiskpart\b/,           // disk operations
	/\bdrop\s+database\b/i,                 // DB destructive ops
	/\btruncate\b/i,
	/\bexport\s+\w+=.*&.*\|/,              // complex shell chains with export
	/\beval\b/,                             // eval (arbitrary code)
	/\bcurl\s+.*\s*\|\s*(?:bash|sh|zsh)/,  // curl | bash pattern
	/\bwget\s+.*\s*\|\s*(?:bash|sh|zsh)/,  // wget | bash pattern
	/>(?!>)\s*\S/,                          // redirect (overwrite file)
	/\bnpm\s+(?:install|uninstall|publish|deprecate|unpublish)\b/, // npm mutating
	/\bpip\s+(?:install|uninstall)\b/,      // pip mutating
	/\bgit\s+(?:push|reset|rebase|merge|cherry-pick|revert)\b/,   // git mutating
	/\bgit\s+commit\b/,                     // git commit
]

export type CommandRiskLevel = 'safe' | 'moderate' | 'destructive'

export type CommandClassification = {
	level: CommandRiskLevel;
	reason: string;
}

/**
 * Classifies a shell command by risk level.
 * - `safe`: read-only, no side effects — can be auto-approved
 * - `moderate`: writes files or installs packages — requires user review
 * - `destructive`: rm, kill, sudo, curl|bash etc. — always requires approval
 */
export function classifyCommand(command: string): CommandClassification {
	if (!command || !command.trim()) {
		return { level: 'safe', reason: 'Empty command' }
	}

	const trimmed = command.trim().toLowerCase()

	// Check destructive patterns first (highest priority)
	for (const pattern of UNSAFE_COMMAND_PATTERNS) {
		if (pattern.test(command)) {
			return {
				level: 'destructive',
				reason: `Matches destructive pattern: ${pattern.source}`
			}
		}
	}

	// Check safe prefixes
	for (const prefix of SAFE_COMMAND_PREFIXES) {
		if (trimmed.startsWith(prefix.toLowerCase().trim()) || trimmed === prefix.toLowerCase().trim()) {
			return { level: 'safe', reason: `Read-only command: ${prefix.trim()}` }
		}
	}

	// Default: moderate (needs user review but not critical)
	return {
		level: 'moderate',
		reason: 'Unknown command — requires user review'
	}
}

/**
 * Returns true if a command should be auto-approved (safe, read-only)
 */
export function isCommandSafeToAutoApprove(command: string): boolean {
	return classifyCommand(command).level === 'safe'
}

/**
 * Returns a warning message for destructive commands (or null if safe)
 */
export function getCommandWarning(command: string): string | null {
	const classification = classifyCommand(command)
	if (classification.level === 'destructive') {
		return `⚠️ Destructive command detected: ${classification.reason}`
	}
	if (classification.level === 'moderate') {
		return `⚡ This command may have side effects.`
	}
	return null
}

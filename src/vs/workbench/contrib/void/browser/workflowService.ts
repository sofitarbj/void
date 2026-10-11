/*--------------------------------------------------------------------------------------
 *  F14: Workflow Service — Slash commands (/test, /doc, /review, /refactor)
 *  Detects slash commands in user input and injects workflow-specific prompts.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export type WorkflowDefinition = {
	command: string;
	label: string;
	description: string;
	systemPrompt: string;
}

export interface IWorkflowService {
	readonly _serviceBrand: undefined;
	getWorkflows(): WorkflowDefinition[];
	findWorkflow(input: string): { workflow: WorkflowDefinition; remainingInput: string } | null;
}

export const IWorkflowService = createDecorator<IWorkflowService>('workflowService');

const BUILTIN_WORKFLOWS: WorkflowDefinition[] = [
	{
		command: '/test',
		label: 'Generate Tests',
		description: 'Generate tests for the specified code.',
		systemPrompt: `You are in TEST GENERATION mode. Focus exclusively on:
1. Identify the testing framework already used in the project (Jest, Vitest, Mocha, pytest, etc).
2. Write comprehensive tests: unit tests, edge cases, error paths.
3. Use AAA pattern (Arrange, Act, Assert).
4. Name tests descriptively: "should [behavior] when [condition]".
5. Mock external dependencies but not internal logic.
6. Aim for meaningful coverage of the specified code.
7. Place test files adjacent to source files or in the project's test directory.`,
	},
	{
		command: '/doc',
		label: 'Generate Documentation',
		description: 'Generate documentation for the specified code.',
		systemPrompt: `You are in DOCUMENTATION mode. Focus exclusively on:
1. Add JSDoc/TSDoc/docstring comments to functions, classes, and modules.
2. Document parameters, return types, and thrown exceptions.
3. Add usage examples in doc comments where helpful.
4. Generate or update README sections if appropriate.
5. Keep documentation concise but complete.
6. Match the existing documentation style in the project.`,
	},
	{
		command: '/review',
		label: 'Code Review',
		description: 'Review the specified code for issues and improvements.',
		systemPrompt: `You are in CODE REVIEW mode. Focus exclusively on:
1. Identify bugs, logic errors, and potential issues.
2. Check for security vulnerabilities (injection, XSS, auth issues).
3. Evaluate code readability and maintainability.
4. Check error handling completeness.
5. Suggest performance improvements if relevant.
6. Rate severity: critical / warning / suggestion.
7. Provide specific fix suggestions for each issue found.
8. Do NOT modify files — only report findings.`,
	},
	{
		command: '/refactor',
		label: 'Refactor Code',
		description: 'Refactor the specified code for better structure.',
		systemPrompt: `You are in REFACTOR mode. Focus exclusively on:
1. Improve code structure without changing behavior.
2. Extract functions that do too many things.
3. Rename variables/functions for clarity.
4. Remove dead code and unused imports.
5. Reduce complexity (nested ifs, long chains).
6. Apply DRY principle where duplication exists.
7. Ensure all existing tests still pass after changes.`,
	},
	{
		command: '/explain',
		label: 'Explain Code',
		description: 'Explain what the specified code does.',
		systemPrompt: `You are in EXPLAIN mode. Focus exclusively on:
1. Provide a high-level summary of what the code does.
2. Walk through the logic step by step.
3. Explain complex patterns, algorithms, or design decisions.
4. Note any dependencies or side effects.
5. Use simple language, avoid jargon where possible.
6. Do NOT modify any files — only explain.`,
	},
	{
		command: '/fix',
		label: 'Fix Errors',
		description: 'Fix errors and lint issues in the code.',
		systemPrompt: `You are in FIX mode. Focus exclusively on:
1. Read lint errors and compiler errors first.
2. Address the ROOT CAUSE, not symptoms.
3. Fix one issue at a time, verify it doesn't break other things.
4. If the same error pattern repeats 3+ times, suggest refactoring.
5. Add error handling where missing.
6. Ensure fixes are minimal — change only what's necessary.`,
	},
];

class WorkflowService extends Disposable implements IWorkflowService {
	readonly _serviceBrand: undefined;
	private workflows: WorkflowDefinition[] = [...BUILTIN_WORKFLOWS];

	getWorkflows(): WorkflowDefinition[] {
		return this.workflows;
	}

	findWorkflow(input: string): { workflow: WorkflowDefinition; remainingInput: string } | null {
		const trimmed = input.trim();
		for (const wf of this.workflows) {
			if (trimmed.startsWith(wf.command + ' ') || trimmed === wf.command) {
				return {
					workflow: wf,
					remainingInput: trimmed.slice(wf.command.length).trim(),
				};
			}
		}
		return null;
	}
}

registerSingleton(IWorkflowService, WorkflowService, InstantiationType.Delayed);

/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { AgentState, AgentTask, AgentStep } from './agentTypes.js';

export interface ICodeenAgentCore {
	readonly currentTask: AgentTask | null;
	startTask(goal: string, costLimitCents: number): AgentTask;
	updateState(state: AgentState): void;
	addStep(step: Omit<AgentStep, 'timestamp'>): void;
	cancelTask(): void;
	clearTask(): void;
}

export class CodeenAgentCore implements ICodeenAgentCore {
	private _currentTask: AgentTask | null = null;

	constructor() {}

	get currentTask(): AgentTask | null {
		return this._currentTask;
	}

	startTask(goal: string, costLimitCents: number = 100): AgentTask {
		this._currentTask = {
			taskId: Math.random().toString(36).substring(2, 11),
			goal,
			state: 'PLANNING',
			steps: [],
			costLimitCents,
			currentCostCents: 0,
		};
		return this._currentTask;
	}

	updateState(state: AgentState): void {
		if (this._currentTask) {
			this._currentTask.state = state;
		}
	}

	addStep(step: Omit<AgentStep, 'timestamp'>): void {
		if (this._currentTask) {
			const fullStep: AgentStep = {
				...step,
				timestamp: Date.now(),
			};
			this._currentTask.steps.push(fullStep);
			if (step.costInCents) {
				this._currentTask.currentCostCents += step.costInCents;
			}
		}
	}

	cancelTask(): void {
		if (this._currentTask) {
			this._currentTask.state = 'IDLE';
		}
	}

	clearTask(): void {
		this._currentTask = null;
	}
}

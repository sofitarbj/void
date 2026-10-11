/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

export type AgentState = 'IDLE' | 'PLANNING' | 'RUNNING' | 'EXECUTING_TOOL' | 'AWAITING_APPROVAL' | 'FINISHED' | 'ERROR';

export interface AgentStep {
	stepId: string;
	type?: 'LLM_CALL' | 'TOOL_CALL' | 'PLANNING' | 'ERROR';
	description?: string;
	thought?: string;
	toolCall?: {
		name: string;
		args: Record<string, any>;
	};
	toolResult?: {
		success: boolean;
		output: string;
	};
	costInCents?: number;
	timestamp: number;
}

export interface AgentPlan {
	planId: string;
	goal: string;
	steps: {
		description: string;
		status: 'todo' | 'in_progress' | 'completed' | 'failed';
	}[];
}

export interface AgentTask {
	taskId: string;
	goal: string;
	state: AgentState;
	plan?: AgentPlan;
	steps: AgentStep[];
	costLimitCents: number;
	currentCostCents: number;
}

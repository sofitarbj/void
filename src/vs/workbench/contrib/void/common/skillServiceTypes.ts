/*--------------------------------------------------------------------------------------
 *  F11: Skill Service — Types
 *  Skills are specialized knowledge modules loaded on-demand by the AI.
 *--------------------------------------------------------------------------------------*/

export type SkillDefinition = {
	name: string;
	description: string;
	triggers: string[];
	content: string;
	source: 'bundled' | 'user';
	filePath?: string;
}

export type SkillMetadata = Omit<SkillDefinition, 'content'>

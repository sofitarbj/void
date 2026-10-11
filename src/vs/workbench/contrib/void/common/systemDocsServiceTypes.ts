/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

/**
 * System Documents Service — Types
 * 
 * Manages AI-generated system documents (plans, tasks, walkthroughs)
 * stored in .void/ directory with proper organization and versioning.
 */

export type SystemDocType = 'implementation_plan' | 'task_list' | 'walkthrough' | 'design_doc' | 'architecture_notes'

export interface SystemDocMetadata {
	type: SystemDocType
	title: string
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
	threadId: string // Associated conversation thread
	version: number
	tags?: string[]
}

export interface SystemDoc {
	id: string // UUID
	metadata: SystemDocMetadata
	content: string // Markdown content
	comments?: SystemDocComment[]
}

export interface SystemDocComment {
	id: string
	lineStart: number
	lineEnd: number
	content: string
	createdAt: string
	resolved: boolean
}

export interface CreateSystemDocParams {
	type: SystemDocType
	title: string
	content: string
	threadId: string
	tags?: string[]
}

export interface UpdateSystemDocParams {
	id: string
	content?: string
	metadata?: Partial<SystemDocMetadata>
}

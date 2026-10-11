/*--------------------------------------------------------------------------------------
 *  System Docs Panel — Display and manage system documents
 *  Shows implementation plans, task lists, walkthroughs created by the AI
 *--------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from 'react'

interface SystemDoc {
	id: string
	metadata: {
		type: string
		title: string
		createdAt: string
		updatedAt: string
		version: number
	}
	content: string
}

export const SystemDocsPanel = ({ accessor }: { accessor: any }) => {
	const [docs, setDocs] = useState<SystemDoc[]>([])
	const [selectedDoc, setSelectedDoc] = useState<SystemDoc | null>(null)
	const [isExpanded, setIsExpanded] = useState(false)

	useEffect(() => {
		loadDocs()
	}, [])

	const loadDocs = async () => {
		try {
			const systemDocsService = accessor.get('ISystemDocsService')
			const allDocs = await systemDocsService.listDocs()
			setDocs(allDocs)
		} catch (e) {
			console.error('Failed to load system docs:', e)
		}
	}

	const openDoc = async (doc: SystemDoc) => {
		setSelectedDoc(doc)
		try {
			const systemDocsService = accessor.get('ISystemDocsService')
			await systemDocsService.openDocInEditor(doc.id)
		} catch (e) {
			console.error('Failed to open doc:', e)
		}
	}

	if (docs.length === 0) return null

	const typeIcon = (type: string) => {
		if (type === 'implementation_plan') return '📋'
		if (type === 'task_list') return '✓'
		if (type === 'walkthrough') return '🚶'
		if (type === 'design_doc') return '🎨'
		return '📄'
	}

	return (
		<div className='flex flex-col gap-1 px-3 py-2 mx-2 mb-2 rounded-md border border-void-border-3 bg-void-bg-1/50 text-xs select-none'>
			{/* Header */}
			<div
				className='flex items-center justify-between text-void-fg-3 cursor-pointer hover:text-void-fg-1 transition-colors'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className='flex items-center gap-1.5'>
					<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
						<polyline points='9 18 15 12 9 6' />
					</svg>
					<span className='font-medium'>System Docs</span>
				</div>
				<span>{docs.length}</span>
			</div>

			{/* Document list */}
			{isExpanded && (
				<div className='flex flex-col gap-0.5 mt-1 max-h-[200px] overflow-y-auto'>
					{docs.map((doc) => (
						<div
							key={doc.id}
							className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
								selectedDoc?.id === doc.id
									? 'bg-void-bg-3 text-void-fg-1'
									: 'hover:bg-void-bg-2 text-void-fg-3'
							}`}
							onClick={() => openDoc(doc)}
						>
							<span>{typeIcon(doc.metadata.type)}</span>
							<div className='flex-1 min-w-0'>
								<div className='text-void-fg-2 truncate'>{doc.metadata.title}</div>
								<div className='text-[10px] text-void-fg-4'>
									v{doc.metadata.version} · {new Date(doc.metadata.updatedAt).toLocaleDateString()}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

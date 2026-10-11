/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { useMemo, useState } from 'react';
import { CopyButton, IconShell1 } from '../markdown/ApplyBlockHoverButtons.js';
import { useAccessor, useChatThreadsState, useChatThreadsStreamState, useFullChatThreadsStreamState, useSettingsState } from '../util/services.js';
import { IconX } from './SidebarChat.js';
import { Check, Copy, Icon, LoaderCircle, MessageCircleQuestion, Trash2, UserCheck, X } from 'lucide-react';
import { IsRunningType, ThreadType } from '../../../chatThreadService.js';


const numInitialThreads = 3

export const PastThreadsList = ({
	className = '',
	compact = false,
	limit,
}: {
	className?: string;
	compact?: boolean;
	limit?: number;
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

	const accessor = useAccessor();
	const chatThreadsService = accessor.get('IChatThreadService');
	const threadsState = useChatThreadsState();
	const { allThreads, currentThreadId } = threadsState;

	const streamState = useFullChatThreadsStreamState();

	const runningThreadIds: { [threadId: string]: IsRunningType | undefined } = {};
	for (const threadId in streamState) {
		const isRunning = streamState[threadId]?.isRunning;
		if (isRunning) { runningThreadIds[threadId] = isRunning; }
	}

	if (!allThreads) {
		return <div key="error" className="p-2 text-xs text-text-muted">Error accessing chat history.</div>;
	}

	// Tri par date de modification décroissante
	let sortedThreadIds = Object.keys(allThreads ?? {})
		.sort((t1, t2) => (allThreads[t1]?.lastModified ?? 0) > (allThreads[t2]?.lastModified ?? 0) ? -1 : 1)
		.filter(t => (allThreads![t]?.messages.length ?? 0) !== 0);

	if (limit && limit > 0) {
		sortedThreadIds = sortedThreadIds.slice(0, limit);
	}

	// Filtrage par texte de recherche
	const filteredThreadIds = sortedThreadIds.filter(id => {
		if (!searchQuery.trim()) return true;
		const thread = allThreads[id];
		if (!thread) return false;
		const query = searchQuery.toLowerCase();
		return thread.messages.some(m =>
			(typeof m.displayContent === 'string' && m.displayContent.toLowerCase().includes(query)) ||
			(typeof m.content === 'string' && m.content.toLowerCase().includes(query))
		);
	});

	return (
		<div className={`flex flex-col gap-1.5 w-full select-none ${className}`}>
			{!compact && (
				<>
					{/* Header: CHATS & THREADS + Action Button */}
					<div className="flex items-center justify-between px-1 py-1 text-text-secondary">
						<div className="flex items-center gap-2">
							<span className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted font-semibold">
								Chats &amp; Threads
							</span>
							<span className="bg-surface-elevated text-text-primary font-mono text-[10px] px-1.5 py-0.2 rounded-sm border border-border-hairline">
								{sortedThreadIds.length}
							</span>
						</div>
						<button
							type="button"
							onClick={() => chatThreadsService.openNewThread()}
							className="bg-primary text-surface-base font-semibold text-[11px] px-2.5 py-1 rounded-sm flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
							title="Start new thread"
						>
							<span>+ New</span>
						</button>
					</div>

					{/* Filter & Search Input */}
					{sortedThreadIds.length > 2 && (
						<div className="relative w-full">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Filter conversations..."
								className="w-full bg-surface-elevated text-text-primary placeholder:text-text-muted text-xs px-2.5 py-1.5 rounded-sm border border-border-hairline focus:outline-none focus:border-primary/50 transition-colors"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-2 top-1.5 text-text-muted hover:text-text-primary text-xs"
								>
									×
								</button>
							)}
						</div>
					)}
				</>
			)}

			{/* Thread list */}
			<div className="flex flex-col gap-1">
				{filteredThreadIds.length === 0 ? (
					<div className="p-3 text-center text-xs text-text-muted">
						{searchQuery ? 'No conversations match your filter.' : 'No conversations yet.'}
					</div>
				) : (
					filteredThreadIds.map((threadId, i) => {
						const pastThread = allThreads[threadId];
						if (!pastThread) return null;

						const isActive = threadId === currentThreadId;

						return (
							<PastThreadElement
								key={pastThread.id}
								pastThread={pastThread}
								isActive={isActive}
								idx={i}
								hoveredIdx={hoveredIdx}
								setHoveredIdx={setHoveredIdx}
								isRunning={runningThreadIds[pastThread.id]}
								compact={compact}
							/>
						);
					})
				)}
			</div>
		</div>
	);
};





// Format date to display as today, yesterday, or date
const formatDate = (date: Date) => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date >= today) {
		return 'Today';
	} else if (date >= yesterday) {
		return 'Yesterday';
	} else {
		return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
	}
};

// Format time to 12-hour format
const formatTime = (date: Date) => {
	return date.toLocaleString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
};


const DuplicateButton = ({ threadId }: { threadId: string }) => {
	const accessor = useAccessor()
	const chatThreadsService = accessor.get('IChatThreadService')
	return <IconShell1
		Icon={Copy}
		className='size-[11px]'
		onClick={() => { chatThreadsService.duplicateThread(threadId); }}
		data-tooltip-id='void-tooltip'
		data-tooltip-place='top'
		data-tooltip-content='Duplicate thread'
	>
	</IconShell1>

}

const TrashButton = ({ threadId }: { threadId: string }) => {

	const accessor = useAccessor()
	const chatThreadsService = accessor.get('IChatThreadService')


	const [isTrashPressed, setIsTrashPressed] = useState(false)

	return (isTrashPressed ?
		<div className='flex flex-nowrap text-nowrap gap-1'>
			<IconShell1
				Icon={X}
				className='size-[11px]'
				onClick={() => { setIsTrashPressed(false); }}
				data-tooltip-id='void-tooltip'
				data-tooltip-place='top'
				data-tooltip-content='Cancel'
			/>
			<IconShell1
				Icon={Check}
				className='size-[11px]'
				onClick={() => { chatThreadsService.deleteThread(threadId); setIsTrashPressed(false); }}
				data-tooltip-id='void-tooltip'
				data-tooltip-place='top'
				data-tooltip-content='Confirm'
			/>
		</div>
		: <IconShell1
			Icon={Trash2}
			className='size-[11px]'
			onClick={() => { setIsTrashPressed(true); }}
			data-tooltip-id='void-tooltip'
			data-tooltip-place='top'
			data-tooltip-content='Delete thread'
		/>
	)
}

const PastThreadElement = ({
	pastThread,
	isActive = false,
	idx,
	hoveredIdx,
	setHoveredIdx,
	isRunning,
	compact = false,
}: {
	pastThread: ThreadType;
	isActive?: boolean;
	idx: number;
	hoveredIdx: number | null;
	setHoveredIdx: (idx: number | null) => void;
	isRunning: IsRunningType | undefined;
	compact?: boolean;
}) => {
	const accessor = useAccessor();
	const chatThreadsService = accessor.get('IChatThreadService');

	let firstMsg = '';
	let snippetMsg = '';
	const userMessages = pastThread.messages.filter((msg) => msg.role === 'user');
	const assistantMessages = pastThread.messages.filter((msg) => msg.role === 'assistant');

	if (userMessages.length > 0) {
		const first = userMessages[0];
		firstMsg = (typeof first.displayContent === 'string' && first.displayContent) || (typeof first.content === 'string' && first.content) || 'New Conversation';
	} else {
		firstMsg = 'Empty Conversation';
	}

	if (assistantMessages.length > 0) {
		const lastAssistant = assistantMessages[assistantMessages.length - 1];
		snippetMsg = (typeof lastAssistant.displayContent === 'string' && lastAssistant.displayContent) || (typeof lastAssistant.content === 'string' && lastAssistant.content) || '';
	}

	return (
		<div
			key={pastThread.id}
			onClick={() => {
				chatThreadsService.switchToThread(pastThread.id);
			}}
			onMouseEnter={() => setHoveredIdx(idx)}
			onMouseLeave={() => setHoveredIdx(null)}
			className={`group relative flex flex-col ${compact ? 'p-2' : 'p-2.5'} rounded-sm cursor-pointer transition-all border ${
				isActive
					? 'bg-surface-elevated border-primary/40 shadow-sm'
					: 'bg-surface-panel hover:bg-surface-elevated border-border-hairline hover:border-border-subtle'
			}`}
		>
			{/* Active Left Indicator Bar */}
			{isActive && (
				<div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary" />
			)}

			{/* Top Line: Thread Title + Hover Action Controls */}
			<div className={`flex items-center justify-between gap-2 ${isActive ? 'pl-1.5' : ''}`}>
				<div className="flex items-center gap-1.5 min-w-0">
					{isRunning && (
						<LoaderCircle className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
					)}
					<span className="font-medium text-xs text-text-primary line-clamp-1">
						{firstMsg}
					</span>
				</div>

				<div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
					{idx === hoveredIdx ? (
						<>
							<DuplicateButton threadId={pastThread.id} />
							<TrashButton threadId={pastThread.id} />
						</>
					) : (
						<span className="font-mono text-[10px] text-text-muted">
							{formatDate(new Date(pastThread.lastModified))}
						</span>
					)}
				</div>
			</div>

			{/* Snippet / Subtitle */}
			{snippetMsg && (
				<p className={`text-[11px] text-text-muted line-clamp-1 mt-0.5 ${isActive ? 'pl-1.5' : ''}`}>
					{snippetMsg}
				</p>
			)}
		</div>
	);
};

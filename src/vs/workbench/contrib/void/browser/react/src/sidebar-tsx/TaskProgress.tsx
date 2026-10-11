/*--------------------------------------------------------------------------------------
 *  F4: TaskProgress — Visual checklist for AI task tracking
 *  Displays todos created by the todo_list tool in real-time.
 *--------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from 'react'
import { TodoItem } from '../../../../common/chatThreadServiceTypes.js'

const statusIcon = (status: TodoItem['status']) => {
	const s = status as string;
	if (s === 'completed') return <span className='text-[#00D1FF] font-semibold'>✓</span>
	if (s === 'in_progress') return <span className='text-yellow-500 animate-pulse'>●</span>
	if (s === 'blocked') return <span className='text-orange-500'>⚠</span>
	if (s === 'failed') return <span className='text-red-500 font-semibold'>✗</span>
	return <span className='text-void-fg-4'>○</span>
}

const priorityBadge = (priority: TodoItem['priority']) => {
	if (priority === 'high') return <span className='text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium'>High</span>
	if (priority === 'medium') return null
	return null
}

export const TaskProgress = ({ todos }: { todos: TodoItem[] }) => {
	const [isCollapsed, setIsCollapsed] = useState(false)

	if (!todos || todos.length === 0) return null

	const completed = todos.filter(t => t.status === 'completed').length
	const total = todos.length
	const progress = total > 0 ? (completed / total) * 100 : 0
	const allCompleted = completed === total && total > 0

	// Auto-collapse when all tasks are completed after 2s
	useEffect(() => {
		if (allCompleted && !isCollapsed) {
			const timer = setTimeout(() => setIsCollapsed(true), 2000)
			return () => clearTimeout(timer)
		}
	}, [allCompleted, isCollapsed])

	return (
		<div className='flex flex-col gap-1 px-3.5 py-2.5 mx-2 mb-2 rounded-lg border border-white/5 bg-[#141A22] text-xs select-none'>
			{/* Header */}
			<div className='flex items-center justify-between text-void-fg-3 cursor-pointer hover:text-void-fg-1 transition-colors' onClick={() => setIsCollapsed(!isCollapsed)}>
				<div className='flex items-center gap-1.5'>
					<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
						<polyline points='9 18 15 12 9 6' />
					</svg>
					<span className='font-semibold text-void-fg-1'>Task Progress</span>
				</div>
				<span className="font-semibold text-void-fg-2">{completed}/{total}</span>
			</div>

			{/* Collapsible content */}
			{!isCollapsed && (
				<>
					{/* Progress bar */}
					<div className='w-full h-1 rounded-full bg-void-border-3/30 overflow-hidden mt-1.5'>
						<div
							className='h-full rounded-full bg-[#00D1FF] transition-all duration-500'
							style={{ width: `${progress}%` }}
						/>
					</div>

					{/* Task list */}
					<div className='flex flex-col gap-1.5 mt-2 max-h-[140px] overflow-y-auto pr-0.5'>
						{todos.map((todo) => (
							<div
								key={todo.id}
								className={`flex items-center gap-2 py-0.5 ${todo.status === 'completed' ? 'opacity-50 line-through' : ''}`}
							>
								{statusIcon(todo.status)}
								<span className='text-void-fg-3 truncate flex-1 leading-normal'>{todo.content}</span>
								{priorityBadge(todo.priority)}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

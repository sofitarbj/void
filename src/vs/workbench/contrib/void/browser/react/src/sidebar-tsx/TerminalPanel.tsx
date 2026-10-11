/*--------------------------------------------------------------------------------------
 *  F8: TerminalPanel — Shows active persistent terminals with interaction
 *  Displays terminal output and allows sending input directly from sidebar.
 *--------------------------------------------------------------------------------------*/

import React, { useState, useRef, useCallback } from 'react'
import { useAccessor } from '../util/services.js'
import { ChevronRight, Terminal, X } from 'lucide-react'
import { persistentTerminalNameOfId } from '../../../terminalToolService.js'

export const TerminalPanel = () => {
	const accessor = useAccessor()
	const terminalToolService = accessor.get('ITerminalToolService')
	const [isExpanded, setIsExpanded] = useState(false)
	const [inputText, setInputText] = useState('')
	const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const terminals = terminalToolService.listPersistentTerminalIds?.() ?? []

	const handleSendInput = useCallback(() => {
		if (!activeTerminalId || !inputText.trim()) return
		terminalToolService.sendInputToPersistentTerminal(activeTerminalId, inputText + '\n')
		setInputText('')
		inputRef.current?.focus()
	}, [activeTerminalId, inputText, terminalToolService])

	const handleFocus = useCallback((id: string) => {
		terminalToolService.focusPersistentTerminal(id)
	}, [terminalToolService])

	if (terminals.length === 0) return null

	return (
		<div className='mx-2 mb-2 rounded-md border border-void-border-3 bg-void-bg-1/50 text-xs select-none overflow-hidden'>
			{/* Header toggle */}
			<button
				type='button'
				title='Toggle terminal panel'
				className='w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-void-bg-2/50 transition-colors'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<ChevronRight className={`w-3 h-3 text-void-fg-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
				<Terminal className='w-3 h-3 text-void-fg-3' />
				<span className='text-void-fg-2 font-medium'>Terminals</span>
				<span className='text-void-fg-4 ml-auto'>{terminals.length}</span>
			</button>

			{isExpanded && (
				<div className='border-t border-void-border-3'>
					{/* Terminal list */}
					<div className='flex flex-col'>
						{terminals.map((id: string) => (
							<div
								key={id}
								className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-void-bg-2/50 ${activeTerminalId === id ? 'bg-void-bg-2/30' : ''}`}
								onClick={() => setActiveTerminalId(activeTerminalId === id ? null : id)}
							>
								<Terminal className='w-3 h-3 text-green-400' />
								<span className='text-void-fg-3 flex-1 truncate'>{persistentTerminalNameOfId(id)}</span>
								<button
									type='button'
									title='Focus in panel'
									className='text-void-fg-4 hover:text-void-fg-1 p-0.5'
									onClick={(e) => { e.stopPropagation(); handleFocus(id) }}
								>
									<ChevronRight className='w-3 h-3' />
								</button>
							</div>
						))}
					</div>

					{/* Input area for active terminal */}
					{activeTerminalId && (
						<div className='flex items-center gap-1 px-2 py-1 border-t border-void-border-3'>
							<span className='text-void-fg-4 text-[10px]'>$</span>
							<input
								ref={inputRef}
								type='text'
								title='Send input to terminal'
								placeholder='Type input for terminal...'
								className='flex-1 bg-transparent text-void-fg-2 outline-none text-xs placeholder:text-void-fg-4'
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSendInput()
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

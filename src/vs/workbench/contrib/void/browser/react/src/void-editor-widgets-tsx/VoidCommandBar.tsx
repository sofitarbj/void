/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/


import { useAccessor, useCommandBarState, useIsDark } from '../util/services.js';

import '../styles.css'
import { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollType } from '../../../../../../../editor/common/editorCommon.js';
import { acceptAllBg, acceptBorder, buttonFontSize, buttonTextColor, rejectAllBg, rejectBg, rejectBorder } from '../../../../common/helpers/colors.js';
import { VoidCommandBarProps } from '../../../voidCommandBarService.js';
import { Check, EllipsisVertical, Menu, MoveDown, MoveLeft, MoveRight, MoveUp, X } from 'lucide-react';
import {
	VOID_GOTO_NEXT_DIFF_ACTION_ID,
	VOID_GOTO_PREV_DIFF_ACTION_ID,
	VOID_GOTO_NEXT_URI_ACTION_ID,
	VOID_GOTO_PREV_URI_ACTION_ID,
	VOID_ACCEPT_FILE_ACTION_ID,
	VOID_REJECT_FILE_ACTION_ID,
	VOID_ACCEPT_ALL_DIFFS_ACTION_ID,
	VOID_REJECT_ALL_DIFFS_ACTION_ID
} from '../../../actionIDs.js';

export const VoidCommandBarMain = ({ uri, editor }: VoidCommandBarProps) => {
	const isDark = useIsDark()

	return <div
		className={`@@void-scope ${isDark ? 'dark' : ''}`}
	>
		<VoidCommandBar uri={uri} editor={editor} />
	</div>
}



export const AcceptAllButtonWrapper = ({ text, onClick, className = '', ...props }: { text: string, onClick: () => void, className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		className={`
			px-3 py-1
			flex items-center gap-1.5
			bg-[#00DC82] hover:bg-[#45f99c] text-[#00391d]
			font-semibold text-xs text-nowrap
			rounded active:scale-95
			transition-all duration-150 shadow-sm
			cursor-pointer
			${className}
		`}
		type='button'
		onClick={onClick}
		{...props}
	>
		<Check className="w-3.5 h-3.5 stroke-[2.5]" />
		<span>{text}</span>
	</button>
)

export const RejectAllButtonWrapper = ({ text, onClick, className = '', ...props }: { text: string, onClick: () => void, className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		className={`
			px-2.5 py-1
			flex items-center gap-1
			bg-[#1F1418] hover:bg-[#2A181E] text-[#F87171] hover:text-[#FFA3A3]
			font-medium text-xs text-nowrap
			rounded border border-[#4A1B22] hover:border-[#69242E]
			transition-colors duration-150
			cursor-pointer
			${className}
		`}
		type='button'
		onClick={onClick}
		{...props}
	>
		<X className="w-3.5 h-3.5 stroke-[2]" />
		<span>{text}</span>
	</button>
)



export const VoidCommandBar = ({ uri, editor }: VoidCommandBarProps) => {
	const accessor = useAccessor()
	const editCodeService = accessor.get('IEditCodeService')
	const editorService = accessor.get('ICodeEditorService')
	const metricsService = accessor.get('IMetricsService')
	const commandService = accessor.get('ICommandService')
	const commandBarService = accessor.get('IVoidCommandBarService')
	const voidModelService = accessor.get('IVoidModelService')
	const keybindingService = accessor.get('IKeybindingService')
	const { stateOfURI: commandBarState, sortedURIs: sortedCommandBarURIs } = useCommandBarState()
	const [showAcceptRejectAllButtons, setShowAcceptRejectAllButtons] = useState(false)

	// latestUriIdx is used to remember place in leftRight
	const _latestValidUriIdxRef = useRef<number | null>(null)

	// i is the current index of the URI in sortedCommandBarURIs
	const i_ = sortedCommandBarURIs.findIndex(e => e.fsPath === uri?.fsPath)
	const currFileIdx = i_ === -1 ? null : i_
	useEffect(() => {
		if (currFileIdx !== null) _latestValidUriIdxRef.current = currFileIdx
	}, [currFileIdx])

	const uriIdxInStepper = currFileIdx !== null ? currFileIdx // use currFileIdx if it exists, else use latestNotNullUriIdxRef
		: _latestValidUriIdxRef.current === null ? null
			: _latestValidUriIdxRef.current < sortedCommandBarURIs.length ? _latestValidUriIdxRef.current
				: null

	// when change URI, scroll to the proper spot
	useEffect(() => {
		setTimeout(() => {
			// check undefined
			if (!uri) return
			const s = commandBarService.stateOfURI[uri.fsPath]
			if (!s) return
			const { diffIdx } = s
			commandBarService.goToDiffIdx(diffIdx ?? 0)
		}, 50)
	}, [uri, commandBarService])

	if (uri?.scheme !== 'file') return null // don't show in editors that we made, they must be files

	// Using service methods directly

	const currDiffIdx = uri ? commandBarState[uri.fsPath]?.diffIdx ?? null : null
	const sortedDiffIds = uri ? commandBarState[uri.fsPath]?.sortedDiffIds ?? [] : []
	const sortedDiffZoneIds = uri ? commandBarState[uri.fsPath]?.sortedDiffZoneIds ?? [] : []

	const isADiffInThisFile = sortedDiffIds.length !== 0
	const isADiffZoneInThisFile = sortedDiffZoneIds.length !== 0
	const isADiffZoneInAnyFile = sortedCommandBarURIs.length !== 0

	const streamState = uri ? commandBarService.getStreamState(uri) : null
	const showAcceptRejectAll = streamState === 'idle-has-changes'

	const nextDiffIdx = commandBarService.getNextDiffIdx(1)
	const prevDiffIdx = commandBarService.getNextDiffIdx(-1)
	const nextURIIdx = commandBarService.getNextUriIdx(1)
	const prevURIIdx = commandBarService.getNextUriIdx(-1)

	const upDownDisabled = prevDiffIdx === null || nextDiffIdx === null
	const leftRightDisabled = prevURIIdx === null || nextURIIdx === null

	// accept/reject if current URI has changes
	const onAcceptFile = () => {
		if (!uri) return
		editCodeService.acceptOrRejectAllDiffAreas({ uri, behavior: 'accept', removeCtrlKs: false, _addToHistory: true })
		metricsService.capture('Accept File', {})
	}
	const onRejectFile = () => {
		if (!uri) return
		editCodeService.acceptOrRejectAllDiffAreas({ uri, behavior: 'reject', removeCtrlKs: false, _addToHistory: true })
		metricsService.capture('Reject File', {})
	}

	const onAcceptAll = () => {
		commandBarService.acceptOrRejectAllFiles({ behavior: 'accept' });
		metricsService.capture('Accept All', {})
		setShowAcceptRejectAllButtons(false);
	}

	const onRejectAll = () => {
		commandBarService.acceptOrRejectAllFiles({ behavior: 'reject' });
		metricsService.capture('Reject All', {})
		setShowAcceptRejectAllButtons(false);
	}



	const _upKeybinding = keybindingService.lookupKeybinding(VOID_GOTO_PREV_DIFF_ACTION_ID);
	const _downKeybinding = keybindingService.lookupKeybinding(VOID_GOTO_NEXT_DIFF_ACTION_ID);
	const _leftKeybinding = keybindingService.lookupKeybinding(VOID_GOTO_PREV_URI_ACTION_ID);
	const _rightKeybinding = keybindingService.lookupKeybinding(VOID_GOTO_NEXT_URI_ACTION_ID);
	const _acceptFileKeybinding = keybindingService.lookupKeybinding(VOID_ACCEPT_FILE_ACTION_ID);
	const _rejectFileKeybinding = keybindingService.lookupKeybinding(VOID_REJECT_FILE_ACTION_ID);
	const _acceptAllKeybinding = keybindingService.lookupKeybinding(VOID_ACCEPT_ALL_DIFFS_ACTION_ID);
	const _rejectAllKeybinding = keybindingService.lookupKeybinding(VOID_REJECT_ALL_DIFFS_ACTION_ID);

	const upKeybindLabel = editCodeService.processRawKeybindingText(_upKeybinding?.getLabel() || '');
	const downKeybindLabel = editCodeService.processRawKeybindingText(_downKeybinding?.getLabel() || '');
	const leftKeybindLabel = editCodeService.processRawKeybindingText(_leftKeybinding?.getLabel() || '');
	const rightKeybindLabel = editCodeService.processRawKeybindingText(_rightKeybinding?.getLabel() || '');
	const acceptFileKeybindLabel = editCodeService.processRawKeybindingText(_acceptFileKeybinding?.getAriaLabel() || '');
	const rejectFileKeybindLabel = editCodeService.processRawKeybindingText(_rejectFileKeybinding?.getAriaLabel() || '');
	const acceptAllKeybindLabel = editCodeService.processRawKeybindingText(_acceptAllKeybinding?.getAriaLabel() || '');
	const rejectAllKeybindLabel = editCodeService.processRawKeybindingText(_rejectAllKeybinding?.getAriaLabel() || '');


	if (!isADiffZoneInAnyFile) return null

	// For pages without a current file index, show a simplified command bar
	if (currFileIdx === null) {
		return (
			<div className="pointer-events-auto">
				<div className="flex bg-void-bg-2 shadow-md border border-void-border-2 [&>*:first-child]:pl-3 [&>*:last-child]:pr-3 [&>*]:border-r [&>*]:border-void-border-2 [&>*:last-child]:border-r-0">
					<div className="flex items-center px-3">
						<span className="text-xs whitespace-nowrap">
							{`${sortedCommandBarURIs.length} file${sortedCommandBarURIs.length === 1 ? '' : 's'} changed`}
						</span>
					</div>
					<button
						className="text-xs whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:opacity-90 h-full px-3"
						onClick={() => commandBarService.goToURIIdx(nextURIIdx)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								commandBarService.goToURIIdx(nextURIIdx);
							}
						}}
					>
						Next <MoveRight className='size-3 my-1' />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="pointer-events-auto">


			{/* Accept All / Reject All buttons that appear when the vertical ellipsis is clicked */}
			{showAcceptRejectAllButtons && showAcceptRejectAll && (
				<div className="flex justify-end mb-1">
					<div className="inline-flex bg-void-bg-2 rounded shadow-md border border-void-border-2 overflow-hidden">
						<div className="flex items-center [&>*]:border-r [&>*]:border-void-border-2 [&>*:last-child]:border-r-0">
							<AcceptAllButtonWrapper
								// text={`Accept All${acceptAllKeybindLabel ? ` ${acceptAllKeybindLabel}` : ''}`}
								text={`Accept All`}
								data-tooltip-id='void-tooltip'
								data-tooltip-content={acceptAllKeybindLabel}
								data-tooltip-delay-show={500}
								onClick={onAcceptAll}
								/>
							<RejectAllButtonWrapper
								// text={`Reject All${rejectAllKeybindLabel ? ` ${rejectAllKeybindLabel}` : ''}`}
								text={`Reject All`}
								data-tooltip-id='void-tooltip'
								data-tooltip-content={rejectAllKeybindLabel}
								data-tooltip-delay-show={500}
								onClick={onRejectAll}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center bg-surface-panel/95 backdrop-blur-md rounded-xl shadow-2xl border border-border-hairline p-1.5 gap-2 text-text-primary">
				{/* Brand Tag / Title */}
				<div className="flex items-center gap-1.5 pl-1.5 pr-2 border-r border-border-hairline">
					<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
					<span className="font-semibold text-xs text-text-primary whitespace-nowrap" style={{ fontFamily: 'Outfit, sans-serif' }}>
						Fast Apply Diff
					</span>
				</div>

				{/* Diff Navigation Group */}
				<div className="flex items-center gap-1 pr-2 border-r border-border-hairline">
					<button
						className="cursor-pointer p-0.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
						disabled={upDownDisabled}
						onClick={() => commandBarService.goToDiffIdx(prevDiffIdx)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								commandBarService.goToDiffIdx(prevDiffIdx);
							}
						}}
						data-tooltip-id="void-tooltip"
						data-tooltip-content={`${upKeybindLabel ? `${upKeybindLabel}` : ''}`}
						data-tooltip-delay-show={500}
						title="Previous diff"
					>
						<MoveUp className='w-3 h-3' />
					</button>
					<span className={`font-mono text-[11px] whitespace-nowrap px-1 ${!isADiffInThisFile ? 'opacity-70' : 'text-text-secondary'}`}>
						{isADiffInThisFile
							? `${(currDiffIdx ?? 0) + 1} of ${sortedDiffIds.length}`
							: streamState === 'streaming'
								? 'Streaming...'
								: 'No changes'
						}
					</span>
					<button
						className="cursor-pointer p-0.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
						disabled={upDownDisabled}
						onClick={() => commandBarService.goToDiffIdx(nextDiffIdx)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								commandBarService.goToDiffIdx(nextDiffIdx);
							}
						}}
						data-tooltip-id="void-tooltip"
						data-tooltip-content={`${downKeybindLabel ? `${downKeybindLabel}` : ''}`}
						data-tooltip-delay-show={500}
						title="Next diff"
					>
						<MoveDown className='w-3 h-3' />
					</button>
				</div>

				{/* File Navigation Group */}
				<div className="flex items-center gap-1 pr-2 border-r border-border-hairline">
					<button
						className="cursor-pointer p-0.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
						disabled={leftRightDisabled}
						onClick={() => commandBarService.goToURIIdx(prevURIIdx)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								commandBarService.goToURIIdx(prevURIIdx);
							}
						}}
						data-tooltip-id="void-tooltip"
						data-tooltip-content={`${leftKeybindLabel ? `${leftKeybindLabel}` : ''}`}
						data-tooltip-delay-show={500}
						title="Previous file"
					>
						<MoveLeft className='w-3 h-3' />
					</button>
					<span className="font-mono text-[11px] whitespace-nowrap px-1 text-text-secondary">
						{currFileIdx !== null
							? `File ${currFileIdx + 1}/${sortedCommandBarURIs.length}`
							: `${sortedCommandBarURIs.length} file${sortedCommandBarURIs.length === 1 ? '' : 's'}`
						}
					</span>
					<button
						className="cursor-pointer p-0.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
						disabled={leftRightDisabled}
						onClick={() => commandBarService.goToURIIdx(nextURIIdx)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								commandBarService.goToURIIdx(nextURIIdx);
							}
						}}
						data-tooltip-id="void-tooltip"
						data-tooltip-content={`${rightKeybindLabel ? `${rightKeybindLabel}` : ''}`}
						data-tooltip-delay-show={500}
						title="Next file"
					>
						<MoveRight className='w-3 h-3' />
					</button>
				</div>

				{/* Accept/Reject Tandem Action Pills - only shown when appropriate */}
				{showAcceptRejectAll && (
					<div className='flex items-center gap-1.5'>
						<AcceptAllButtonWrapper
							text="Accept File"
							data-tooltip-id='void-tooltip'
							data-tooltip-content={acceptFileKeybindLabel}
							data-tooltip-delay-show={500}
							onClick={onAcceptFile}
						/>
						<RejectAllButtonWrapper
							text="Reject"
							data-tooltip-id='void-tooltip'
							data-tooltip-content={rejectFileKeybindLabel}
							data-tooltip-delay-show={500}
							onClick={onRejectFile}
						/>
						<div className="h-4 w-px bg-surface-hover mx-0.5" />
						<button
							type="button"
							onClick={onAcceptAll}
							data-tooltip-id='void-tooltip'
							data-tooltip-content={acceptAllKeybindLabel}
							className="px-2.5 py-1 bg-[#161F1C] hover:bg-[#1C2924] text-[#45f99c] hover:text-[#59ffa4] rounded text-xs font-medium transition-colors border border-[#00dc8233] hover:border-[#00dc8266] cursor-pointer"
						>
							Accept All ({sortedCommandBarURIs.length})
						</button>
					</div>
				)}

				{/* Triple colon menu button */}
				{showAcceptRejectAll && (
					<div
						className="cursor-pointer p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
						onClick={() => setShowAcceptRejectAllButtons(!showAcceptRejectAllButtons)}
						title="More diff actions"
					>
						<EllipsisVertical className="w-3.5 h-3.5" />
					</div>
				)}
			</div>
		</div>
	)
}





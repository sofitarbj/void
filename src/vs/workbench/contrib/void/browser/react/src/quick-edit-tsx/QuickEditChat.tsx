/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSettingsState, useAccessor, useCtrlKZoneStreamingState } from '../util/services.js';
import { TextAreaFns, VoidInputBox2 } from '../util/inputs.js';
import { QuickEditPropsType } from '../../../quickEditActions.js';
import { ButtonStop, ButtonSubmit, IconX, VoidChatArea } from '../sidebar-tsx/SidebarChat.js';
import { VOID_CTRL_K_ACTION_ID } from '../../../actionIDs.js';
import { useRefState } from '../util/helpers.js';
import { isFeatureNameDisabled } from '../../../../../../../workbench/contrib/void/common/voidSettingsTypes.js';




export const QuickEditChat = ({
	diffareaid,
	onChangeHeight,
	onChangeText: onChangeText_,
	textAreaRef: textAreaRef_,
	initText
}: QuickEditPropsType) => {

	const accessor = useAccessor()
	const editCodeService = accessor.get('IEditCodeService')
	const sizerRef = useRef<HTMLDivElement | null>(null)
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const textAreaFnsRef = useRef<TextAreaFns | null>(null)

	useEffect(() => {
		const inputContainer = sizerRef.current
		if (!inputContainer) return;
		// only observing 1 element
		let resizeObserver: ResizeObserver | undefined
		resizeObserver = new ResizeObserver((entries) => {
			const height = entries[0].borderBoxSize[0].blockSize
			onChangeHeight(height)
		})
		resizeObserver.observe(inputContainer);
		return () => { resizeObserver?.disconnect(); };
	}, [onChangeHeight]);


	const settingsState = useSettingsState()

	// state of current message
	const [instructionsAreEmpty, setInstructionsAreEmpty] = useState(!(initText ?? '')) // the user's instructions
	const isDisabled = instructionsAreEmpty || !!isFeatureNameDisabled('Ctrl+K', settingsState)


	const [isStreamingRef, setIsStreamingRef] = useRefState(editCodeService.isCtrlKZoneStreaming({ diffareaid }))
	useCtrlKZoneStreamingState(useCallback((diffareaid2, isStreaming) => {
		if (diffareaid !== diffareaid2) return
		setIsStreamingRef(isStreaming)
	}, [diffareaid, setIsStreamingRef]))

	const loadingIcon = <div
		className="@@codicon @@codicon-loading @@codicon-modifier-spin @@codicon-no-default-spin text-void-fg-3"
	/>

	const onSubmit = useCallback(async () => {
		if (isDisabled) return
		if (isStreamingRef.current) return
		textAreaFnsRef.current?.disable()

		const opts = {
			from: 'QuickEdit',
			diffareaid,
			startBehavior: 'keep-conflicts',
		} as const

		await editCodeService.callBeforeApplyOrEdit(opts)
		const [newApplyingUri, applyDonePromise] = editCodeService.startApplying(opts) ?? []
		// catch any errors by interrupting the stream
		applyDonePromise?.catch(e => { if (newApplyingUri) editCodeService.interruptCtrlKStreaming({ diffareaid }) })


	}, [isStreamingRef, isDisabled, editCodeService, diffareaid])

	const onInterrupt = useCallback(() => {
		if (!isStreamingRef.current) return
		editCodeService.interruptCtrlKStreaming({ diffareaid })
		textAreaFnsRef.current?.enable()
	}, [isStreamingRef, editCodeService])


	const onX = useCallback(() => {
		onInterrupt()
		editCodeService.removeCtrlKZone({ diffareaid })
	}, [editCodeService, diffareaid])

	const keybindingString = accessor.get('IKeybindingService').lookupKeybinding(VOID_CTRL_K_ACTION_ID)?.getLabel()

	const chatAreaRef = useRef<HTMLDivElement | null>(null)
	return <div ref={sizerRef} style={{ maxWidth: 540 }} className={`py-2 w-full relative group`}>
		{/* Ambient Technical Glow */}
		<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-agent-cyan/15 to-agent-indigo/20 rounded-xl blur-sm -z-10 opacity-70 pointer-events-none transition-all duration-300 group-hover:opacity-90"></div>

		{/* Widget Surface Container */}
		<div className="relative rounded-xl bg-surface-panel/95 backdrop-blur-md border border-border-hairline shadow-2xl p-1.5">
			{/* Technical Header */}
			<div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] select-none border-b border-border-hairline/60">
				<div className="flex items-center gap-1.5">
					<span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-elevated text-primary font-semibold text-[11.5px] border border-border-hairline">
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
						<span>Quick Edit</span>
					</span>
					<span className="text-agent-cyan bg-surface-base px-1.5 py-0.5 rounded font-mono text-[10px] border border-border-hairline">
						Inline Zone
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 text-text-muted font-mono text-[10px]">
						<span className="px-1 py-0.2 rounded bg-surface-base border border-border-hairline">Enter</span>
						<span>to Apply</span>
						<span className="ml-1 px-1 py-0.2 rounded bg-surface-base border border-border-hairline">Esc</span>
						<span>Cancel</span>
					</div>
					<button
						className="p-0.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors cursor-pointer"
						onClick={onX}
						title="Dismiss Widget (Escape)"
					>
						<IconX size={13} />
					</button>
				</div>
			</div>

			<VoidChatArea
				featureName='Ctrl+K'
				divRef={chatAreaRef}
				onSubmit={onSubmit}
				onAbort={onInterrupt}
				onClose={onX}
				isStreaming={isStreamingRef.current}
				loadingIcon={loadingIcon}
				isDisabled={isDisabled}
				className="!bg-transparent !border-0 !shadow-none !p-1"
				onClickAnywhere={() => { textAreaRef.current?.focus() }}
			>
				<VoidInputBox2
					className='px-1 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted'
					initValue={initText}
					ref={useCallback((r: HTMLTextAreaElement | null) => {
						textAreaRef.current = r
						textAreaRef_(r)
						r?.addEventListener('keydown', (e) => {
							if (e.key === 'Escape')
								onX()
						})
					}, [textAreaRef_, onX])}
					fnsRef={textAreaFnsRef}
					placeholder="Ask Codeen to refactor, document, or transform selection..."
					onChangeText={useCallback((newStr: string) => {
						setInstructionsAreEmpty(!newStr)
						onChangeText_(newStr)
					}, [onChangeText_])}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							onSubmit()
							return
						}
					}}
					multiline={true}
				/>
			</VoidChatArea>

			{/* Streaming Live Teaser / Status */}
			{isStreamingRef.current && (
				<div className="mt-1.5 px-2.5 py-1.5 rounded bg-surface-base border border-border-hairline flex items-center justify-between text-body-sm select-none">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
						<span className="font-mono text-[10.5px] text-primary font-medium">Streaming diff patch to editor...</span>
					</div>
					<div className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
						<span>Press Esc to interrupt</span>
					</div>
				</div>
			)}
		</div>
	</div>


}

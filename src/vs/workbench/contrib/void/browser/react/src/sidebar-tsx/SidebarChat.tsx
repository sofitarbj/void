/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import React, { ButtonHTMLAttributes, FormEvent, FormHTMLAttributes, Fragment, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';


import { useAccessor, useChatThreadsState, useChatThreadsStreamState, useSettingsState, useActiveURI, useCommandBarState, useFullChatThreadsStreamState } from '../util/services.js';
import { useLocalVoiceModel, useLocalVoiceRecorder } from '../util/localVoiceModel.js';
import { localVoiceModelService } from '../../../localVoiceModelService.js';
import { ScrollType } from '../../../../../../../editor/common/editorCommon.js';

import { ChatMarkdownRender, ChatMessageLocation, getApplyBoxId } from '../markdown/ChatMarkdownRender.js';
import { URI } from '../../../../../../../base/common/uri.js';
import { IDisposable } from '../../../../../../../base/common/lifecycle.js';
import { ErrorDisplay } from './ErrorDisplay.js';
import { BlockCode, TextAreaFns, VoidCustomDropdownBox, VoidInputBox2, VoidSlider, VoidSwitch, VoidDiffEditor } from '../util/inputs.js';
import { ModelDropdown, } from '../void-settings-tsx/ModelDropdown.js';
import { PastThreadsList } from './SidebarThreadSelector.js';
import { CodeenPictogram } from '../util/CodeenWordmark.js';
import { VOID_CTRL_L_ACTION_ID } from '../../../actionIDs.js';
import { VOID_OPEN_SETTINGS_ACTION_ID } from '../../../voidSettingsPane.js';
import { ChatMode, displayInfoOfProviderName, FeatureName, isFeatureNameDisabled } from '../../../../../../../workbench/contrib/void/common/voidSettingsTypes.js';
import { ICommandService } from '../../../../../../../platform/commands/common/commands.js';
import { WarningBox } from '../void-settings-tsx/WarningBox.js';
import { getModelCapabilities, getIsReasoningEnabledState } from '../../../../common/modelCapabilities.js';
import { estimateTokens } from '../../../../common/tokenizer.js';
import { AlertTriangle, File, Ban, Check, ChevronRight, ChevronLeft, Dot, FileIcon, Mic, Pencil, Undo, Undo2, X, Flag, Copy as CopyIcon, Info, CirclePlus, Ellipsis, CircleEllipsis, Folder, ALargeSmall, TypeOutline, Text, Paperclip, Plus, History, Settings, Terminal, FileCode, FileText, Trash2 } from 'lucide-react';
import { ChatMessage, CheckpointEntry, StagingSelectionItem, ToolMessage } from '../../../../common/chatThreadServiceTypes.js';
import { approvalTypeOfBuiltinToolName, BuiltinToolCallParams, BuiltinToolName, ToolName, LintErrorItem, ToolApprovalType, toolApprovalTypes } from '../../../../common/toolsServiceTypes.js';
import { CopyButton, EditToolAcceptRejectButtonsHTML, IconShell1, JumpToFileButton, JumpToTerminalButton, StatusIndicator, StatusIndicatorForApplyButton, useApplyStreamState, useEditToolStreamState } from '../markdown/ApplyBlockHoverButtons.js';
import { IsRunningType } from '../../../chatThreadService.js';
import { acceptAllBg, acceptBorder, buttonFontSize, buttonTextColor, rejectAllBg, rejectBg, rejectBorder } from '../../../../common/helpers/colors.js';
import { builtinToolNames, isABuiltinToolName, MAX_FILE_CHARS_PAGE, MAX_TERMINAL_INACTIVE_TIME } from '../../../../common/prompt/prompts.js';
import { RawToolCallObj } from '../../../../common/sendLLMMessageTypes.js';
import ErrorBoundary from './ErrorBoundary.js';
import { ToolApprovalTypeSwitch } from '../void-settings-tsx/Settings.js';

import { persistentTerminalNameOfId } from '../../../terminalToolService.js';
import { removeMCPToolNamePrefix } from '../../../../common/mcpServiceTypes.js';



export const IconX = ({ size, className = '', ...props }: { size: number, className?: string } & React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			className={className}
			{...props}
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				d='M6 18 18 6M6 6l12 12'
			/>
		</svg>
	);
};

const IconArrowUp = ({ size, className = '' }: { size: number, className?: string }) => {
	return (
		<svg
			width={size}
			height={size}
			className={className}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill="black"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
			></path>
		</svg>
	);
};


const IconSquare = ({ size, className = '' }: { size: number, className?: string }) => {
	return (
		<svg
			className={className}
			stroke="black"
			fill="black"
			strokeWidth="0"
			viewBox="0 0 24 24"
			width={size}
			height={size}
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
		</svg>
	);
};


export const IconWarning = ({ size, className = '' }: { size: number, className?: string }) => {
	return (
		<svg
			className={className}
			stroke="currentColor"
			fill="currentColor"
			strokeWidth="0"
			viewBox="0 0 16 16"
			width={size}
			height={size}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.56 1h.88l6.54 12.26-.44.74H1.44L1 13.26 7.56 1zM8 2.28L2.28 13H13.7L8 2.28zM8.625 12v-1h-1.25v1h1.25zm-1.25-2V6h1.25v4h-1.25z"
			/>
		</svg>
	);
};


export const IconLoading = ({ className = '' }: { className?: string }) => {

	const [loadingText, setLoadingText] = useState('.');

	useEffect(() => {
		let intervalId;

		// Function to handle the animation
		const toggleLoadingText = () => {
			if (loadingText === '...') {
				setLoadingText('.');
			} else {
				setLoadingText(loadingText + '.');
			}
		};

		// Start the animation loop
		intervalId = setInterval(toggleLoadingText, 300);

		// Cleanup function to clear the interval when component unmounts
		return () => clearInterval(intervalId);
	}, [loadingText, setLoadingText]);

	return <div className={`${className}`}>{loadingText}</div>;

}



// SLIDER ONLY:
const ReasoningOptionSlider = ({ featureName }: { featureName: FeatureName }) => {
	const accessor = useAccessor()

	const voidSettingsService = accessor.get('IVoidSettingsService')
	const voidSettingsState = useSettingsState()

	const modelSelection = voidSettingsState.modelSelectionOfFeature[featureName]
	const overridesOfModel = voidSettingsState.overridesOfModel

	if (!modelSelection) return null

	const { modelName, providerName } = modelSelection
	const { reasoningCapabilities } = getModelCapabilities(providerName, modelName, overridesOfModel)
	const { canTurnOffReasoning, reasoningSlider: reasoningBudgetSlider } = reasoningCapabilities || {}

	const modelSelectionOptions = voidSettingsState.optionsOfModelSelection[featureName][providerName]?.[modelName]
	const isReasoningEnabled = getIsReasoningEnabledState(featureName, providerName, modelName, modelSelectionOptions, overridesOfModel)

	if (canTurnOffReasoning && !reasoningBudgetSlider) { // if it's just a on/off toggle without a power slider
		return <div className='flex items-center gap-x-2'>
			<span className='text-void-fg-3 text-xs pointer-events-none inline-block w-10 pr-1'>Thinking</span>
			<VoidSwitch
				size='xxs'
				value={isReasoningEnabled}
				onChange={(newVal) => {
					const isOff = canTurnOffReasoning && !newVal
					voidSettingsService.setOptionsOfModelSelection(featureName, modelSelection.providerName, modelSelection.modelName, { reasoningEnabled: !isOff })
				}}
			/>
		</div>
	}

	if (reasoningBudgetSlider?.type === 'budget_slider') { // if it's a slider
		const { min: min_, max, default: defaultVal } = reasoningBudgetSlider

		const nSteps = 8 // only used in calculating stepSize, stepSize is what actually matters
		const stepSize = Math.round((max - min_) / nSteps)

		const valueIfOff = min_ - stepSize
		const min = canTurnOffReasoning ? valueIfOff : min_
		const value = isReasoningEnabled ? voidSettingsState.optionsOfModelSelection[featureName][modelSelection.providerName]?.[modelSelection.modelName]?.reasoningBudget ?? defaultVal
			: valueIfOff

		return <div className='flex items-center gap-x-2'>
			<span className='text-void-fg-3 text-xs pointer-events-none inline-block w-10 pr-1'>Thinking</span>
			<VoidSlider
				width={50}
				size='xs'
				min={min}
				max={max}
				step={stepSize}
				value={value}
				onChange={(newVal) => {
					const isOff = canTurnOffReasoning && newVal === valueIfOff
					voidSettingsService.setOptionsOfModelSelection(featureName, modelSelection.providerName, modelSelection.modelName, { reasoningEnabled: !isOff, reasoningBudget: newVal })
				}}
			/>
			<span className='text-void-fg-3 text-xs pointer-events-none'>{isReasoningEnabled ? `${value} tokens` : 'Thinking disabled'}</span>
		</div>
	}

	if (reasoningBudgetSlider?.type === 'effort_slider') {

		const { values, default: defaultVal } = reasoningBudgetSlider

		const min = canTurnOffReasoning ? -1 : 0
		const max = values.length - 1

		const currentEffort = voidSettingsState.optionsOfModelSelection[featureName][modelSelection.providerName]?.[modelSelection.modelName]?.reasoningEffort ?? defaultVal
		const valueIfOff = -1
		const value = isReasoningEnabled && currentEffort ? values.indexOf(currentEffort) : valueIfOff

		const currentEffortCapitalized = currentEffort.charAt(0).toUpperCase() + currentEffort.slice(1, Infinity)

		return <div className='flex items-center gap-x-2'>
			<span className='text-void-fg-3 text-xs pointer-events-none inline-block w-10 pr-1'>Thinking</span>
			<VoidSlider
				width={30}
				size='xs'
				min={min}
				max={max}
				step={1}
				value={value}
				onChange={(newVal) => {
					const isOff = canTurnOffReasoning && newVal === valueIfOff
					voidSettingsService.setOptionsOfModelSelection(featureName, modelSelection.providerName, modelSelection.modelName, { reasoningEnabled: !isOff, reasoningEffort: values[newVal] ?? undefined })
				}}
			/>
			<span className='text-void-fg-3 text-xs pointer-events-none'>{isReasoningEnabled ? `${currentEffortCapitalized}` : 'Thinking disabled'}</span>
		</div>
	}

	return null
}



export const AttachFileButton = ({ className }: { className?: string }) => {
	const accessor = useAccessor()
	const fileDialogService = accessor.get('IFileDialogService')
	const chatThreadsService = accessor.get('IChatThreadService')
	const languageService = accessor.get('ILanguageService')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleUris = useCallback((uris: readonly URI[]) => {
		for (const uri of uris) {
			chatThreadsService.addNewStagingSelection({
				type: 'File',
				uri,
				language: languageService?.guessLanguageIdByFilepathOrFirstLine?.(uri) || '',
				state: { wasAddedAsCurrentFile: false },
			})
		}
	}, [chatThreadsService, languageService])

	const onClick = useCallback(async () => {
		if (fileDialogService?.showOpenDialog) {
			try {
				const uris = await fileDialogService.showOpenDialog({
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: true,
					title: 'Attach Files to Chat'
				})
				if (uris && uris.length > 0) {
					handleUris(uris)
				}
				return
			} catch (err) {
				console.error('Error opening file dialog:', err)
			}
		}
		// Fallback native file input
		fileInputRef.current?.click()
	}, [fileDialogService, handleUris])

	const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files) return
		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const path = (file as any).path
			if (path) {
				handleUris([URI.file(path)])
			}
		}
		if (fileInputRef.current) fileInputRef.current.value = ''
	}, [handleUris])

	return (
		<>
			<input
				ref={fileInputRef}
				type='file'
				multiple
				className='hidden'
				onChange={onFileInputChange}
			/>
			<button
				type='button'
				className={`flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer ${className ?? ''}`}
				onClick={onClick}
				title='Attach file'
			>
				<Paperclip size={13} strokeWidth={2} />
			</button>
		</>
	)
}


// Context Window Indicator - circular SVG ring that fills based on context usage
const ContextWindowIndicator = ({ featureName }: { featureName: FeatureName }) => {
	const accessor = useAccessor()
	const settingsState = useSettingsState()
	const chatThreadsState = useChatThreadsState()

	const currentThread = chatThreadsState.allThreads[chatThreadsState.currentThreadId]
	const modelSelection = settingsState.modelSelectionOfFeature[featureName]

	const modelCapabilities = useMemo(() => {
		if (!modelSelection) return null
		return getModelCapabilities(modelSelection.providerName, modelSelection.modelName, settingsState.overridesOfModel)
	}, [modelSelection, settingsState.overridesOfModel])

	const estimatedUsage = useMemo(() => {
		if (!currentThread || !modelCapabilities) return 0

		const cumulativeCount = currentThread.state.cumulativeTokenCount || 0
		if (cumulativeCount > 0) return cumulativeCount

		const chatMode = settingsState.globalSettings.chatMode
		const numTools = chatMode === 'agent' ? 10 : chatMode === 'gather' ? 2 : 0
		const toolOverhead = numTools * 150

		let totalTokens = 3
		totalTokens += 800
		totalTokens += toolOverhead

		for (const message of currentThread.messages) {
			totalTokens += 4
			if (message.role === 'user' && 'content' in message) {
				totalTokens += estimateTokens(message.content)
				if ('selections' in message && message.selections) {
					for (const sel of message.selections) {
						if ('content' in sel) totalTokens += estimateTokens((sel as any).content ?? '')
					}
				}
			} else if (message.role === 'assistant' && 'displayContent' in message) {
				totalTokens += 3
				totalTokens += estimateTokens(message.displayContent)
				if ('reasoning' in message && message.reasoning) {
					totalTokens += estimateTokens(message.reasoning)
				}
			} else if (message.role === 'tool' && 'content' in message) {
				totalTokens += estimateTokens((message as any).content ?? '')
			}
		}

		return totalTokens
	}, [currentThread, modelCapabilities, settingsState.globalSettings.chatMode])

	const contextWindow = modelCapabilities?.contextWindow || 128000
	const usagePercentage = Math.min((estimatedUsage / contextWindow) * 100, 100)
	const circumference = 2 * Math.PI * 6
	const strokeDashoffset = circumference - (usagePercentage / 100) * circumference

	const getColor = () => {
		if (usagePercentage < 50) return 'text-void-fg-3'
		if (usagePercentage < 75) return 'text-yellow-500'
		if (usagePercentage < 90) return 'text-orange-500'
		return 'text-red-500'
	}

	const title = modelCapabilities
		? `Context window: ${formatTokenCount(estimatedUsage)} / ${formatTokenCount(contextWindow)} (${usagePercentage.toFixed(1)}%)`
		: 'Select a model to see context window usage'

	return (
		<button
			type='button'
			className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${getColor()} hover:text-void-fg-1`}
			title={title}
		>
			<svg width='14' height='14' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<circle cx='8' cy='8' r='6' stroke='currentColor' strokeWidth='1.5' strokeOpacity='0.3' />
				<circle
					cx='8'
					cy='8'
					r='6'
					stroke='currentColor'
					strokeWidth='1.5'
					strokeDasharray={circumference.toFixed(1)}
					strokeDashoffset={strokeDashoffset.toFixed(1)}
					strokeLinecap='round'
					transform='rotate(-90 8 8)'
				/>
			</svg>
		</button>
	)
}


const nameOfChatMode = {
	'normal': 'Chat',
	'gather': 'Gather',
	'agent': 'Agent',
	'plan': 'Plan',
}

const detailOfChatMode = {
	'normal': 'Normal chat',
	'gather': 'Reads files, but can\'t edit',
	'agent': 'Edits files and uses tools',
	'plan': 'Research and write an implementation plan',
}


export const ChatModeDropdown = ({ className }: { className: string }) => {
	const accessor = useAccessor()

	const voidSettingsService = accessor.get('IVoidSettingsService')
	const settingsState = useSettingsState()

	const options: ChatMode[] = useMemo(() => ['normal', 'gather', 'agent', 'plan'], [])

	const onChangeOption = useCallback((newVal: ChatMode) => {
		voidSettingsService.setGlobalSetting('chatMode', newVal)
	}, [voidSettingsService])

	return <VoidCustomDropdownBox
		className={className}
		options={options}
		selectedOption={settingsState.globalSettings.chatMode}
		onChangeOption={onChangeOption}
		getOptionDisplayName={(val) => nameOfChatMode[val]}
		getOptionDropdownName={(val) => nameOfChatMode[val]}
		getOptionDropdownDetail={(val) => detailOfChatMode[val]}
		getOptionsEqual={(a, b) => a === b}
	/>

}


const formatTokenCount = (n: number): string => {
	if (n < 1000) return `${n}`
	if (n < 10_000) return `${(n / 1000).toFixed(1)}k`
	return `${Math.round(n / 1000)}k`
}

const ReviewChangesButton = () => {
	const accessor = useAccessor()
	const commandBarState = useCommandBarState()
	const numFiles = commandBarState.sortedURIs.length
	if (numFiles === 0) return null

	return (
		<button
			type="button"
			onClick={() => {
				const firstUri = commandBarState.sortedURIs[0]
				if (firstUri) voidOpenFileFn(firstUri, accessor)
			}}
			className="flex items-center gap-1 text-[11px] font-mono font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-sm px-2 py-0.5 transition-colors cursor-pointer shadow-[0_0_8px_rgba(0,220,130,0.15)]"
			title="Review pending file changes"
		>
			<FileCode size={12} className="text-primary" />
			<span>Review Changes</span>
		</button>
	)
}

interface VoidChatAreaProps {
	// Required
	children: React.ReactNode; // This will be the input component

	// Form controls
	micButton?: React.ReactNode;
	onSubmit: () => void;
	onAbort: () => void;
	isStreaming: boolean;
	isDisabled?: boolean;
	divRef?: React.RefObject<HTMLDivElement | null>;

	// UI customization
	className?: string;
	showModelDropdown?: boolean;
	showSelections?: boolean;
	showProspectiveSelections?: boolean;
	loadingIcon?: React.ReactNode;

	selections?: StagingSelectionItem[]
	setSelections?: (s: StagingSelectionItem[]) => void

	onClickAnywhere?: () => void;
	// Optional close button
	onClose?: () => void;

	featureName: FeatureName;

	// Live token estimate for the current draft
	tokenCount?: number;
	contextWindow?: number;
}

export const VoidChatArea: React.FC<VoidChatAreaProps> = ({
	children,
	micButton,
	onSubmit,
	onAbort,
	onClose,
	onClickAnywhere,
	divRef,
	isStreaming = false,
	isDisabled = false,
	className = '',
	showModelDropdown = true,
	showSelections = false,
	showProspectiveSelections = false,
	selections,
	setSelections,
	featureName,
	loadingIcon,
	tokenCount,
	contextWindow,
}) => {
	return (
		<div
			ref={divRef}
			className={`
				gap-x-1
				flex flex-col p-2 relative input text-left shrink-0
				rounded-sm
				bg-surface-panel
				transition-all duration-200
				border border-border-hairline focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,220,130,0.08)] hover:border-border-subtle
				overflow-visible
				${className}
			`}
			onClick={(e) => {
				onClickAnywhere?.()
			}}
		>
			{/* Selections section */}
			{showSelections && selections && setSelections && (
				<SelectedFiles
					type='staging'
					selections={selections}
					setSelections={setSelections}
					showProspectiveSelections={showProspectiveSelections}
				/>
			)}

			{/* Input section */}
			<div className="relative w-full">
				{children}

				{/* Close button (X) if onClose is provided */}
				{onClose && (
					<div className='absolute -top-1 -right-1 cursor-pointer z-1'>
						<IconX
							size={12}
							className="stroke-[2] opacity-80 text-text-muted hover:text-text-primary hover:brightness-110"
							onClick={onClose}
						/>
					</div>
				)}
			</div>

			{/* Bottom row */}
			<div className='flex flex-row justify-between items-center gap-1 pt-1'>
				{showModelDropdown && (
					<div className='flex items-center flex-wrap gap-x-1.5 gap-y-1 text-nowrap'>
						{featureName === 'Chat' && (
							<ChatModeDropdown className='text-xs text-text-secondary bg-surface-elevated hover:bg-surface-hover rounded-sm py-0.5 px-2 transition-colors' />
						)}
						<ModelDropdown
							featureName={featureName}
							className='text-xs text-text-secondary bg-surface-elevated hover:bg-surface-hover rounded-sm py-0.5 px-2 transition-colors'
						/>
						{featureName === 'Chat' && <AttachFileButton className='text-text-muted hover:text-text-primary p-0.5' />}
						{featureName === 'Chat' && <ReviewChangesButton />}
					</div>
				)}

				<div className="flex items-center gap-2">
					{isStreaming && loadingIcon}
					{featureName === 'Chat' && <ContextWindowIndicator featureName={featureName} />}
					{featureName === 'Chat' && micButton}
					{isStreaming ? (
						<ButtonStop onClick={onAbort} />
					) : (
						<ButtonSubmit onClick={onSubmit} disabled={isDisabled} />
					)}
				</div>
			</div>
		</div>
	);
};




type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>
const DEFAULT_BUTTON_SIZE = 22;
export const ButtonSubmit = ({ className, disabled, ...props }: ButtonProps & Required<Pick<ButtonProps, 'disabled'>>) => {

	return <button
		type='button'
		className={`rounded-full flex-shrink-0 flex-grow-0 flex items-center justify-center transition-all duration-150
			${disabled ? 'bg-surface-elevated text-text-muted/50 border border-border-hairline cursor-default' : 'bg-primary text-black hover:brightness-110 active:scale-95 shadow-[0_0_10px_rgba(0,220,130,0.3)] cursor-pointer font-semibold'}
			${className}
		`}
		// data-tooltip-id='void-tooltip'
		// data-tooltip-content={'Send'}
		// data-tooltip-place='left'
		{...props}
	>
		<IconArrowUp size={DEFAULT_BUTTON_SIZE} className="stroke-[2] p-[2px]" />
	</button>
}

export const ButtonStop = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
	return <button
		className={`rounded-full flex-shrink-0 flex-grow-0 cursor-pointer flex items-center justify-center transition-all duration-150
			bg-red-500/90 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] active:scale-95
			${className}
		`}
		type='button'
		{...props}
	>
		<IconSquare size={DEFAULT_BUTTON_SIZE} className="stroke-[3] p-[7px]" />
	</button>
}



const scrollToBottom = (divRef: { current: HTMLElement | null }) => {
	if (divRef.current) {
		divRef.current.scrollTop = divRef.current.scrollHeight;
	}
};



const ScrollToBottomContainer = ({ children, className, style, scrollContainerRef }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, scrollContainerRef: React.MutableRefObject<HTMLDivElement | null> }) => {
	const [isAtBottom, setIsAtBottom] = useState(true); // Start at bottom

	const divRef = scrollContainerRef

	const onScroll = () => {
		const div = divRef.current;
		if (!div) return;

		const isBottom = Math.abs(
			div.scrollHeight - div.clientHeight - div.scrollTop
		) < 4;

		setIsAtBottom(isBottom);
	};

	// When children change (new messages added)
	useEffect(() => {
		if (isAtBottom) {
			scrollToBottom(divRef);
		}
	}, [children, isAtBottom]); // Dependency on children to detect new messages

	// Initial scroll to bottom
	useEffect(() => {
		scrollToBottom(divRef);
	}, []);

	return (
		<div
			ref={divRef}
			onScroll={onScroll}
			className={className}
			style={style}
		>
			{children}
		</div>
	);
};

export const getRelative = (uri: URI, accessor: ReturnType<typeof useAccessor>) => {
	const workspaceContextService = accessor.get('IWorkspaceContextService')
	let path: string
	const isInside = workspaceContextService.isInsideWorkspace(uri)
	if (isInside) {
		const f = workspaceContextService.getWorkspace().folders.find(f => uri.fsPath?.startsWith(f.uri.fsPath))
		if (f) { path = uri.fsPath.replace(f.uri.fsPath, '') }
		else { path = uri.fsPath }
	}
	else {
		path = uri.fsPath
	}
	return path || undefined
}

export const getFolderName = (pathStr: string) => {
	// 'unixify' path
	pathStr = pathStr.replace(/[/\\]+/g, '/') // replace any / or \ or \\ with /
	const parts = pathStr.split('/') // split on /
	// Filter out empty parts (the last element will be empty if path ends with /)
	const nonEmptyParts = parts.filter(part => part.length > 0)
	if (nonEmptyParts.length === 0) return '/' // Root directory
	if (nonEmptyParts.length === 1) return nonEmptyParts[0] + '/' // Only one folder
	// Get the last two parts
	const lastTwo = nonEmptyParts.slice(-2)
	return lastTwo.join('/') + '/'
}

export const getBasename = (pathStr: string, parts: number = 1) => {
	// 'unixify' path
	pathStr = pathStr.replace(/[/\\]+/g, '/') // replace any / or \ or \\ with /
	const allParts = pathStr.split('/') // split on /
	if (allParts.length === 0) return pathStr
	return allParts.slice(-parts).join('/')
}



// Open file utility function
export const voidOpenFileFn = (
	uri: URI,
	accessor: ReturnType<typeof useAccessor>,
	range?: [number, number]
) => {
	const commandService = accessor.get('ICommandService')
	const editorService = accessor.get('ICodeEditorService')

	// Get editor selection from CodeSelection range
	let editorSelection = undefined;

	// If we have a selection, create an editor selection from the range
	if (range) {
		editorSelection = {
			startLineNumber: range[0],
			startColumn: 1,
			endLineNumber: range[1],
			endColumn: Number.MAX_SAFE_INTEGER,
		};
	}

	// open the file
	commandService.executeCommand('vscode.open', uri).then(() => {

		// select the text
		setTimeout(() => {
			if (!editorSelection) return;

			const editor = editorService.getActiveCodeEditor()
			if (!editor) return;

			editor.setSelection(editorSelection)
			editor.revealRange(editorSelection, ScrollType.Immediate)

		}, 50) // needed when document was just opened and needs to initialize

	})

};


export const SelectedFiles = (
	{ type, selections, setSelections, showProspectiveSelections, messageIdx, }:
		| { type: 'past', selections: StagingSelectionItem[]; setSelections?: undefined, showProspectiveSelections?: undefined, messageIdx: number, }
		| { type: 'staging', selections: StagingSelectionItem[]; setSelections: ((newSelections: StagingSelectionItem[]) => void), showProspectiveSelections?: boolean, messageIdx?: number }
) => {

	const accessor = useAccessor()
	const commandService = accessor.get('ICommandService')
	const modelReferenceService = accessor.get('IVoidModelService')




	// state for tracking prospective files
	const { uri: currentURI } = useActiveURI()
	const [recentUris, setRecentUris] = useState<URI[]>([])
	const maxRecentUris = 10
	const maxProspectiveFiles = 3
	useEffect(() => { // handle recent files
		if (!currentURI) return
		setRecentUris(prev => {
			const withoutCurrent = prev.filter(uri => uri.fsPath !== currentURI.fsPath) // remove duplicates
			const withCurrent = [currentURI, ...withoutCurrent]
			return withCurrent.slice(0, maxRecentUris)
		})
	}, [currentURI])
	const [prospectiveSelections, setProspectiveSelections] = useState<StagingSelectionItem[]>([])


	// handle prospective files
	useEffect(() => {
		const computeRecents = async () => {
			const prospectiveURIs = recentUris
				.filter(uri => !selections.find(s => s.type === 'File' && s.uri.fsPath === uri.fsPath))
				.slice(0, maxProspectiveFiles)

			const answer: StagingSelectionItem[] = []
			for (const uri of prospectiveURIs) {
				answer.push({
					type: 'File',
					uri: uri,
					language: (await modelReferenceService.getModelSafe(uri)).model?.getLanguageId() || 'plaintext',
					state: { wasAddedAsCurrentFile: false },
				})
			}
			return answer
		}

		// add a prospective file if type === 'staging' and if the user is in a file, and if the file is not selected yet
		if (type === 'staging' && showProspectiveSelections) {
			computeRecents().then((a) => setProspectiveSelections(a))
		}
		else {
			setProspectiveSelections([])
		}
	}, [recentUris, selections, type, showProspectiveSelections])


	const allSelections = [...selections, ...prospectiveSelections]

	if (allSelections.length === 0) {
		return null
	}

	return (
		<div className='flex items-center flex-wrap text-left relative gap-x-0.5 gap-y-1 pb-0.5'>

			{allSelections.map((selection, i) => {

				const isThisSelectionProspective = i > selections.length - 1

				const thisKey = selection.type === 'CodeSelection' ? selection.type + selection.language + selection.range + selection.state.wasAddedAsCurrentFile + selection.uri.fsPath
					: selection.type === 'File' ? selection.type + selection.language + selection.state.wasAddedAsCurrentFile + selection.uri.fsPath
						: selection.type === 'Folder' ? selection.type + selection.language + selection.state + selection.uri.fsPath
							: i

				const SelectionIcon = (
					selection.type === 'File' ? File
						: selection.type === 'Folder' ? Folder
							: selection.type === 'CodeSelection' ? Text
								: (undefined as never)
				)

				return <div // container for summarybox and code
					key={thisKey}
					className={`flex flex-col space-y-[1px]`}
				>
					{/* tooltip for file path */}
					<span className="truncate overflow-hidden text-ellipsis"
						data-tooltip-id='void-tooltip'
						data-tooltip-content={getRelative(selection.uri, accessor)}
						data-tooltip-place='top'
						data-tooltip-delay-show={3000}
					>
						{/* summarybox */}
						<div
							className={`
								inline-flex items-center gap-1.5 relative
								px-2 py-0.5
								w-fit h-fit
								select-none
								text-[11px] font-mono text-nowrap
								border rounded
								${isThisSelectionProspective ? 'bg-surface-panel/60 text-text-muted border-border-hairline opacity-75' : 'bg-surface-panel hover:bg-surface-hover text-text-secondary hover:text-primary border-border-hairline hover:border-primary/40'}
								transition-colors duration-150 cursor-pointer shadow-xs
							`}
							onClick={() => {
								if (type !== 'staging') return; // (never)
								if (isThisSelectionProspective) { // add prospective selection to selections
									setSelections([...selections, selection])
								}
								else if (selection.type === 'File') { // open files
									voidOpenFileFn(selection.uri, accessor);

									const wasAddedAsCurrentFile = selection.state.wasAddedAsCurrentFile
									if (wasAddedAsCurrentFile) {
										// make it so the file is added permanently, not just as the current file
										const newSelection: StagingSelectionItem = { ...selection, state: { ...selection.state, wasAddedAsCurrentFile: false } }
										setSelections([
											...selections.slice(0, i),
											newSelection,
											...selections.slice(i + 1)
										])
									}
								}
								else if (selection.type === 'CodeSelection') {
									voidOpenFileFn(selection.uri, accessor, selection.range);
								}
								else if (selection.type === 'Folder') {
									// TODO!!! reveal in tree
								}
							}}
						>
							{<SelectionIcon size={10} />}

							{ // file name and range
								getBasename(selection.uri.fsPath)
								+ (selection.type === 'CodeSelection' ? ` (${selection.range[0]}-${selection.range[1]})` : '')
							}

							{selection.type === 'File' && selection.state.wasAddedAsCurrentFile && messageIdx === undefined && currentURI?.fsPath === selection.uri.fsPath ?
								<span className={`text-[8px] 'void-opacity-60 text-void-fg-4`}>
									{`(Current File)`}
								</span>
								: null
							}

							{type === 'staging' && !isThisSelectionProspective ? // X button
								<div // box for making it easier to click
									className='cursor-pointer z-1 self-stretch flex items-center justify-center'
									onClick={(e) => {
										e.stopPropagation(); // don't open/close selection
										if (type !== 'staging') return;
										setSelections([...selections.slice(0, i), ...selections.slice(i + 1)])
									}}
								>
									<IconX
										className='stroke-[2]'
										size={10}
									/>
								</div>
								: <></>
							}
						</div>
					</span>
				</div>

			})}


		</div>

	)
}


type ToolHeaderParams = {
	icon?: React.ReactNode;
	title: React.ReactNode;
	desc1: React.ReactNode;
	desc1OnClick?: () => void;
	desc2?: React.ReactNode;
	isError?: boolean;
	info?: string;
	desc1Info?: string;
	isRejected?: boolean;
	numResults?: number;
	hasNextPage?: boolean;
	children?: React.ReactNode;
	bottomChildren?: React.ReactNode;
	onClick?: () => void;
	desc2OnClick?: () => void;
	isOpen?: boolean;
	className?: string;
}

const ToolHeaderWrapper = ({
	icon,
	title,
	desc1,
	desc1OnClick,
	desc1Info,
	desc2,
	numResults,
	hasNextPage,
	children,
	info,
	bottomChildren,
	isError,
	onClick,
	desc2OnClick,
	isOpen,
	isRejected,
	className, // applies to the main content
}: ToolHeaderParams) => {

	const [isOpen_, setIsOpen] = useState(false);
	const isExpanded = isOpen !== undefined ? isOpen : isOpen_

	const isDropdown = children !== undefined // null ALLOWS dropdown
	const isClickable = !!(isDropdown || onClick)

	const isDesc1Clickable = !!desc1OnClick

	// Detect if this is a running/loading tool (title contains loading icon)
	const isRunning = typeof title !== 'string'

	// Left border accent color based on state (Obsidian Precision)
	const borderAccent = isError ? 'border-l-red-500'
		: isRejected ? 'border-l-border-subtle'
		: isRunning ? 'border-l-primary animate-pulse'
		: 'border-l-agent-cyan'

	const desc1HTML = <span
		className={`text-text-secondary text-xs truncate ml-2 font-mono
			${isDesc1Clickable ? 'cursor-pointer hover:text-text-primary transition-all duration-150' : ''}
		`}
		onClick={desc1OnClick}
		{...desc1Info ? {
			'data-tooltip-id': 'void-tooltip',
			'data-tooltip-content': desc1Info,
			'data-tooltip-place': 'top',
			'data-tooltip-delay-show': 1000,
		} : {}}
	>{desc1}</span>

	return (<div className='my-0.5 select-none'>
		<div className={`w-full rounded-sm px-1 py-0.5 transition-all duration-150 hover:bg-white/[0.04] ${className}`}>
			{/* header */}
			<div className={`select-none flex items-center min-h-[20px]`}>
				<div className={`flex items-center w-full gap-x-2 overflow-hidden justify-between ${isRejected ? 'line-through opacity-50' : ''}`}>
					{/* left */}
					<div // container for if desc1 is clickable
						className='ml-0.5 flex items-center overflow-hidden'
					>
						{/* title eg "> Edited File" */}
						<div className={`
							flex items-center min-w-0 overflow-hidden grow
							${isClickable ? 'cursor-pointer hover:brightness-125 transition-all duration-150' : ''}
						`}
							onClick={() => {
								if (isDropdown) { setIsOpen(v => !v); }
								if (onClick) { onClick(); }
							}}
						>
							{isDropdown && (<ChevronRight
								className={`
								text-void-fg-3 mr-0.5 h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150 ease-out
								${isExpanded ? 'rotate-90' : ''}
							`}
							/>)}
							<span className={`flex-shrink-0 text-xs font-medium ${isError ? 'text-red-400' : isRunning ? 'text-blue-300' : 'text-void-fg-2'}`}>{title}</span>

							{!isDesc1Clickable && desc1HTML}
						</div>
						{isDesc1Clickable && desc1HTML}
					</div>

					{/* right */}
					<div className="flex items-center gap-x-1.5 flex-shrink-0">

						{info && <CircleEllipsis
							className='ml-1 text-void-fg-4 opacity-50 flex-shrink-0'
							size={13}
							data-tooltip-id='void-tooltip'
							data-tooltip-content={info}
							data-tooltip-place='top-end'
						/>}

						{isError && <AlertTriangle
							className='text-red-400 opacity-90 flex-shrink-0'
							size={13}
							data-tooltip-id='void-tooltip'
							data-tooltip-content={'Error running tool'}
							data-tooltip-place='top'
						/>}
						{isRejected && <Ban
							className='text-void-fg-4 opacity-70 flex-shrink-0'
							size={13}
							data-tooltip-id='void-tooltip'
							data-tooltip-content={'Canceled'}
							data-tooltip-place='top'
						/>}
						{desc2 && <span className="text-void-fg-4 text-xs" onClick={desc2OnClick}>
							{desc2}
						</span>}
						{numResults !== undefined && (
							<span className="text-void-fg-4 text-[11px] ml-auto mr-0.5">
								{`${numResults}${hasNextPage ? '+' : ''} result${numResults !== 1 ? 's' : ''}`}
							</span>
						)}
					</div>
				</div>
			</div>
			{/* children */}
			{<div
				className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'opacity-100 py-1' : 'max-h-0 opacity-0'}
					text-void-fg-4 rounded-sm overflow-x-auto
				  `}
			>
				{children}
			</div>}
		</div>
		{bottomChildren}
	</div>);
};



const EditTool = ({ toolMessage, threadId, messageIdx, content }: Parameters<ResultWrapper<'edit_file' | 'rewrite_file'>>[0] & { content: string }) => {
	const accessor = useAccessor()
	const isError = false
	const isRejected = toolMessage.type === 'rejected'

	const { rawParams, params, name } = toolMessage
	const filename = params?.uri ? getBasename(params.uri.fsPath) : 'file'
	const isStreaming = toolMessage.type === 'running_now' || toolMessage.type === 'tool_request'
	const editToolType = toolMessage.name === 'edit_file' ? 'diff' as const : 'rewrite' as const

	const title = (
		<span className="flex items-center gap-1.5 font-sans text-xs">
			<span className={isStreaming ? "text-agent-cyan font-medium" : "text-text-muted font-normal"}>
				{isStreaming ? 'Editing' : 'Edited'}
			</span>
			<FileCode size={13} className="text-text-secondary shrink-0" />
			<span className="font-mono text-xs text-text-primary font-medium truncate">{filename}</span>
			{isStreaming && <IconLoading className="w-3 text-agent-cyan" />}
		</span>
	)

	const desc1 = !isStreaming ? <DiffStatsIndicator code={content} type={editToolType} /> : null
	const desc1OnClick = () => params?.uri && voidOpenFileFn(params.uri, accessor)
	const desc1Info = params?.uri ? getRelative(params.uri, accessor) : undefined
	const icon = null
	const componentParams: ToolHeaderParams = { title, desc1, desc1OnClick, desc1Info, isError, icon, isRejected, }

	// Detect agentic planning files
	const agenticFilename = params?.uri?.fsPath ? getAgenticFilename(params.uri.fsPath) : null
	if (agenticFilename) {
		const verb = toolMessage.type === 'running_now' ? 'writing'
			: toolMessage.type === 'success' ? 'updated'
			: toolMessage.type === 'tool_request' ? 'writing'
			: null
		if (verb) {
			componentParams.desc2 = <AgenticFileBadge filename={agenticFilename} verb={verb} />
		}
	}


	if (toolMessage.type === 'running_now' || toolMessage.type === 'tool_request') {
		componentParams.children = <ToolChildrenWrapper className='bg-void-bg-3'>
			<EditToolChildren
				uri={params?.uri}
				code={content}
				type={editToolType}
			/>
		</ToolChildrenWrapper>
		// JumpToFileButton removed in favor of FileLinkText
	}
	else if (toolMessage.type === 'success' || toolMessage.type === 'rejected' || toolMessage.type === 'tool_error') {
		// add apply box
		const applyBoxId = getApplyBoxId({
			threadId: threadId,
			messageIdx: messageIdx,
			tokenIdx: 'N/A',
		})
		// Combine agentic badge (already set above) with accept/reject buttons
		const editButtons = params?.uri ? <EditToolHeaderButtons
			applyBoxId={applyBoxId}
			uri={params.uri}
			codeStr={content}
			toolName={name}
			threadId={threadId}
		/> : null
		componentParams.desc2 = agenticFilename
			? <span className='flex items-center gap-1'>{componentParams.desc2}{editButtons}</span>
			: editButtons

		// add children
		componentParams.children = <ToolChildrenWrapper className='bg-void-bg-3'>
			<EditToolChildren
				uri={params?.uri}
				code={content}
				type={editToolType}
			/>
		</ToolChildrenWrapper>

		if (toolMessage.type === 'success' || toolMessage.type === 'rejected') {
			const { result } = toolMessage
			componentParams.bottomChildren = <BottomChildren title='Lint errors'>
				{result?.lintErrors?.map((error, i) => (
					<div key={i} className='whitespace-nowrap'>Lines {error.startLineNumber}-{error.endLineNumber}: {error.message}</div>
				))}
			</BottomChildren>
		}
		else if (toolMessage.type === 'tool_error') {
			// error
			const { result } = toolMessage
			componentParams.bottomChildren = <BottomChildren title='Error'>
				<CodeChildren>
					{result}
				</CodeChildren>
			</BottomChildren>
		}
	}

	return <ToolHeaderWrapper {...componentParams} />
}

const SimplifiedToolHeader = ({
	title,
	children,
}: {
	title: string;
	children?: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const isDropdown = children !== undefined;
	return (
		<div>
			<div className="w-full">
				{/* header */}
				<div
					className={`select-none flex items-center min-h-[24px] ${isDropdown ? 'cursor-pointer' : ''}`}
					onClick={() => {
						if (isDropdown) { setIsOpen(v => !v); }
					}}
				>
					{isDropdown && (
						<ChevronRight
							className={`text-void-fg-3 mr-0.5 h-4 w-4 flex-shrink-0 transition-transform duration-100 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'rotate-90' : ''}`}
						/>
					)}
					<div className="flex items-center w-full overflow-hidden">
						<span className="text-void-fg-3">{title}</span>
					</div>
				</div>
				{/* children */}
				{<div
					className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0'} text-void-fg-4`}
				>
					{children}
				</div>}
			</div>
		</div>
	);
};




const UserMessageComponent = ({ chatMessage, messageIdx, isCheckpointGhost, currCheckpointIdx, _scrollToBottom }: { chatMessage: ChatMessage & { role: 'user' }, messageIdx: number, currCheckpointIdx: number | undefined, isCheckpointGhost: boolean, _scrollToBottom: (() => void) | null }) => {

	const accessor = useAccessor()
	const chatThreadsService = accessor.get('IChatThreadService')

	// global state
	let isBeingEdited = false
	let stagingSelections: StagingSelectionItem[] = []
	let setIsBeingEdited = (_: boolean) => { }
	let setStagingSelections = (_: StagingSelectionItem[]) => { }

	if (messageIdx !== undefined) {
		const _state = chatThreadsService.getCurrentMessageState(messageIdx)
		isBeingEdited = _state.isBeingEdited
		stagingSelections = _state.stagingSelections
		setIsBeingEdited = (v) => chatThreadsService.setCurrentMessageState(messageIdx, { isBeingEdited: v })
		setStagingSelections = (s) => chatThreadsService.setCurrentMessageState(messageIdx, { stagingSelections: s })
	}


	// local state
	const mode: ChatBubbleMode = isBeingEdited ? 'edit' : 'display'
	const [isFocused, setIsFocused] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [isDisabled, setIsDisabled] = useState(false)
	const [textAreaRefState, setTextAreaRef] = useState<HTMLTextAreaElement | null>(null)
	const textAreaFnsRef = useRef<TextAreaFns | null>(null)
	// initialize on first render, and when edit was just enabled
	const _mustInitialize = useRef(true)
	const _justEnabledEdit = useRef(false)
	useEffect(() => {
		const canInitialize = mode === 'edit' && textAreaRefState
		const shouldInitialize = _justEnabledEdit.current || _mustInitialize.current
		if (canInitialize && shouldInitialize) {
			setStagingSelections(
				(chatMessage.selections || []).map(s => { // quick hack so we dont have to do anything more
					if (s.type === 'File') return { ...s, state: { ...s.state, wasAddedAsCurrentFile: false, } }
					else return s
				})
			)

			if (textAreaFnsRef.current)
				textAreaFnsRef.current.setValue(chatMessage.displayContent || '')

			textAreaRefState.focus();

			_justEnabledEdit.current = false
			_mustInitialize.current = false
		}

	}, [chatMessage, mode, _justEnabledEdit, textAreaRefState, textAreaFnsRef.current, _justEnabledEdit.current, _mustInitialize.current])

	const onOpenEdit = () => {
		setIsBeingEdited(true)
		chatThreadsService.setCurrentlyFocusedMessageIdx(messageIdx)
		_justEnabledEdit.current = true
	}
	const onCloseEdit = () => {
		setIsFocused(false)
		setIsHovered(false)
		setIsBeingEdited(false)
		chatThreadsService.setCurrentlyFocusedMessageIdx(undefined)

	}

	const EditSymbol = mode === 'display' ? Pencil : X


	let chatbubbleContents: React.ReactNode
	if (mode === 'display') {
		chatbubbleContents = <>
			<div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border-hairline/60">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] select-none">
						U
					</div>
					<span className="font-sans text-xs text-text-primary font-medium">
						User
					</span>
				</div>
				<span className="font-mono text-[10px] text-text-muted">
					Prompt
				</span>
			</div>
			<div className="text-sm font-sans text-text-primary leading-relaxed whitespace-pre-wrap select-text">
				{chatMessage.displayContent}
			</div>
			{chatMessage.selections && chatMessage.selections.length > 0 && (
				<div className="mt-2 pt-1 border-t border-border-hairline/40">
					<SelectedFiles type='past' messageIdx={messageIdx} selections={chatMessage.selections} />
				</div>
			)}
		</>
	}
	else if (mode === 'edit') {

		const onSubmit = async () => {

			if (isDisabled) return;
			if (!textAreaRefState) return;
			if (messageIdx === undefined) return;

			// cancel any streams on this thread
			const threadId = chatThreadsService.state.currentThreadId

			await chatThreadsService.abortRunning(threadId)

			// update state
			setIsBeingEdited(false)
			chatThreadsService.setCurrentlyFocusedMessageIdx(undefined)

			// stream the edit
			const userMessage = textAreaRefState.value;
			try {
				await chatThreadsService.editUserMessageAndStreamResponse({ userMessage, messageIdx, threadId })
			} catch (e) {
				console.error('Error while editing message:', e)
			}
			await chatThreadsService.focusCurrentChat()
			requestAnimationFrame(() => _scrollToBottom?.())
		}

		const onAbort = async () => {
			const threadId = chatThreadsService.state.currentThreadId
			await chatThreadsService.abortRunning(threadId)
		}

		const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === 'Escape') {
				onCloseEdit()
			}
			if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
				onSubmit()
			}
		}

		if (!chatMessage.content) { // don't show if empty and not loading (if loading, want to show).
			return null
		}

		chatbubbleContents = <VoidChatArea
			featureName='Chat'
			onSubmit={onSubmit}
			onAbort={onAbort}
			isStreaming={false}
			isDisabled={isDisabled}
			showSelections={true}
			showProspectiveSelections={false}
			selections={stagingSelections}
			setSelections={setStagingSelections}
		>
			<VoidInputBox2
				enableAtToMention
				transparentBg={true}
				ref={setTextAreaRef}
				className='min-h-[46px] max-h-[500px] px-0.5'
				placeholder="Edit your message..."
				onChangeText={(text) => setIsDisabled(!text)}
				onFocus={() => {
					setIsFocused(true)
					chatThreadsService.setCurrentlyFocusedMessageIdx(messageIdx);
				}}
				onBlur={() => {
					setIsFocused(false)
				}}
				onKeyDown={onKeyDown}
				fnsRef={textAreaFnsRef}
				multiline={true}
			/>
		</VoidChatArea>
	}

	const isMsgAfterCheckpoint = currCheckpointIdx !== undefined && currCheckpointIdx === messageIdx - 1

	return <div
		// align chatbubble according to role
		className={`
        relative ml-auto w-full max-w-full
        ${mode === 'edit' ? '' : 'whitespace-pre-wrap'}
        ${isCheckpointGhost && !isMsgAfterCheckpoint ? 'opacity-50 pointer-events-none' : ''}
    `}
		onMouseEnter={() => setIsHovered(true)}
		onMouseLeave={() => setIsHovered(false)}
	>
		<div
			// style chatbubble according to role
			className={`
            text-left rounded-sm w-full
            ${mode === 'edit' ? ''
					: 'p-3 flex flex-col bg-surface-elevated border border-border-hairline text-text-primary shadow-sm hover:border-border-subtle transition-all duration-150 cursor-pointer'
				}
        `}
			onClick={() => { if (mode === 'display') { onOpenEdit() } }}
		>
			{chatbubbleContents}
		</div>



		<div
			className="absolute -top-1 -right-1 translate-x-0 -translate-y-0 z-1 flex items-center gap-0.5"
		>
			{/* Revert button — jump to checkpoint before this message */}
			{mode === 'display' && messageIdx > 0 && (
				<Undo2
					size={16}
					className={`
						cursor-pointer p-[2px]
						bg-void-bg-1 border border-void-border-1 rounded-sm
						transition-opacity duration-200 ease-in-out
						text-void-fg-3 hover:text-void-fg-1
						${isHovered ? 'opacity-100' : 'opacity-0'}
					`}
					data-tooltip-id='void-tooltip'
					data-tooltip-content='Revert to before this message'
					data-tooltip-place='left'
					onClick={(e) => {
						e.stopPropagation()
						chatThreadsService.jumpToCheckpointBeforeMessageIdx({
							threadId: chatThreadsService.state.currentThreadId,
							messageIdx,
							jumpToUserModified: false,
						})
					}}
				/>
			)}
			{/* Edit button */}
			<EditSymbol
				size={18}
				className={`
                    cursor-pointer
                    p-[2px]
                    bg-void-bg-1 border border-void-border-1 rounded-sm
                    transition-opacity duration-200 ease-in-out
                    ${isHovered || (isFocused && mode === 'edit') ? 'opacity-100' : 'opacity-0'}
                `}
				onClick={() => {
					if (mode === 'display') {
						onOpenEdit()
					} else if (mode === 'edit') {
						onCloseEdit()
					}
				}}
			/>
		</div>


	</div>

}

const SmallProseWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div className='
text-void-fg-4
prose
prose-sm
break-words
max-w-none
leading-snug
text-[13px]

[&>:first-child]:!mt-0
[&>:last-child]:!mb-0

prose-h1:text-[14px]
prose-h1:my-4

prose-h2:text-[13px]
prose-h2:my-4

prose-h3:text-[13px]
prose-h3:my-3

prose-h4:text-[13px]
prose-h4:my-2

prose-p:my-2
prose-p:leading-snug
prose-hr:my-2

prose-ul:my-2
prose-ul:pl-4
prose-ul:list-outside
prose-ul:list-disc
prose-ul:leading-snug


prose-ol:my-2
prose-ol:pl-4
prose-ol:list-outside
prose-ol:list-decimal
prose-ol:leading-snug

marker:text-inherit

prose-blockquote:pl-2
prose-blockquote:my-2

prose-code:text-void-fg-3
prose-code:text-[12px]
prose-code:before:content-none
prose-code:after:content-none

prose-pre:text-[12px]
prose-pre:p-2
prose-pre:my-2

prose-table:text-[13px]
'>
		{children}
	</div>
}

const ProseWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div className='
text-void-fg-2
prose
prose-sm
break-words
prose-p:block
prose-hr:my-4
prose-pre:my-2
marker:text-inherit
prose-ol:list-outside
prose-ol:list-decimal
prose-ul:list-outside
prose-ul:list-disc
prose-li:my-0
prose-code:before:content-none
prose-code:after:content-none
prose-headings:prose-sm
prose-headings:font-bold

prose-p:leading-normal
prose-ol:leading-normal
prose-ul:leading-normal

max-w-none
'
	>
		{children}
	</div>
}
const AssistantMessageComponent = ({ chatMessage, isCheckpointGhost, isCommitted, messageIdx }: { chatMessage: ChatMessage & { role: 'assistant' }, isCheckpointGhost: boolean, messageIdx: number, isCommitted: boolean }) => {

	const accessor = useAccessor()
	const chatThreadsService = accessor.get('IChatThreadService')

	const reasoningStr = chatMessage.reasoning?.trim() || null
	const hasReasoning = !!reasoningStr
	const isDoneReasoning = !!chatMessage.displayContent
	const thread = chatThreadsService.getCurrentThread()


	const chatMessageLocation: ChatMessageLocation = {
		threadId: thread.id,
		messageIdx: messageIdx,
	}

	const isEmpty = !chatMessage.displayContent && !chatMessage.reasoning
	if (isEmpty) return null

	return <>
		{/* reasoning token */}
		{hasReasoning &&
			<div className={`${isCheckpointGhost ? 'opacity-50' : ''}`}>
				<ReasoningWrapper isDoneReasoning={isDoneReasoning} isStreaming={!isCommitted}>
					<SmallProseWrapper>
						<ChatMarkdownRender
							string={reasoningStr}
							chatMessageLocation={chatMessageLocation}
							isApplyEnabled={false}
							isLinkDetectionEnabled={true}
						/>
					</SmallProseWrapper>
				</ReasoningWrapper>
			</div>
		}

		{/* assistant message */}
		{chatMessage.displayContent &&
			<div className={`py-0.5 ${isCheckpointGhost ? 'opacity-50' : ''}`}>
				<div className="py-0.5 text-text-primary leading-relaxed">
					<ProseWrapper>
						<ChatMarkdownRender
							string={chatMessage.displayContent || ''}
							chatMessageLocation={chatMessageLocation}
							isApplyEnabled={true}
							isLinkDetectionEnabled={true}
						/>
					</ProseWrapper>
				</div>
			</div>
		}
	</>

}

const ReasoningWrapper = ({ isDoneReasoning, isStreaming, children }: { isDoneReasoning: boolean, isStreaming: boolean, children: React.ReactNode }) => {
	const isDone = isDoneReasoning || !isStreaming
	const isWriting = !isDone
	const [isOpen, setIsOpen] = useState(isWriting)
	const [seconds, setSeconds] = useState(1)
	const startTimeRef = useRef<number | null>(null)
	const finalSecondsRef = useRef<number>(2)

	useEffect(() => {
		if (isWriting) {
			setIsOpen(true)
			if (!startTimeRef.current) {
				startTimeRef.current = Date.now()
			}
			const interval = setInterval(() => {
				if (startTimeRef.current) {
					const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
					setSeconds(elapsed)
					finalSecondsRef.current = elapsed
				}
			}, 1000)
			return () => clearInterval(interval)
		} else {
			// Finished reasoning: auto-collapse
			setIsOpen(false)
		}
	}, [isWriting])

	const displaySeconds = isWriting ? seconds : finalSecondsRef.current

	return (
		<div className="my-0.5 rounded-sm overflow-hidden transition-all duration-200">
			<div
				onClick={() => setIsOpen(v => !v)}
				className="flex items-center justify-between py-1 px-1 cursor-pointer hover:bg-white/[0.04] rounded-sm transition-colors select-none"
			>
				<div className="flex items-center gap-1.5">
					<ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
					{isWriting ? (
						<div className="flex items-center gap-1.5 font-mono text-xs text-agent-cyan">
							<span className="w-1.5 h-1.5 rounded-full bg-agent-cyan animate-pulse" />
							<span>Thinking for {displaySeconds}s...</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors">
							<span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
							<span>Thought for {displaySeconds}s</span>
						</div>
					)}
				</div>
				<span className="text-[10px] font-mono text-text-muted">{isOpen ? 'Hide' : 'Expand'}</span>
			</div>
			{isOpen && (
				<div className="pl-5 pr-1 pb-1 pt-0.5 text-xs text-text-muted font-sans leading-relaxed select-text overflow-x-auto opacity-80">
					{children}
				</div>
			)}
		</div>
	)
}




// should either be past or "-ing" tense, not present tense. Eg. when the LLM searches for something, the user expects it to say "I searched for X" or "I am searching for X". Not "I search X".

const loadingTitleWrapper = (item: React.ReactNode): React.ReactNode => {
	return <span className='flex items-center flex-nowrap'>
		{item}
		<IconLoading className='w-3 text-sm' />
	</span>
}

const titleOfBuiltinToolName = {
	'read_file': { done: 'Read file', proposed: 'Read file', running: loadingTitleWrapper('Reading file') },
	'ls_dir': { done: 'Inspected folder', proposed: 'Inspect folder', running: loadingTitleWrapper('Inspecting folder') },
	'get_dir_tree': { done: 'Inspected folder tree', proposed: 'Inspect folder tree', running: loadingTitleWrapper('Inspecting folder tree') },
	'search_pathnames_only': { done: 'Searched by file name', proposed: 'Search by file name', running: loadingTitleWrapper('Searching by file name') },
	'search_for_files': { done: 'Searched', proposed: 'Search', running: loadingTitleWrapper('Searching') },
	'create_file_or_folder': { done: 'Created', proposed: 'Create', running: loadingTitleWrapper('Creating') },
	'write_to_file': { done: 'Created file', proposed: 'Create file', running: loadingTitleWrapper('Creating file') },
	'delete_file_or_folder': { done: 'Deleted', proposed: 'Delete', running: loadingTitleWrapper('Deleting') },
	'edit_file': { done: `Edited file`, proposed: 'Edit file', running: loadingTitleWrapper('Editing file') },
	'rewrite_file': { done: `Wrote file`, proposed: 'Write file', running: loadingTitleWrapper('Writing file') },
	'run_command': { done: `Ran terminal`, proposed: 'Run terminal', running: loadingTitleWrapper('Running terminal') },
	'run_persistent_command': { done: `Ran terminal`, proposed: 'Run terminal', running: loadingTitleWrapper('Running terminal') },

	'open_persistent_terminal': { done: `Opened terminal`, proposed: 'Open terminal', running: loadingTitleWrapper('Opening terminal') },
	'kill_persistent_terminal': { done: `Killed terminal`, proposed: 'Kill terminal', running: loadingTitleWrapper('Killing terminal') },

	'read_lint_errors': { done: `Read lint errors`, proposed: 'Read lint errors', running: loadingTitleWrapper('Reading lint errors') },
	'search_in_file': { done: 'Searched in file', proposed: 'Search in file', running: loadingTitleWrapper('Searching in file') },

	'send_command_input': { done: 'Sent input to terminal', proposed: 'Send input to terminal', running: loadingTitleWrapper('Sending input') },
	'todo_list': { done: 'Updated task list', proposed: 'Update task list', running: loadingTitleWrapper('Updating tasks') },
	'ask_user_question': { done: 'Asked question', proposed: 'Ask question', running: loadingTitleWrapper('Waiting for answer') },
	'invoke_skill': { done: 'Loaded skill', proposed: 'Load skill', running: loadingTitleWrapper('Loading skill') },
	'search_web': { done: 'Searched web', proposed: 'Search web', running: loadingTitleWrapper('Searching web') },
	'read_url_content': { done: 'Read URL', proposed: 'Read URL', running: loadingTitleWrapper('Reading URL') },
	'create_system_doc': { done: 'Created document', proposed: 'Create document', running: loadingTitleWrapper('Creating document') },
} as const satisfies Record<BuiltinToolName, { done: any, proposed: any, running: any }>


const getTitle = (toolMessage: Pick<ChatMessage & { role: 'tool' }, 'name' | 'type' | 'mcpServerName'>): React.ReactNode => {
	const t = toolMessage

	// non-built-in title
	if (!builtinToolNames.includes(t.name as BuiltinToolName)) {
		// descriptor of Running or Ran etc
		const descriptor =
			t.type === 'success' ? 'Called'
				: t.type === 'running_now' ? 'Calling'
					: t.type === 'tool_request' ? 'Call'
						: t.type === 'rejected' ? 'Call'
							: t.type === 'invalid_params' ? 'Call'
								: t.type === 'tool_error' ? 'Call'
									: 'Call'


		const title = `${descriptor} ${toolMessage.mcpServerName || 'MCP'}`
		if (t.type === 'running_now' || t.type === 'tool_request')
			return loadingTitleWrapper(title)
		return title
	}

	// built-in title
	else {
		const toolName = t.name as BuiltinToolName
		if (t.type === 'success') return titleOfBuiltinToolName[toolName].done
		if (t.type === 'running_now') return titleOfBuiltinToolName[toolName].running
		return titleOfBuiltinToolName[toolName].proposed
	}
}


const toolNameToDesc = (toolName: BuiltinToolName, _toolParams: BuiltinToolCallParams[BuiltinToolName] | undefined, accessor: ReturnType<typeof useAccessor>): {
	desc1: React.ReactNode,
	desc1Info?: string,
} => {

	if (!_toolParams) {
		return { desc1: '', };
	}

	const x = {
		'read_file': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['read_file']
			return {
				desc1: toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			};
		},
		'ls_dir': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['ls_dir']
			return {
				desc1: toolParams?.uri ? getFolderName(toolParams.uri.fsPath) ?? '/' : '/',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			};
		},
		'search_pathnames_only': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['search_pathnames_only']
			return {
				desc1: toolParams?.query ? `"${toolParams.query}"` : '',
			}
		},
		'search_for_files': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['search_for_files']
			return {
				desc1: toolParams?.query ? `"${toolParams.query}"` : '',
			}
		},
		'search_in_file': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['search_in_file'];
			return {
				desc1: toolParams?.query ? `"${toolParams.query}"` : '',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			};
		},
		'create_file_or_folder': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['create_file_or_folder']
			return {
				desc1: toolParams?.isFolder ? (toolParams?.uri ? getFolderName(toolParams.uri.fsPath) ?? '/' : '/') : (toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file'),
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'write_to_file': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['write_to_file']
			return {
				desc1: toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'delete_file_or_folder': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['delete_file_or_folder']
			return {
				desc1: toolParams?.isFolder ? (toolParams?.uri ? getFolderName(toolParams.uri.fsPath) ?? '/' : '/') : (toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file'),
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'rewrite_file': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['rewrite_file']
			return {
				desc1: toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'edit_file': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['edit_file']
			return {
				desc1: toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'run_command': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['run_command']
			return {
				desc1: toolParams?.command ? `"${toolParams.command}"` : '',
			}
		},
		'run_persistent_command': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['run_persistent_command']
			return {
				desc1: toolParams?.command ? `"${toolParams.command}"` : '',
			}
		},
		'open_persistent_terminal': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['open_persistent_terminal']
			return { desc1: '' }
		},
		'kill_persistent_terminal': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['kill_persistent_terminal']
			return { desc1: toolParams?.persistentTerminalId ?? '' }
		},
		'get_dir_tree': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['get_dir_tree']
			return {
				desc1: toolParams?.uri ? getFolderName(toolParams.uri.fsPath) ?? '/' : '/',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'read_lint_errors': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['read_lint_errors']
			return {
				desc1: toolParams?.uri ? getBasename(toolParams.uri.fsPath) : 'file',
				desc1Info: toolParams?.uri ? getRelative(toolParams.uri, accessor) : undefined,
			}
		},
		'send_command_input': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['send_command_input']
			return { desc1: `Terminal ${toolParams?.persistentTerminalId ?? ''}` }
		},
		'todo_list': () => {
			return { desc1: '' }
		},
		'ask_user_question': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['ask_user_question']
			return { desc1: toolParams?.question?.slice(0, 60) || '' }
		},
		'invoke_skill': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['invoke_skill']
			return { desc1: toolParams?.skillName || '' }
		},
		'search_web': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['search_web']
			return { desc1: toolParams?.query ? `"${toolParams.query.slice(0, 50)}"` : '' }
		},
		'read_url_content': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['read_url_content']
			try { return { desc1: new URL(toolParams?.url ?? '').hostname } } catch { return { desc1: toolParams?.url?.slice(0, 40) || '' } }
		},
		'create_system_doc': () => {
			const toolParams = _toolParams as BuiltinToolCallParams['create_system_doc']
			return { desc1: `${toolParams?.type ?? 'doc'}: ${toolParams?.title?.slice(0, 40) || ''}` }
		},
	}

	try {
		return x[toolName]?.() || { desc1: '' }
	}
	catch {
		return { desc1: '' }
	}
}

const ToolRequestAcceptRejectButtons = ({ toolName }: { toolName: ToolName }) => {
	const accessor = useAccessor()
	const chatThreadsService = accessor.get('IChatThreadService')
	const metricsService = accessor.get('IMetricsService')
	const voidSettingsService = accessor.get('IVoidSettingsService')
	const voidSettingsState = useSettingsState()

	const onAccept = useCallback(() => {
		try {
			const threadId = chatThreadsService.state.currentThreadId
			chatThreadsService.approveLatestToolRequest(threadId)
			metricsService.capture('Tool Request Accepted', {})
		} catch (e) { console.error('Error while approving message in chat:', e) }
	}, [chatThreadsService, metricsService])

	const onReject = useCallback(() => {
		try {
			const threadId = chatThreadsService.state.currentThreadId
			chatThreadsService.rejectLatestToolRequest(threadId)
		} catch (e) { console.error('Error while approving message in chat:', e) }
		metricsService.capture('Tool Request Rejected', {})
	}, [chatThreadsService, metricsService])

	const approveButton = (
		<button
			onClick={onAccept}
			className={`
                px-3 py-1.5
                bg-primary
                text-black
                hover:bg-[#00f08f]
                rounded-sm
                text-xs font-semibold
                cursor-pointer
                transition-all
                shadow-[0_0_10px_rgba(0,220,130,0.2)]
            `}
		>
			Allow once
		</button>
	)

	const cancelButton = (
		<button
			onClick={onReject}
			className={`
                px-3 py-1.5
                bg-surface-elevated
                text-text-secondary
                hover:text-text-primary
                hover:bg-surface-hover
                border border-border-hairline
                rounded-sm
                text-xs font-semibold
                cursor-pointer
                transition-colors
            `}
		>
			Deny
		</button>
	)

	const approvalType = isABuiltinToolName(toolName) ? approvalTypeOfBuiltinToolName[toolName] : 'MCP tools'
	const approvalToggle = approvalType ? <div key={approvalType} className="flex items-center ml-2 gap-x-1 text-[10px] text-void-fg-4">
		<ToolApprovalTypeSwitch size='xs' approvalType={approvalType} desc={`Auto-approve`} />
	</div> : null

	return <div className="flex gap-2 mx-0.5 mt-2.5 items-center justify-between w-full border-t border-white/5 pt-2.5">
		<div className="flex gap-1.5">
			{approveButton}
			{cancelButton}
		</div>
		{approvalToggle}
	</div>
}

export const ToolChildrenWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
	return <div className={`${className ? className : ''} cursor-default select-none mt-1 rounded-sm border border-void-border-3/50`}>
		<div className='px-2 py-0.5 min-w-full overflow-hidden'>
			{children}
		</div>
	</div>
}
export const CodeChildren = ({ children, className }: { children: React.ReactNode, className?: string }) => {
	return <div className={`${className ?? ''} p-1.5 rounded-sm overflow-auto text-sm bg-void-bg-1/30 font-mono`}>
		<div className='!select-text cursor-auto'>
			{children}
		</div>
	</div>
}

export const ListableToolItem = ({ name, onClick, isSmall, className, showDot }: { name: React.ReactNode, onClick?: () => void, isSmall?: boolean, className?: string, showDot?: boolean }) => {
	return <div
		className={`
			${onClick ? 'hover:brightness-125 hover:cursor-pointer transition-all duration-200 ' : ''}
			flex items-center flex-nowrap whitespace-nowrap
			${className ? className : ''}
			`}
		onClick={onClick}
	>
		{showDot === false ? null : <div className="flex-shrink-0"><svg className="w-1 h-1 opacity-60 mr-1.5 fill-current" viewBox="0 0 100 40"><rect x="0" y="15" width="100" height="10" /></svg></div>}
		<div className={`${isSmall ? 'italic text-void-fg-4 flex items-center' : ''}`}>{name}</div>
	</div>
}



const EditToolChildren = ({ uri, code, type }: { uri: URI | undefined, code: string, type: 'diff' | 'rewrite' }) => {

	const content = type === 'diff' ?
		<VoidDiffEditor uri={uri} searchReplaceBlocks={code} />
		: <ChatMarkdownRender string={`\`\`\`\n${code}\n\`\`\``} codeURI={uri} chatMessageLocation={undefined} />

	return <div className='!select-text cursor-auto'>
		<SmallProseWrapper>
			{content}
		</SmallProseWrapper>
	</div>

}


const LintErrorChildren = ({ lintErrors }: { lintErrors: LintErrorItem[] }) => {
	return <div className="text-xs text-void-fg-4 opacity-80 border-l-2 border-void-warning px-2 py-0.5 flex flex-col gap-0.5 overflow-x-auto whitespace-nowrap">
		{lintErrors.map((error, i) => (
			<div key={i}>Lines {error.startLineNumber}-{error.endLineNumber}: {error.message}</div>
		))}
	</div>
}

const BottomChildren = ({ children, title }: { children: React.ReactNode, title: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	if (!children) return null;
	return (
		<div className="w-full px-2 mt-0.5">
			<div
				className={`flex items-center cursor-pointer select-none transition-colors duration-150 pl-0 py-0.5 rounded group`}
				onClick={() => setIsOpen(o => !o)}
				style={{ background: 'none' }}
			>
				<ChevronRight
					className={`mr-1 h-3 w-3 flex-shrink-0 transition-transform duration-100 text-void-fg-4 group-hover:text-void-fg-3 ${isOpen ? 'rotate-90' : ''}`}
				/>
				<span className="font-medium text-void-fg-4 group-hover:text-void-fg-3 text-xs">{title}</span>
			</div>
			<div
				className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0'} text-xs pl-4`}
			>
				<div className="overflow-x-auto text-void-fg-4 opacity-90 border-l-2 border-void-warning px-2 py-0.5">
					{children}
				</div>
			</div>
		</div>
	);
}


const EditToolHeaderButtons = ({ applyBoxId, uri, codeStr, toolName, threadId }: { threadId: string, applyBoxId: string, uri: URI | undefined, codeStr: string, toolName: 'edit_file' | 'rewrite_file' }) => {
	const { streamState } = useEditToolStreamState({ applyBoxId, uri })
	if (!uri) return null
	return <div className='flex items-center gap-1'>
		{/* <StatusIndicatorForApplyButton applyBoxId={applyBoxId} uri={uri} /> */}
		{/* <JumpToFileButton uri={uri} /> */}
		{streamState === 'idle-no-changes' && <CopyButton codeStr={codeStr} toolTipName='Copy' />}
		<EditToolAcceptRejectButtonsHTML type={toolName} codeStr={codeStr} applyBoxId={applyBoxId} uri={uri} threadId={threadId} />
	</div>
}



const InvalidTool = ({ toolName, message, mcpServerName }: { toolName: ToolName, message: string, mcpServerName: string | undefined }) => {
	const accessor = useAccessor()
	const title = getTitle({ name: toolName, type: 'invalid_params', mcpServerName })
	const desc1 = 'Invalid parameters'
	const icon = null
	const isError = true
	const componentParams: ToolHeaderParams = { title, desc1, isError, icon }

	componentParams.children = <ToolChildrenWrapper>
		<CodeChildren className='bg-void-bg-3'>
			{message}
		</CodeChildren>
	</ToolChildrenWrapper>
	return <ToolHeaderWrapper {...componentParams} />
}

const CanceledTool = ({ toolName, mcpServerName }: { toolName: ToolName, mcpServerName: string | undefined }) => {
	const accessor = useAccessor()
	const title = getTitle({ name: toolName, type: 'rejected', mcpServerName })
	const desc1 = ''
	const icon = null
	const isRejected = true
	const componentParams: ToolHeaderParams = { title, desc1, icon, isRejected }
	return <ToolHeaderWrapper {...componentParams} />
}


const CommandTool = ({ toolMessage, type, threadId }: { threadId: string } & ({
	toolMessage: Exclude<ToolMessage<'run_command'>, { type: 'invalid_params' }>
	type: 'run_command'
} | {
	toolMessage: Exclude<ToolMessage<'run_persistent_command'>, { type: 'invalid_params' }>
	type: | 'run_persistent_command'
})) => {
	const accessor = useAccessor()

	const commandService = accessor.get('ICommandService')
	const terminalToolsService = accessor.get('ITerminalToolService')
	const toolsService = accessor.get('IToolsService')
	const isError = false
	const cmd = (toolMessage.params as any)?.command || ''
	const isRunningCmd = toolMessage.type === 'running_now'
	const title = (
		<span className="flex items-center gap-1.5 font-mono text-xs max-w-full truncate">
			<Terminal size={12} className="text-primary shrink-0" />
			<span className="text-text-muted shrink-0">{isRunningCmd ? 'Running' : 'Ran'}</span>
			<span className="text-on-surface truncate font-medium">{cmd}</span>
			{isRunningCmd && <IconLoading className="w-3 text-primary shrink-0 ml-1" />}
		</span>
	)
	const desc1 = ''
	const icon = null
	const streamState = useChatThreadsStreamState(threadId)

	const divRef = useRef<HTMLDivElement | null>(null)

	const isRejected = toolMessage.type === 'rejected'
	const { rawParams, params } = toolMessage
	const componentParams: ToolHeaderParams = { title, desc1, desc1Info: undefined, isError, icon, isRejected, }


	const effect = async () => {
		if (streamState?.isRunning !== 'tool') return
		if (type !== 'run_command' || toolMessage.type !== 'running_now') return;

		// wait for the interruptor so we know it's running

		await streamState?.interrupt
		const container = divRef.current;
		if (!container) return;

		const terminal = terminalToolsService.getTemporaryTerminal(toolMessage.params.terminalId);
		if (!terminal) return;

		try {
			terminal.attachToElement(container);
			terminal.setVisible(true)
		} catch {
		}

		// Listen for size changes of the container and keep the terminal layout in sync.
		const resizeObserver = new ResizeObserver((entries) => {
			const height = entries[0].borderBoxSize[0].blockSize;
			const width = entries[0].borderBoxSize[0].inlineSize;
			if (typeof terminal.layout === 'function') {
				terminal.layout({ width, height });
			}
		});

		resizeObserver.observe(container);
		return () => { terminal.detachFromElement(); resizeObserver?.disconnect(); }
	}

	useEffect(() => {
		effect()
	}, [terminalToolsService, toolMessage, toolMessage.type, type]);

	if (toolMessage.type === 'success') {
		const { result } = toolMessage

		// it's unclear that this is a button and not an icon.
		// componentParams.desc2 = <JumpToTerminalButton
		// 	onClick={() => { terminalToolsService.openTerminal(terminalId) }}
		// />

		let msg: string
		if (type === 'run_command') msg = toolsService.stringOfResult['run_command'](toolMessage.params, result)
		else msg = toolsService.stringOfResult['run_persistent_command'](toolMessage.params, result)

		if (type === 'run_persistent_command') {
			componentParams.info = persistentTerminalNameOfId(toolMessage.params.persistentTerminalId)
		}

		componentParams.children = <ToolChildrenWrapper className='whitespace-pre text-nowrap overflow-auto text-sm'>
			<div className='!select-text cursor-auto'>
				<BlockCode initValue={`${msg.trim()}`} language='shellscript' />
			</div>
		</ToolChildrenWrapper>
	}
	else if (toolMessage.type === 'tool_error') {
		const { result } = toolMessage
		componentParams.bottomChildren = <BottomChildren title='Error'>
			<CodeChildren>
				{result}
			</CodeChildren>
		</BottomChildren>
	}
	else if (toolMessage.type === 'running_now') {
		if (type === 'run_command')
			componentParams.children = <div ref={divRef} className='relative h-[300px] text-sm' />
	}
	else if (toolMessage.type === 'rejected' || toolMessage.type === 'tool_request') {
		if (toolMessage.type === 'tool_request') {
			const cmd = toolMessage.params.command;
			// Déduire le niveau de risque
			let riskLevel = 'Low';
			let riskColorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
			let riskExplanation = 'This command is safe to run and only reads or checks status.';

			const cmdLower = cmd.toLowerCase();
			if (cmdLower.includes('rm ') || cmdLower.includes('delete') || cmdLower.includes('drop') || cmdLower.includes('truncate') || cmdLower.includes('force') || cmdLower.includes('remove')) {
				riskLevel = 'High';
				riskColorClass = 'text-red-400 bg-red-500/10 border-red-500/20';
				riskExplanation = 'This command can delete files or modify your repository destructively.';
			} else if (cmdLower.includes('install') || cmdLower.includes('npm ') || cmdLower.includes('pip ') || cmdLower.includes('yarn') || cmdLower.includes('build') || cmdLower.includes('compile') || cmdLower.includes('run') || cmdLower.includes('setup')) {
				riskLevel = 'Medium';
				riskColorClass = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
				riskExplanation = 'This command compiles code or installs dependencies which can run external code.';
			}

			componentParams.children = (
				<div className="mt-2.5 p-3 rounded-sm bg-[#0B0F14] border border-white/5 flex flex-col gap-2.5">
					<div>
						<div className="text-[10px] text-void-fg-3 uppercase tracking-wider font-semibold">Command to Execute</div>
						<div className="mt-1 font-mono text-xs bg-void-bg-2 p-2 rounded text-[#F6F7F9] overflow-x-auto border border-white/5 select-all">
							{cmd}
						</div>
					</div>

					<div className="flex gap-4 text-[11px] py-1.5 border-y border-white/5">
						<div className="flex-1">
							<span className="text-void-fg-3 font-medium block">Risk Level:</span>
							<span className={`inline-flex px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-semibold border ${riskColorClass}`}>
								{riskLevel}
							</span>
						</div>
						<div className="flex-[2]">
							<span className="text-void-fg-3 font-medium block">Consequences:</span>
							<span className="text-void-fg-4 text-[10px]">{riskExplanation}</span>
						</div>
					</div>

					<div className="flex items-center justify-between mt-1">
						<div className="text-[10px] text-void-fg-4">
							Scope: <span className="font-semibold text-void-fg-3">Current workspace only</span>
						</div>
					</div>
				</div>
			);
		}
	}

	return <>
		<ToolHeaderWrapper {...componentParams} isOpen={(type === 'run_command' && toolMessage.type === 'running_now') || toolMessage.type === 'tool_request' ? true : undefined} />
	</>
}

type WrapperProps<T extends ToolName> = { toolMessage: Exclude<ToolMessage<T>, { type: 'invalid_params' }>, messageIdx: number, threadId: string }
const MCPToolWrapper = ({ toolMessage }: WrapperProps<string>) => {
	const accessor = useAccessor()
	const mcpService = accessor.get('IMCPService')

	const title = getTitle(toolMessage)
	const desc1 = removeMCPToolNamePrefix(toolMessage.name)
	const icon = null


	if (toolMessage.type === 'running_now') return null // do not show running

	const isError = false
	const isRejected = toolMessage.type === 'rejected'
	const { rawParams, params } = toolMessage
	const componentParams: ToolHeaderParams = { title, desc1, isError, icon, isRejected, }

	const paramsStr = JSON.stringify(params, null, 2)
	componentParams.desc2 = <CopyButton codeStr={paramsStr} toolTipName={`Copy inputs: ${paramsStr}`} />

	componentParams.info = !toolMessage.mcpServerName ? 'MCP tool not found' : undefined

	// Add copy inputs button in desc2


	if (toolMessage.type === 'success' || toolMessage.type === 'tool_request') {
		const { result } = toolMessage
		const resultStr = result ? mcpService.stringifyResult(result) : 'null'
		componentParams.children = <ToolChildrenWrapper>
			<SmallProseWrapper>
				<ChatMarkdownRender
					string={`\`\`\`json\n${resultStr}\n\`\`\``}
					chatMessageLocation={undefined}
					isApplyEnabled={false}
					isLinkDetectionEnabled={true}
				/>
			</SmallProseWrapper>
		</ToolChildrenWrapper>
	}
	else if (toolMessage.type === 'tool_error') {
		const { result } = toolMessage
		componentParams.bottomChildren = <BottomChildren title='Error'>
			<CodeChildren>
				{result}
			</CodeChildren>
		</BottomChildren>
	}

	return <ToolHeaderWrapper {...componentParams} />

}

type ResultWrapper<T extends ToolName> = (props: WrapperProps<T>) => React.ReactNodeconst builtinToolNameToComponent: { [T in BuiltinToolName]: { resultWrapper: ResultWrapper<T>, } } = {
	'read_file': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const uri = toolMessage.params?.uri
			const fileName = uri ? getBasename(uri.fsPath) : 'file'
			const start = toolMessage.params?.startLine ?? 1
			const end = toolMessage.params?.endLine ?? (start + 149)
			const lineBadge = (toolMessage.params?.startLine != null || toolMessage.params?.endLine != null)
				? `#L${start}-${end}`
				: '#L1-150'

			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null

			if (toolMessage.type === 'tool_error') {
				return (
					<div className="my-0.5 rounded-sm border border-red-500/30 bg-surface-elevated/40 px-2 py-1 text-xs text-red-400">
						Error reading {fileName}: {String(toolMessage.result)}
					</div>
				)
			}

			return (
				<div
					onClick={() => uri && voidOpenFileFn(uri, accessor, [start, end])}
					className="flex items-center justify-between py-0.5 px-1 rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer group select-none my-0.5"
				>
					<div className="flex items-center gap-1.5 min-w-0 truncate">
						<span className="text-text-muted text-xs font-sans shrink-0">Analyzed</span>
						<FileCode size={13} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
						<span className="font-mono text-xs text-text-primary group-hover:text-primary transition-colors truncate">
							{fileName}
						</span>
					</div>
					<span className="font-mono text-[10px] text-primary/80 shrink-0 ml-2">
						{lineBadge}
					</span>
				</div>
			)
		},
	},
	'get_dir_tree': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')

			const title = getTitle(toolMessage)
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			if (params?.uri) {
				const rel = getRelative(params.uri, accessor)
				if (rel) componentParams.info = `Only search in ${rel}`
			}

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.children = <ToolChildrenWrapper>
					<SmallProseWrapper>
						<ChatMarkdownRender
							string={`\`\`\`\n${result?.str ?? ''}\n\`\`\``}
							chatMessageLocation={undefined}
							isApplyEnabled={false}
							isLinkDetectionEnabled={true}
						/>
					</SmallProseWrapper>
				</ToolChildrenWrapper>
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />

		}
	},
	'ls_dir': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')
			const explorerService = accessor.get('IExplorerService')
			const title = getTitle(toolMessage)
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			if (params?.uri) {
				const rel = getRelative(params.uri, accessor)
				if (rel) componentParams.info = `Only search in ${rel}`
			}

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.numResults = result?.children?.length
				componentParams.hasNextPage = result?.hasNextPage
				componentParams.children = !result?.children || (result.children.length ?? 0) === 0 ? undefined
					: <ToolChildrenWrapper>
						{result.children.map((child, i) => (<ListableToolItem key={i}
							name={`${child.name}${child.isDirectory ? '/' : ''}`}
							className='w-full overflow-auto'
							onClick={() => {
								voidOpenFileFn(child.uri, accessor)
							}}
						/>))}
						{result.hasNextPage &&
							<ListableToolItem name={`Results truncated (${result.itemsRemaining} remaining).`} isSmall={true} className='w-full overflow-auto' />
						}
					</ToolChildrenWrapper>
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />
		}
	},
	'search_pathnames_only': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')
			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const title = getTitle(toolMessage)
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			if (params?.includePattern) {
				componentParams.info = `Only search in ${params.includePattern}`
			}

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.numResults = result?.uris?.length ?? 0
				componentParams.hasNextPage = result?.hasNextPage
				componentParams.children = (!result?.uris || result.uris.length === 0) ? undefined
					: <ToolChildrenWrapper>
						{result.uris.map((uri, i) => (<ListableToolItem key={i}
							name={getBasename(uri.fsPath)}
							className='w-full overflow-auto'
							onClick={() => { voidOpenFileFn(uri, accessor) }}
						/>))}
						{result.hasNextPage &&
							<ListableToolItem name={'Results truncated.'} isSmall={true} className='w-full overflow-auto' />
						}

					</ToolChildrenWrapper>
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />
		}
	},
	'search_for_files': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')
			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const title = getTitle(toolMessage)
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			if (params?.searchInFolder || params?.isRegex) {
				let info: string[] = []
				if (params.searchInFolder) {
					const rel = getRelative(params.searchInFolder, accessor)
					if (rel) info.push(`Only search in ${rel}`)
				}
				if (params.isRegex) { info.push(`Uses regex search`) }
				componentParams.info = info.join('; ')
			}

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.numResults = result?.uris?.length ?? 0
				componentParams.hasNextPage = result?.hasNextPage
				componentParams.children = (!result?.uris || result.uris.length === 0) ? undefined
					: <ToolChildrenWrapper>
						{result.uris.map((uri, i) => (<ListableToolItem key={i}
							name={getBasename(uri.fsPath)}
							className='w-full overflow-auto'
							onClick={() => { voidOpenFileFn(uri, accessor) }}
						/>))}
						{result.hasNextPage &&
							<ListableToolItem name={`Results truncated.`} isSmall={true} className='w-full overflow-auto' />
						}

					</ToolChildrenWrapper>
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}
			return <ToolHeaderWrapper {...componentParams} />
		}
	},

	'search_in_file': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor();
			const toolsService = accessor.get('IToolsService');
			const title = getTitle(toolMessage);
			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor);
			const icon = null;

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const { rawParams, params } = toolMessage;
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected };

			const infoarr: string[] = []
			const uriStr = params?.uri ? getRelative(params.uri, accessor) : ''
			if (uriStr) infoarr.push(uriStr)
			if (params?.isRegex) infoarr.push('Uses regex search')
			componentParams.info = infoarr.join('; ')

			if (toolMessage.type === 'success') {
				const { result } = toolMessage; // result is array of snippets
				componentParams.numResults = result?.lines?.length ?? 0;
				componentParams.children = (!result?.lines || result.lines.length === 0) ? undefined :
					<ToolChildrenWrapper>
						<CodeChildren className='bg-void-bg-3'>
							<pre className='font-mono whitespace-pre'>
								{params && result ? toolsService.stringOfResult['search_in_file'](params, result) : ''}
							</pre>
						</CodeChildren>
					</ToolChildrenWrapper>
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage;
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />;
		}
	},

	'read_lint_errors': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')

			const title = getTitle(toolMessage)

			const { uri } = toolMessage.params ?? {}
			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			componentParams.info = uri ? getRelative(uri, accessor) : undefined

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.onClick = () => { if (params?.uri) voidOpenFileFn(params.uri, accessor) }
				if (result?.lintErrors)
					componentParams.children = <LintErrorChildren lintErrors={result.lintErrors} />
				else
					componentParams.children = `No lint errors found.`

			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />
		},
	},

	// ---

	'create_file_or_folder': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const uri = toolMessage.params?.uri
			const fileName = uri ? getBasename(uri.fsPath) : 'file'

			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null

			return (
				<div
					onClick={() => uri && voidOpenFileFn(uri, accessor)}
					className="flex items-center gap-1.5 py-0.5 px-1 rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer select-none my-0.5"
				>
					<span className="text-text-muted text-xs font-sans shrink-0">Created</span>
					<FileCode size={13} className="text-primary shrink-0" />
					<span className="font-mono text-xs text-text-primary truncate">
						{fileName}
					</span>
				</div>
			)
		}
	},
	'delete_file_or_folder': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const uri = toolMessage.params?.uri
			const fileName = uri ? getBasename(uri.fsPath) : 'file'

			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null

			return (
				<div className="flex items-center gap-1.5 py-0.5 px-1 rounded-sm hover:bg-white/[0.04] transition-colors select-none my-0.5">
					<span className="text-text-muted text-xs font-sans shrink-0">Deleted</span>
					<Trash2 size={13} className="text-red-400/90 shrink-0" />
					<span className="font-mono text-xs text-text-primary truncate">
						{fileName}
					</span>
				</div>
			)
		}
	},
	'rewrite_file': {
		resultWrapper: (params) => {
			return <EditTool {...params} content={params.toolMessage.params?.newContent ?? ''} />
		}
	},
	'edit_file': {
		resultWrapper: (params) => {
			return <EditTool {...params} content={params.toolMessage.params?.searchReplaceBlocks ?? ''} />
		}
	},

	// ---

	'run_command': {
		resultWrapper: (params) => {
			return <CommandTool {...params} type='run_command' />
		}
	},

	'run_persistent_command': {
		resultWrapper: (params) => {
			return <CommandTool {...params} type='run_persistent_command' />
		}
	},
	'open_persistent_terminal': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const terminalToolsService = accessor.get('ITerminalToolService')

			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			const relativePath = params.cwd ? getRelative(URI.file(params.cwd), accessor) : ''
			componentParams.info = relativePath ? `Running in ${relativePath}` : undefined

			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				const { persistentTerminalId } = result
				componentParams.desc1 = persistentTerminalNameOfId(persistentTerminalId)
				componentParams.onClick = () => terminalToolsService.focusPersistentTerminal(persistentTerminalId)
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'kill_persistent_terminal': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const commandService = accessor.get('ICommandService')
			const terminalToolsService = accessor.get('ITerminalToolService')

			const { desc1, desc1Info } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const icon = null

			if (toolMessage.type === 'tool_request') return null // do not show past requests
			if (toolMessage.type === 'running_now') return null // do not show running

			const isError = false
			const isRejected = toolMessage.type === 'rejected'
			const { rawParams, params } = toolMessage
			const componentParams: ToolHeaderParams = { title, desc1, desc1Info, isError, icon, isRejected, }

			if (toolMessage.type === 'success') {
				const { persistentTerminalId } = params
				componentParams.desc1 = persistentTerminalNameOfId(persistentTerminalId)
				componentParams.onClick = () => terminalToolsService.focusPersistentTerminal(persistentTerminalId)
			}
			else if (toolMessage.type === 'tool_error') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Error'>
					<CodeChildren>
						{result}
					</CodeChildren>
				</BottomChildren>
			}

			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	// --- new tools ---
	'send_command_input': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1, isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'todo_list': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1: 'Task list updated', isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'ask_user_question': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1, isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'invoke_skill': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1: desc1 || 'Loading skill...', isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'search_web': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1, isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			if (toolMessage.type === 'success') {
				const { result } = toolMessage
				componentParams.bottomChildren = <BottomChildren title='Results'><CodeChildren>{result.results}</CodeChildren></BottomChildren>
			}
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'read_url_content': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1, isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'create_system_doc': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const { desc1 } = toolNameToDesc(toolMessage.name, toolMessage.params, accessor)
			const title = getTitle(toolMessage)
			const isRejected = toolMessage.type === 'rejected'
			const componentParams: ToolHeaderParams = { title, desc1, isError: false, icon: null, isRejected }
			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null
			return <ToolHeaderWrapper {...componentParams} />
		},
	},
	'write_to_file': {
		resultWrapper: ({ toolMessage }) => {
			const accessor = useAccessor()
			const uri = toolMessage.params?.uri
			const fileName = uri ? getBasename(uri.fsPath) : 'file'

			if (toolMessage.type === 'tool_request' || toolMessage.type === 'running_now') return null

			return (
				<div
					onClick={() => uri && voidOpenFileFn(uri, accessor)}
					className="flex items-center gap-1.5 py-0.5 px-1 rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer select-none my-0.5"
				>
					<span className="text-text-muted text-xs font-sans shrink-0">Created</span>
					<FileCode size={13} className="text-primary shrink-0" />
					<span className="font-mono text-xs text-text-primary truncate">
						{fileName}
					</span>
				</div>
			)
		},
	},
};


const Checkpoint = ({ message, threadId, messageIdx, isCheckpointGhost, threadIsRunning }: { message: CheckpointEntry, threadId: string; messageIdx: number, isCheckpointGhost: boolean, threadIsRunning: boolean }) => {
	const accessor = useAccessor()
	const chatThreadService = accessor.get('IChatThreadService')
	const streamState = useFullChatThreadsStreamState()

	const isRunning = useChatThreadsStreamState(threadId)?.isRunning
	const isDisabled = useMemo(() => {
		if (isRunning) return true
		return !!Object.keys(streamState).find((threadId2) => streamState[threadId2]?.isRunning)
	}, [isRunning, streamState])

	return <div
		className={`flex items-center justify-center px-2 py-1`}
	>
		<div
			className={`
                    text-[10px]
                    text-void-fg-4
                    select-none
                    flex items-center gap-1.5 py-0.5 px-2.5
                    rounded-full border border-white/5
                    bg-white/[0.03]
                    hover:bg-white/5
                    transition-colors duration-150
                    ${isCheckpointGhost ? 'opacity-50' : 'opacity-100'}
					${isDisabled ? 'cursor-default' : 'cursor-pointer'}
                `}
			style={{ position: 'relative', display: 'inline-flex' }} // allow absolute icon
			onClick={() => {
				if (threadIsRunning) return
				if (isDisabled) return
				chatThreadService.jumpToCheckpointBeforeMessageIdx({
					threadId,
					messageIdx,
					jumpToUserModified: messageIdx === (chatThreadService.state.allThreads[threadId]?.messages.length ?? 0) - 1
				})
			}}
			{...isDisabled ? {
				'data-tooltip-id': 'void-tooltip',
				'data-tooltip-content': `Disabled ${isRunning ? 'when running' : 'because another thread is running'}`,
				'data-tooltip-place': 'top',
			} : {}}
		>
			<span className="text-[6px] text-[#00D1FF] animate-pulse">●</span>
			<span>Checkpoint saved</span>
		</div>
	</div>
}


type ChatBubbleMode = 'display' | 'edit'
type ChatBubbleProps = {
	chatMessage: ChatMessage,
	messageIdx: number,
	isCommitted: boolean,
	chatIsRunning: IsRunningType,
	threadId: string,
	currCheckpointIdx: number | undefined,
	_scrollToBottom: (() => void) | null,
}

const ChatBubble = (props: ChatBubbleProps) => {
	return <ErrorBoundary>
		<_ChatBubble {...props} />
	</ErrorBoundary>
}

const _ChatBubble = ({ threadId, chatMessage, currCheckpointIdx, isCommitted, messageIdx, chatIsRunning, _scrollToBottom }: ChatBubbleProps) => {
	const role = chatMessage.role

	const isCheckpointGhost = messageIdx > (currCheckpointIdx ?? Infinity) && !chatIsRunning // whether to show as gray (if chat is running, for good measure just dont show any ghosts)

	if (role === 'user') {
		return <UserMessageComponent
			chatMessage={chatMessage}
			isCheckpointGhost={isCheckpointGhost}
			currCheckpointIdx={currCheckpointIdx}
			messageIdx={messageIdx}
			_scrollToBottom={_scrollToBottom}
		/>
	}
	else if (role === 'assistant') {
		return <AssistantMessageComponent
			chatMessage={chatMessage}
			isCheckpointGhost={isCheckpointGhost}
			messageIdx={messageIdx}
			isCommitted={isCommitted}
		/>
	}
	else if (role === 'tool') {

		if (chatMessage.type === 'invalid_params') {
			return <div className={`${isCheckpointGhost ? 'opacity-50' : ''}`}>
				<InvalidTool toolName={chatMessage.name} message={chatMessage.content} mcpServerName={chatMessage.mcpServerName} />
			</div>
		}

		const toolName = chatMessage.name
		const isBuiltInTool = isABuiltinToolName(toolName)
		const ToolResultWrapper = isBuiltInTool ? builtinToolNameToComponent[toolName]?.resultWrapper as ResultWrapper<ToolName>
			: MCPToolWrapper as ResultWrapper<ToolName>

		if (ToolResultWrapper)
			return <>
				<div className={`${isCheckpointGhost ? 'opacity-50' : ''}`}>
					<ToolResultWrapper
						toolMessage={chatMessage}
						messageIdx={messageIdx}
						threadId={threadId}
					/>
				</div>
				{chatMessage.type === 'tool_request' ?
					<div className={`${isCheckpointGhost ? 'opacity-50 pointer-events-none' : ''}`}>
						<ToolRequestAcceptRejectButtons toolName={chatMessage.name} />
					</div> : null}
			</>
		return null
	}

	else if (role === 'interrupted_streaming_tool') {
		return <div className={`${isCheckpointGhost ? 'opacity-50' : ''}`}>
			<CanceledTool toolName={chatMessage.name} mcpServerName={chatMessage.mcpServerName} />
		</div>
	}

	else if (role === 'checkpoint') {
		return <Checkpoint
			threadId={threadId}
			message={chatMessage}
			messageIdx={messageIdx}
			isCheckpointGhost={isCheckpointGhost}
			threadIsRunning={!!chatIsRunning}
		/>
	}

}

// --- Timeline Grouping Components ---

const TimelineShellGroup = ({
	messages,
	indices,
	currCheckpointIdx,
	chatIsRunning,
	threadId,
	_scrollToBottom
}: {
	messages: ToolMessage<any>[],
	indices: number[],
	currCheckpointIdx: number | undefined,
	chatIsRunning: IsRunningType,
	threadId: string,
	_scrollToBottom: (() => void) | null
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const count = messages.length

	return (
		<div className="my-0.5 select-none transition-all duration-200">
			<div
				onClick={() => setIsOpen(v => !v)}
				className="flex items-center justify-between py-0.5 px-1 cursor-pointer hover:bg-white/[0.04] rounded-sm transition-colors"
			>
				<div className="flex items-center gap-1.5 font-sans text-xs text-text-primary">
					<ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
					<Terminal size={12} className="text-primary shrink-0" />
					<span className="font-medium">Ran {count} commands</span>
				</div>
				<span className="text-[10px] font-mono text-text-muted">{isOpen ? 'Collapse' : `${count} commands`}</span>
			</div>
			{isOpen && (
				<div className="pl-4 pr-1 pb-1 pt-0.5 space-y-0.5">
					{messages.map((msg, i) => (
						<ChatBubble
							key={indices[i]}
							currCheckpointIdx={currCheckpointIdx}
							chatMessage={msg}
							messageIdx={indices[i]}
							isCommitted={true}
							chatIsRunning={chatIsRunning}
							threadId={threadId}
							_scrollToBottom={_scrollToBottom}
						/>
					))}
				</div>
			)}
		</div>
	)
}

const TimelineExplorationGroup = ({
	messages,
	indices,
	currCheckpointIdx,
	chatIsRunning,
	threadId,
	_scrollToBottom
}: {
	messages: ToolMessage<any>[],
	indices: number[],
	currCheckpointIdx: number | undefined,
	chatIsRunning: IsRunningType,
	threadId: string,
	_scrollToBottom: (() => void) | null
}) => {
	const accessor = useAccessor()
	const [isOpen, setIsOpen] = useState(false)

	let numFiles = 0
	let numFolders = 0
	for (const msg of messages) {
		if (msg.name === 'ls_dir' || msg.name === 'get_dir_tree' || (msg.params as any)?.isFolder) {
			numFolders++
		} else {
			numFiles++
		}
	}
	const parts: string[] = []
	if (numFiles > 0) parts.push(`${numFiles} file${numFiles > 1 ? 's' : ''}`)
	if (numFolders > 0) parts.push(`${numFolders} folder${numFolders > 1 ? 's' : ''}`)
	const summaryText = parts.length > 0 ? parts.join(', ') : `${messages.length} files`

	return (
		<div className="my-0.5 select-none transition-all duration-200">
			<div
				onClick={() => setIsOpen(v => !v)}
				className="flex items-center justify-between py-0.5 px-1 cursor-pointer hover:bg-white/[0.04] rounded-sm transition-colors"
			>
				<div className="flex items-center gap-1.5 font-sans text-xs text-text-primary">
					<ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
					<FileText size={12} className="text-agent-cyan shrink-0" />
					<span className="font-medium">Explored {summaryText}</span>
				</div>
				<span className="text-[10px] font-mono text-text-muted">{isOpen ? 'Collapse' : summaryText}</span>
			</div>
			{isOpen && (
				<div className="pl-4 pr-1 pb-1 pt-0.5 space-y-0.5">
					{messages.map((msg, i) => {
						const uri = (msg.params as any)?.uri as URI | undefined
						const fileName = uri ? getBasename(uri.fsPath) : ((msg.params as any)?.query ? `"${(msg.params as any).query}"` : 'workspace')
						let lineBadge = '#All'
						let isFolder = false
						if (msg.name === 'read_file') {
							const start = (msg.params as any)?.startLine
							const end = (msg.params as any)?.endLine
							if (start && end) lineBadge = `#L${start}-${end}`
							else if (start) lineBadge = `#L${start}+`
							else lineBadge = '#L1-150'
						} else if (msg.name === 'search_in_file') {
							lineBadge = '#Search'
						} else if (msg.name === 'ls_dir' || msg.name === 'get_dir_tree' || (msg.params as any)?.isFolder) {
							lineBadge = '#Folder'
							isFolder = true
						}

						return (
							<div
								key={indices[i]}
								onClick={() => uri && voidOpenFileFn(uri, accessor)}
								className="flex items-center justify-between py-0.5 px-1 rounded-sm hover:bg-white/[0.04] transition-colors cursor-pointer group"
							>
								<div className="flex items-center gap-1.5 min-w-0 truncate">
									<span className="text-text-muted text-xs font-sans shrink-0">Analyzed</span>
									{isFolder ? (
										<Folder size={12} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
									) : (
										<FileCode size={12} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
									)}
									<span className="font-mono text-xs text-text-primary group-hover:text-primary transition-colors truncate">
										{fileName}
									</span>
								</div>
								<span className="font-mono text-[10px] text-primary/80 shrink-0 ml-2">
									{lineBadge}
								</span>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

type TimelineGroup =
	| { type: 'single'; message: ChatMessage; messageIdx: number }
	| { type: 'shell_group'; messages: ToolMessage<any>[]; indices: number[] }
	| { type: 'exploration_group'; messages: ToolMessage<any>[]; indices: number[] };

function isIntentMessage(msg: ChatMessage, nextMsg?: ChatMessage): boolean {
	if (msg.role !== 'assistant') return false
	const content = msg.displayContent?.trim() || ''
	if (!content) return false

	// Patterns d'intentions courantes de l'agent ("I am going to...", "I'll...", "Let me...", "Je vais...")
	const intentPattern = /^\s*(I('m| am| will)?\s*(going to|will|want to|shall|need to|must|now|would like to)?|Let me|Allow me|I'll|Now I will|I should|Je vais|Voyons|Analysons|Je procède|Exécutons|Commençons)\b/i
	if (intentPattern.test(content)) {
		return true
	}

	// Phrase courte précédant immédiatement un outil
	if (nextMsg && (nextMsg.role === 'tool' || (nextMsg as any).role === 'interrupted_streaming_tool')) {
		if (content.length < 250) {
			return true
		}
	}

	return false
}

function groupMessagesForTimeline(messages: ChatMessage[]): TimelineGroup[] {
	const timelineGroups: TimelineGroup[] = []
	let currentShellGroup: { messages: ToolMessage<any>[]; indices: number[] } | null = null
	let currentExplorationGroup: { messages: ToolMessage<any>[]; indices: number[] } | null = null

	const flushGroups = () => {
		if (currentShellGroup) {
			if (currentShellGroup.messages.length > 1) {
				timelineGroups.push({ type: 'shell_group', ...currentShellGroup })
			} else {
				timelineGroups.push({ type: 'single', message: currentShellGroup.messages[0], messageIdx: currentShellGroup.indices[0] })
			}
			currentShellGroup = null
		}
		if (currentExplorationGroup) {
			if (currentExplorationGroup.messages.length > 1) {
				timelineGroups.push({ type: 'exploration_group', ...currentExplorationGroup })
			} else {
				timelineGroups.push({ type: 'single', message: currentExplorationGroup.messages[0], messageIdx: currentExplorationGroup.indices[0] })
			}
			currentExplorationGroup = null
		}
	}

	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i]
		const nextMsg = messages[i + 1]

		// Tout message assistant précédant un outil ou contenant des intentions est la réflexion de l'agent
		if (msg.role === 'assistant') {
			const isFollowedByTool = nextMsg && (nextMsg.role === 'tool' || (nextMsg as any).role === 'interrupted_streaming_tool')
			const content = msg.displayContent?.trim() || ''

			if (isFollowedByTool || isIntentMessage(msg, nextMsg)) {
				// Encapsuler dans un bloc de réflexion (Thought for Xs >)
				const thoughtText = (msg.reasoning ? msg.reasoning + '\n\n' : '') + content
				if (thoughtText.trim()) {
					flushGroups()
					timelineGroups.push({
						type: 'single',
						message: {
							...msg,
							reasoning: thoughtText.trim(),
							displayContent: '', // Se replie proprement dans "Thought for Xs >" sans saturer la réponse
						},
						messageIdx: i,
					})
				}
				continue
			}
		}

		if (msg.role === 'tool') {
			const isShell = msg.name === 'run_command' || msg.name === 'run_persistent_command'
			const isExploration = ['read_file', 'ls_dir', 'get_dir_tree', 'search_pathnames_only', 'search_for_files', 'search_in_file', 'read_lint_errors'].includes(msg.name)

			if (isShell) {
				if (currentExplorationGroup) flushGroups()
				if (!currentShellGroup) currentShellGroup = { messages: [], indices: [] }
				currentShellGroup.messages.push(msg)
				currentShellGroup.indices.push(i)
				continue
			} else if (isExploration) {
				if (currentShellGroup) flushGroups()
				if (!currentExplorationGroup) currentExplorationGroup = { messages: [], indices: [] }
				currentExplorationGroup.messages.push(msg)
				currentExplorationGroup.indices.push(i)
				continue
			}
		}
		flushGroups()
		timelineGroups.push({ type: 'single', message: msg, messageIdx: i })
	}
	flushGroups()
	return timelineGroups
}

// --- Staging Bar (Revue des Changements) ---

const CommandBarInChat = () => {
	const accessor = useAccessor()
	const editCodeService = accessor.get('IEditCodeService')
	const commandBarState = useCommandBarState()
	const { stateOfURI: commandBarStateOfURI, sortedURIs: sortedCommandBarURIs } = commandBarState
	const numFilesChanged = sortedCommandBarURIs.length

	const [activeFileIdx, setActiveFileIdx] = useState(0)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	useEffect(() => {
		if (activeFileIdx >= numFilesChanged && numFilesChanged > 0) {
			setActiveFileIdx(numFilesChanged - 1)
		}
	}, [numFilesChanged, activeFileIdx])

	if (numFilesChanged === 0) return null

	const currentUri = sortedCommandBarURIs[activeFileIdx] || sortedCommandBarURIs[0]

	const getDiffStats = (uri: URI) => {
		const diffIds = commandBarStateOfURI[uri.fsPath]?.sortedDiffIds || []
		let added = 0
		let removed = 0
		for (const id of diffIds) {
			const diff = editCodeService.diffOfId[id]
			if (!diff) continue
			if (diff.type === 'edit') {
				added += (diff.endLine - diff.startLine + 1)
				removed += (diff.originalEndLine - diff.originalStartLine + 1)
			} else if (diff.type === 'insertion') {
				added += (diff.endLine - diff.startLine + 1)
			} else if (diff.type === 'deletion') {
				removed += (diff.originalEndLine - diff.originalStartLine + 1)
			}
		}
		return { added, removed, count: diffIds.length }
	}

	const currentStats = getDiffStats(currentUri)

	return (
		<div className="mx-2 mb-2 bg-surface-panel/95 backdrop-blur-md border border-border-hairline rounded-sm shadow-xl p-2 flex flex-col gap-1.5 transition-all duration-200">
			{/* Main Staging Bar Row */}
			<div className="flex items-center justify-between gap-2 select-none">
				{/* Left: Counter with Prev/Next and active file */}
				<div className="flex items-center gap-2 min-w-0">
					{/* Navigation counter */}
					<div className="flex items-center gap-1 bg-surface-elevated/70 border border-border-hairline rounded-sm px-1.5 py-0.5">
						<button
							type="button"
							disabled={activeFileIdx <= 0}
							onClick={() => setActiveFileIdx(i => Math.max(0, i - 1))}
							className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
							title="Previous changed file"
						>
							<ChevronLeft size={13} />
						</button>
						<span className="font-sans text-xs font-semibold text-text-primary whitespace-nowrap px-1">
							{numFilesChanged} File{numFilesChanged > 1 ? 's' : ''} With Changes
							<span className="ml-1 text-[10px] font-mono text-text-muted">({activeFileIdx + 1}/{numFilesChanged})</span>
						</span>
						<button
							type="button"
							disabled={activeFileIdx >= numFilesChanged - 1}
							onClick={() => setActiveFileIdx(i => Math.min(numFilesChanged - 1, i + 1))}
							className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
							title="Next changed file"
						>
							<ChevronRight size={13} />
						</button>
					</div>

					{/* Active File Name & Diff Badge */}
					<div
						onClick={() => voidOpenFileFn(currentUri, accessor)}
						className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors truncate max-w-[150px] group"
						title={`Open ${currentUri.fsPath}`}
					>
						<span className="font-mono text-xs text-text-primary group-hover:text-primary truncate">
							{getBasename(currentUri.fsPath)}
						</span>
						{/* Diff pills */}
						<div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
							{currentStats.added > 0 && (
								<span className="px-1 py-0.2 rounded-sm bg-diff-addition-surface text-diff-addition border border-diff-addition/20 font-semibold">
									+{currentStats.added}
								</span>
							)}
							{currentStats.removed > 0 && (
								<span className="px-1 py-0.2 rounded-sm bg-diff-deletion-surface text-diff-deletion border border-diff-deletion/20 font-semibold">
									-{currentStats.removed}
								</span>
							)}
							{currentStats.added === 0 && currentStats.removed === 0 && currentStats.count > 0 && (
								<span className="px-1 py-0.2 rounded-sm bg-agent-cyan/10 text-agent-cyan border border-agent-cyan/20">
									{currentStats.count} diffs
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Right: Actions */}
				<div className="flex items-center gap-1.5 shrink-0">
					{/* Toggle drawer button if multiple files */}
					{numFilesChanged > 1 && (
						<button
							type="button"
							onClick={() => setIsDrawerOpen(o => !o)}
							className="p-1 text-text-muted hover:text-text-primary rounded-sm hover:bg-surface-hover transition-colors cursor-pointer"
							title={isDrawerOpen ? "Collapse list" : "Expand all changed files"}
						>
							<ChevronRight size={13} className={`transition-transform duration-150 ${isDrawerOpen ? 'rotate-90' : ''}`} />
						</button>
					)}

					{/* Reject all (secondary) */}
					<button
						type="button"
						onClick={() => {
							sortedCommandBarURIs.forEach(uri => {
								editCodeService.acceptOrRejectAllDiffAreas({
									uri,
									removeCtrlKs: true,
									behavior: "reject",
									_addToHistory: true,
								})
							})
						}}
						className="px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border-hairline rounded-sm transition-colors cursor-pointer"
					>
						Reject all
					</button>

					{/* Accept all (primary) */}
					<button
						type="button"
						onClick={() => {
							sortedCommandBarURIs.forEach(uri => {
								editCodeService.acceptOrRejectAllDiffAreas({
									uri,
									removeCtrlKs: true,
									behavior: "accept",
									_addToHistory: true,
								})
							})
						}}
						className="px-3 py-1 text-xs font-semibold text-black bg-primary hover:bg-[#00f08f] rounded-sm transition-all shadow-[0_0_10px_rgba(0,220,130,0.25)] cursor-pointer"
					>
						Accept all
					</button>
				</div>
			</div>

			{/* Expandable drawer for all files */}
			{isDrawerOpen && (
				<div className="pt-2 border-t border-border-hairline/60 flex flex-col gap-1 max-h-[140px] overflow-y-auto">
					{sortedCommandBarURIs.map((uri, idx) => {
						const stats = getDiffStats(uri)
						const isSelected = idx === activeFileIdx
						return (
							<div
								key={uri.fsPath}
								onClick={() => {
									setActiveFileIdx(idx)
									voidOpenFileFn(uri, accessor)
								}}
								className={`flex items-center justify-between px-2 py-1 rounded-sm text-xs cursor-pointer transition-colors ${
									isSelected ? 'bg-surface-hover text-text-primary' : 'hover:bg-surface-hover/60 text-text-secondary'
								}`}
							>
								<div className="flex items-center gap-1.5 truncate">
									<FileCode size={12} className={isSelected ? 'text-primary' : 'text-text-muted'} />
									<span className="font-mono text-xs truncate">{getBasename(uri.fsPath)}</span>
								</div>
								<div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
									{stats.added > 0 && <span className="text-diff-addition">+{stats.added}</span>}
									{stats.removed > 0 && <span className="text-diff-deletion">-{stats.removed}</span>}
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}



// F1: DiffStatsIndicator — shows +N/-M lines during edit
const DiffStatsIndicator = ({ code, type }: { code: string, type: 'diff' | 'rewrite' }) => {
	const stats = useMemo(() => {
		if (!code || typeof code !== 'string') return null
		if (type === 'rewrite') {
			const lines = code.split('\n').length
			return { added: lines, removed: 0 }
		}
		// For diff (search/replace blocks), count added/removed
		let added = 0, removed = 0
		const blocks = code.split(/<<<<<<< SEARCH/g)
		for (const block of blocks) {
			const parts = block.split(/=======/)
			if (parts.length >= 2) {
				const replaceSection = parts[1]?.split(/>>>>>>> REPLACE/)?.[0] || ''
				const searchLines = (parts[0]?.trim().split('\n') || []).filter(l => l.length > 0).length
				const replaceLines = (replaceSection.trim().split('\n') || []).filter(l => l.length > 0).length
				added += replaceLines
				removed += searchLines
			}
		}
		return added > 0 || removed > 0 ? { added, removed } : null
	}, [code, type])

	if (!stats) return null
	return (
		<span className='inline-flex items-center gap-1 text-[10px] font-mono ml-1.5 opacity-80'>
			{stats.added > 0 && <span className='text-green-400'>+{stats.added}</span>}
			{stats.removed > 0 && <span className='text-red-400'>-{stats.removed}</span>}
		</span>
	)
}

const EditToolSoFar = ({ toolCallSoFar, }: { toolCallSoFar: RawToolCallObj }) => {
	const accessor = useAccessor()

	if (!isABuiltinToolName(toolCallSoFar.name)) return null

	const uri = toolCallSoFar.rawParams.uri ? URI.file(toolCallSoFar.rawParams.uri) : undefined

	const title = titleOfBuiltinToolName[toolCallSoFar.name].proposed

	const uriDone = toolCallSoFar.doneParams.includes('uri')
	const editCode = toolCallSoFar.rawParams.search_replace_blocks ?? toolCallSoFar.rawParams.new_content ?? ''
	const editType = toolCallSoFar.name === 'edit_file' ? 'diff' : 'rewrite'
	const fileName = uriDone ? getBasename(toolCallSoFar.rawParams['uri'] ?? 'unknown') : 'file'
	const desc1 = <span className='flex items-center gap-1.5'>
		<span className="font-sans font-medium text-xs text-agent-cyan">Editing {fileName}</span>
		<DiffStatsIndicator code={editCode} type={editType as 'diff' | 'rewrite'} />
		<IconLoading className="w-3 text-agent-cyan" />
	</span>

	const desc1OnClick = () => { uri && voidOpenFileFn(uri, accessor) }

	// If URI has not been specified
	return <ToolHeaderWrapper
		title={title}
		desc1={desc1}
		desc1OnClick={desc1OnClick}
	>
		<EditToolChildren
			uri={uri}
			code={toolCallSoFar.rawParams.search_replace_blocks ?? toolCallSoFar.rawParams.new_content ?? ''}
			type={'rewrite'} // as it streams, show in rewrite format, don't make a diff editor
		/>
		<IconLoading />
	</ToolHeaderWrapper>

}


export const SidebarChat = () => {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const textAreaFnsRef = useRef<TextAreaFns | null>(null)

	const accessor = useAccessor()
	const commandService = accessor.get('ICommandService')
	const chatThreadsService = accessor.get('IChatThreadService')
	const workspaceContextService = accessor.get('IWorkspaceContextService')

	const settingsState = useSettingsState()
	const voiceState = useLocalVoiceModel()
	const selectedVoiceModelId = settingsState.globalSettings.localVoiceModelId
	const selectedVoiceModelStatus = selectedVoiceModelId === null
		? undefined
		: voiceState.statusByModel[selectedVoiceModelId]
	const isVoiceModelReady = selectedVoiceModelStatus === 'ready'
	useEffect(() => {
		if (!selectedVoiceModelId || selectedVoiceModelStatus !== 'installed') return;
		void localVoiceModelService.ensureModel(selectedVoiceModelId).catch(() => undefined);
	}, [selectedVoiceModelId, selectedVoiceModelStatus])
	const onVoiceTranscript = useCallback((text: string) => {
		textAreaFnsRef.current?.insertTextAtCursor(text)
	}, [])
	const voiceRecorder = useLocalVoiceRecorder(isVoiceModelReady ? selectedVoiceModelId : null, onVoiceTranscript)
	// ----- HIGHER STATE -----

	// threads state
	const chatThreadsState = useChatThreadsState()

	const currentThread = chatThreadsService.getCurrentThread()
	const previousMessages = currentThread?.messages ?? []

	const selections = currentThread.state.stagingSelections
	const setSelections = (s: StagingSelectionItem[]) => { chatThreadsService.setCurrentThreadState({ stagingSelections: s }) }

	// stream state
	const currThreadStreamState = useChatThreadsStreamState(chatThreadsState.currentThreadId)
	const isRunning = currThreadStreamState?.isRunning
	const latestError = currThreadStreamState?.error
	const { displayContentSoFar, toolCallSoFar, reasoningSoFar } = currThreadStreamState?.llmInfo ?? {}

	// this is just if it's currently being generated, NOT if it's currently running
	const toolIsGenerating = toolCallSoFar && !toolCallSoFar.isDone // show loading for slow tools (right now just edit)

	// ----- SIDEBAR CHAT state (local) -----

	// state of current message
	const initVal = ''
	const [instructionsAreEmpty, setInstructionsAreEmpty] = useState(!initVal)
	const [tokenEstimate, setTokenEstimate] = useState(0)

	const isDisabled = instructionsAreEmpty || !!isFeatureNameDisabled('Chat', settingsState)

	const chatModelSelection = settingsState.modelSelectionOfFeature['Chat']
	const chatContextWindow = chatModelSelection
		? getModelCapabilities(chatModelSelection.providerName, chatModelSelection.modelName, settingsState.overridesOfModel).contextWindow
		: undefined

	const sidebarRef = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement | null>(null)
	const onSubmit = useCallback(async (_forceSubmit?: string) => {

		if (isDisabled && !_forceSubmit) return
		if (voiceRecorder.isRecording || voiceRecorder.isTranscribing) return
		if (isRunning) return

		const threadId = chatThreadsService.state.currentThreadId

		// send message to LLM
		const userMessage = _forceSubmit || textAreaRef.current?.value || ''
		if (!userMessage.trim()) return

		// Si aucun dossier ou espace de travail n'est ouvert : ouvrir la boîte de dialogue native pour choisir/créer un dossier
		const workspaceFolders = workspaceContextService.getWorkspace().folders
		const workbenchState = workspaceContextService.getWorkbenchState()
		const hasWorkspace = workbenchState !== 1 && workspaceFolders && workspaceFolders.length > 0

		if (!hasWorkspace) {
			await commandService.executeCommand('workbench.action.files.openFolder')
			return
		}

		try {
			await chatThreadsService.addUserMessageAndStreamResponse({ userMessage, threadId })
		} catch (e) {
			console.error('Error while sending message in chat:', e)
		}

		setSelections([]) // clear staging
		textAreaFnsRef.current?.setValue('')
		textAreaRef.current?.focus() // focus input after submit

	}, [chatThreadsService, isDisabled, isRunning, textAreaRef, textAreaFnsRef, setSelections, settingsState, voiceRecorder.isRecording, voiceRecorder.isTranscribing, workspaceContextService, commandService])

	const onAbort = async () => {
		const threadId = currentThread.id
		await chatThreadsService.abortRunning(threadId)
	}

	const keybindingString = accessor.get('IKeybindingService').lookupKeybinding(VOID_CTRL_L_ACTION_ID)?.getLabel()

	const threadId = currentThread.id
	const currCheckpointIdx = chatThreadsState.allThreads[threadId]?.state?.currCheckpointIdx ?? undefined  // if not exist, treat like checkpoint is last message (infinity)



	// resolve mount info
	const isResolved = chatThreadsState.allThreads[threadId]?.state.mountedInfo?.mountedIsResolvedRef.current
	useEffect(() => {
		if (isResolved) return
		chatThreadsState.allThreads[threadId]?.state.mountedInfo?._whenMountedResolver?.({
			textAreaRef: textAreaRef,
			scrollToBottom: () => scrollToBottom(scrollContainerRef),
		})

	}, [chatThreadsState, threadId, textAreaRef, scrollContainerRef, isResolved])




	const previousMessagesHTML = useMemo(() => {
		const groups = groupMessagesForTimeline(previousMessages)
		return groups.map((group, groupIdx) => {
			if (group.type === 'shell_group') {
				return <TimelineShellGroup
					key={`shell-${group.indices[0]}`}
					messages={group.messages}
					indices={group.indices}
					currCheckpointIdx={currCheckpointIdx}
					chatIsRunning={isRunning}
					threadId={threadId}
					_scrollToBottom={() => scrollToBottom(scrollContainerRef)}
				/>
			}
			if (group.type === 'exploration_group') {
				return <TimelineExplorationGroup
					key={`explore-${group.indices[0]}`}
					messages={group.messages}
					indices={group.indices}
					currCheckpointIdx={currCheckpointIdx}
					chatIsRunning={isRunning}
					threadId={threadId}
					_scrollToBottom={() => scrollToBottom(scrollContainerRef)}
				/>
			}
			return <ChatBubble
				key={group.messageIdx}
				currCheckpointIdx={currCheckpointIdx}
				chatMessage={group.message}
				messageIdx={group.messageIdx}
				isCommitted={true}
				chatIsRunning={isRunning}
				threadId={threadId}
				_scrollToBottom={() => scrollToBottom(scrollContainerRef)}
			/>
		})
	}, [previousMessages, threadId, currCheckpointIdx, isRunning])

	const streamingChatIdx = previousMessagesHTML.length
	const currStreamingMessageHTML = reasoningSoFar || displayContentSoFar || isRunning ?
		<ChatBubble
			key={'curr-streaming-msg'}
			currCheckpointIdx={currCheckpointIdx}
			chatMessage={{
				role: 'assistant',
				displayContent: displayContentSoFar ?? '',
				reasoning: reasoningSoFar ?? '',
				anthropicReasoning: null,
			}}
			messageIdx={streamingChatIdx}
			isCommitted={false}
			chatIsRunning={isRunning}

			threadId={threadId}
			_scrollToBottom={null}
		/> : null


	// the tool currently being generated
	const generatingTool = toolIsGenerating ?
		toolCallSoFar.name === 'edit_file' || toolCallSoFar.name === 'rewrite_file' ? <EditToolSoFar
			key={'curr-streaming-tool'}
			toolCallSoFar={toolCallSoFar}
		/>
			: null
		: null

	const messagesHTML = <ScrollToBottomContainer
		key={'messages' + chatThreadsState.currentThreadId} // force rerender on all children if id changes
		scrollContainerRef={scrollContainerRef}
		className={`
			flex flex-col
			px-3 py-2 space-y-1.5
			w-full h-full
			overflow-x-hidden
			overflow-y-auto
			${previousMessagesHTML.length === 0 && !displayContentSoFar ? 'hidden' : ''}
		`}
	>
		{/* previous messages */}
		{previousMessagesHTML}
		{currStreamingMessageHTML}

		{/* Generating tool */}
		{generatingTool}

		{/* Discrete activity indicator */}
		{isRunning ? (
			<div className="flex items-center gap-2 py-2 px-1 select-none">
				<span className="relative flex h-2 w-2">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
					<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
				</span>
				<span className="font-mono text-[11px] text-text-secondary tracking-wide">Working...</span>
			</div>
		) : null}


		{/* error message */}
		{latestError === undefined ? null :
			<div className='px-2 my-1'>
				<ErrorDisplay
					message={latestError.message}
					fullError={latestError.fullError}
					onDismiss={() => { chatThreadsService.dismissStreamError(currentThread.id) }}
					showDismiss={true}
				/>

				<WarningBox className='text-sm my-2 mx-4' onClick={() => { commandService.executeCommand(VOID_OPEN_SETTINGS_ACTION_ID) }} text='Open settings' />
			</div>
		}
	</ScrollToBottomContainer>


	const onChangeText = useCallback((newStr: string) => {
		setInstructionsAreEmpty(!newStr)
		setTokenEstimate(estimateTokens(newStr))
	}, [setInstructionsAreEmpty, setTokenEstimate])
	const onKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
			onSubmit()
		} else if (e.key === 'Escape' && isRunning) {
			onAbort()
		}
	}, [onSubmit, onAbort, isRunning])

	// Sized and styled like the attach button next to it. The icon never changes:
	// dictating only tints it red, so the button does not resize or swap glyphs
	// under the cursor mid-sentence.
	const voiceButton = isVoiceModelReady && !isRunning ? <button
		type='button'
		className={`flex items-center justify-center transition-colors ${voiceRecorder.isRecording ? 'text-red-500' : 'text-void-fg-2 opacity-60 hover:opacity-100'} ${voiceRecorder.isTranscribing ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
		aria-label={voiceRecorder.isRecording ? 'Stop dictation' : 'Start dictation'}
		aria-pressed={voiceRecorder.isRecording}
		disabled={voiceRecorder.isTranscribing}
		title={voiceRecorder.error || (voiceRecorder.isRecording ? 'Stop dictation' : 'Dictate with a local model')}
		onMouseDown={event => event.preventDefault()}
		onClick={() => {
			if (voiceRecorder.isRecording) voiceRecorder.stop()
			else void voiceRecorder.start()
		}}
	>
		<Mic size={13} strokeWidth={2} />
	</button> : undefined

	const inputChatArea = <VoidChatArea
		featureName='Chat'
		micButton={voiceButton}
		onSubmit={() => onSubmit()}
		onAbort={onAbort}
		isStreaming={!!isRunning}
		isDisabled={isDisabled || voiceRecorder.isRecording || voiceRecorder.isTranscribing}
		showSelections={true}
		selections={selections}
		setSelections={setSelections}
		onClickAnywhere={() => { textAreaRef.current?.focus() }}
		tokenCount={tokenEstimate}
		contextWindow={chatContextWindow}
	>
		<VoidInputBox2
			enableAtToMention
			transparentBg={true}
			className={`min-h-[46px] px-0.5 py-0.5`}
			placeholder="Ask anything, @ to mention, / for actions"
			onChangeText={onChangeText}
			onKeyDown={onKeyDown}
			onFocus={() => { chatThreadsService.setCurrentlyFocusedMessageIdx(undefined) }}
			ref={textAreaRef}
			fnsRef={textAreaFnsRef}
			multiline={true}
		/>

	</VoidChatArea>


	const isLandingPage = previousMessages.length === 0


	const initiallySuggestedPromptsHTML = <div className='flex flex-col gap-2 w-full text-nowrap text-void-fg-3 select-none'>
		{[
			'Summarize my codebase',
			'How do types work in Rust?',
			'Create a .codeenrules file for me'
		].map((text, index) => (
			<div
				key={index}
				className='py-1 px-2 rounded text-sm bg-zinc-700/5 hover:bg-zinc-700/10 dark:bg-zinc-300/5 dark:hover:bg-zinc-300/10 cursor-pointer opacity-80 hover:opacity-100'
				onClick={() => onSubmit(text)}
			>
				{text}
			</div>
		))}
	</div>



	const threadPageInput = <div key={'input' + chatThreadsState.currentThreadId}>
		<CommandBarInChat />
		<div className='px-2 pb-2'>
			{inputChatArea}
		</div>
	</div>

	const landingPageWatermark = (
		<div className='flex items-center justify-center pt-5 pb-2 opacity-15 select-none pointer-events-none'>
			<CodeenPictogram size={64} />
		</div>
	)

	const landingPageInput = (
		<div className='w-full my-auto py-2'>
			{inputChatArea}
		</div>
	)

	const landingPageHistory = Object.keys(chatThreadsState.allThreads).length > 1 ? (
		<div className='w-full pb-3 select-none'>
			<div className='mb-1.5 text-[10.5px] font-mono uppercase tracking-wider text-text-muted'>
				Recent Threads
			</div>
			<PastThreadsList compact={true} limit={3} />
		</div>
	) : (
		<div className='w-full pb-3 select-none'>
			<div className='mb-1.5 text-[10.5px] font-mono uppercase tracking-wider text-text-muted'>
				Suggestions
			</div>
			{initiallySuggestedPromptsHTML}
		</div>
	)

	const landingPageContent = (
		<div
			ref={sidebarRef}
			className='w-full h-full flex flex-col justify-between overflow-y-auto px-3.5'
		>
			<ErrorBoundary>
				{landingPageWatermark}
			</ErrorBoundary>
			<ErrorBoundary>
				{landingPageInput}
			</ErrorBoundary>
			<ErrorBoundary>
				{landingPageHistory}
			</ErrorBoundary>
		</div>
	)

	const threadPageContent = <div
		ref={sidebarRef}
		className='w-full h-full flex flex-col overflow-hidden'
	>
		<ErrorBoundary>
			{messagesHTML}
		</ErrorBoundary>
		<ErrorBoundary>
			{threadPageInput}
		</ErrorBoundary>
	</div>

	const [showHistory, setShowHistory] = useState(false)
	useEffect(() => {
		setShowHistory(false)
	}, [chatThreadsState.currentThreadId])

	return (
		<div className="w-full h-full flex flex-col overflow-hidden bg-surface-panel" key={threadId}>
			<div className="flex-1 min-h-0 overflow-hidden">
				{showHistory ? (
					<div className="w-full h-full p-3 overflow-y-auto">
						<PastThreadsList />
					</div>
				) : isLandingPage ? (
					landingPageContent
				) : (
					threadPageContent
				)}
			</div>
		</div>
	)
}

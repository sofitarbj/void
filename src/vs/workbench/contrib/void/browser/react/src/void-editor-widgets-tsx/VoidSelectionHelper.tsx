/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/


import { useAccessor, useActiveURI, useIsDark, useSettingsState } from '../util/services.js';

import '../styles.css'
import { VOID_CTRL_K_ACTION_ID, VOID_CTRL_L_ACTION_ID } from '../../../actionIDs.js';
import { MessageSquare, Sparkles, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';

import { VoidSelectionHelperProps } from '../../../../../../contrib/void/browser/voidSelectionHelperWidget.js';
import { VOID_OPEN_SETTINGS_ACTION_ID } from '../../../voidSettingsPane.js';


export const VoidSelectionHelperMain = (props: VoidSelectionHelperProps) => {

	const isDark = useIsDark()

	return <div
		className={`@@void-scope ${isDark ? 'dark' : ''}`}
	>
		<VoidSelectionHelper {...props} />
	</div>
}



const VoidSelectionHelper = ({ rerenderKey }: VoidSelectionHelperProps) => {


	const accessor = useAccessor()
	const keybindingService = accessor.get('IKeybindingService')
	const commandService = accessor.get('ICommandService')

	const ctrlLKeybind = keybindingService.lookupKeybinding(VOID_CTRL_L_ACTION_ID)
	const ctrlKKeybind = keybindingService.lookupKeybinding(VOID_CTRL_K_ACTION_ID)

	const dividerHTML = <div className='w-px h-3.5 bg-border-hairline mx-0.5'></div>

	const [reactRerenderCount, setReactRerenderKey] = useState(rerenderKey)
	const [clickState, setClickState] = useState<'init' | 'clickedOption' | 'clickedMore'>('init')

	useEffect(() => {
		const disposable = commandService.onWillExecuteCommand(e => {
			if (e.commandId === VOID_CTRL_L_ACTION_ID || e.commandId === VOID_CTRL_K_ACTION_ID) {
				setClickState('clickedOption')
			}
		});

		return () => {
			disposable.dispose();
		};
	}, [commandService, setClickState]);


	// rerender when the key changes
	if (reactRerenderCount !== rerenderKey) {
		setReactRerenderKey(rerenderKey)
		setClickState('init')
	}

	if (clickState === 'clickedOption') {
		return null
	}

	const defaultHTML = <>
		{ctrlLKeybind &&
			<button
				type='button'
				className='
					flex items-center gap-1.5 px-2 py-1 rounded
					hover:bg-surface-hover text-text-primary text-[12px]
					transition-colors duration-150 cursor-pointer group
				'
				onClick={() => {
					commandService.executeCommand(VOID_CTRL_L_ACTION_ID)
					setClickState('clickedOption');
				}}
				title="Chat about selection (Ctrl+L)"
			>
				<MessageSquare className='w-3.5 h-3.5 text-agent-cyan shrink-0' />
				<span className='font-mono text-[11px] text-text-secondary group-hover:text-text-primary'>
					{ctrlLKeybind.getLabel()} Chat
				</span>
			</button>
		}
		{ctrlLKeybind && ctrlKKeybind &&
			dividerHTML
		}
		{ctrlKKeybind &&
			<button
				type='button'
				className='
					flex items-center gap-1.5 px-2 py-1 rounded
					bg-surface-hover text-primary text-[12px]
					transition-colors duration-150 cursor-pointer shadow-xs group
				'
				onClick={() => {
					commandService.executeCommand(VOID_CTRL_K_ACTION_ID)
					setClickState('clickedOption');
				}}
				title="Quick Edit selection (Ctrl+K)"
			>
				<Sparkles className='w-3.5 h-3.5 text-primary shrink-0' />
				<span className='font-mono text-[11px] text-primary font-semibold group-hover:brightness-110'>
					{ctrlKKeybind.getLabel()} Edit
				</span>
			</button>
		}

		{dividerHTML}

		<button
			type='button'
			className='
				flex items-center px-1.5 py-1 rounded
				hover:bg-surface-hover text-text-muted hover:text-text-primary
				transition-colors duration-150 cursor-pointer
			'
			onClick={() => {
				setClickState('clickedMore');
			}}
			title="More Agent Operations"
		>
			<MoreVertical className="w-3.5 h-3.5" />
		</button>
	</>


	const moreOptionsHTML = <>
		<button
			type='button'
			className='
				flex items-center px-2.5 py-1 rounded text-[11.5px]
				hover:bg-surface-hover text-text-secondary hover:text-text-primary
				transition-all duration-150 cursor-pointer
			'
			onClick={() => {
				commandService.executeCommand(VOID_OPEN_SETTINGS_ACTION_ID);
				setClickState('clickedOption');
			}}
		>
			Disable Suggestions?
		</button>

		{dividerHTML}

		<button
			type='button'
			className='
				flex items-center px-1 py-1 rounded
				hover:bg-surface-hover text-text-muted hover:text-text-primary
				transition-all duration-150 cursor-pointer
			'
			onClick={() => {
				setClickState('init');
			}}
		>
			<MoreVertical className="w-3.5 h-3.5" />
		</button>
	</>

	return <div className='
		pointer-events-auto select-none
		z-[1000]
		rounded shadow-xl flex items-center flex-nowrap text-nowrap
		border border-border-hairline bg-surface-elevated px-2 py-1 gap-1
		backdrop-blur-md
		transition-all duration-200
	'>
		{clickState === 'init' ? defaultHTML
			: clickState === 'clickedMore' ? moreOptionsHTML
				: <></>
		}
	</div>
}

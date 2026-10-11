/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TokenUsageDialog } from './TokenUsageDialog.js';
import ErrorBoundary from '../sidebar-tsx/ErrorBoundary.js';
import { ServicesAccessor } from '../../../../../../../editor/browser/editorExtensions.js';
import { mountFnGenerator } from '../util/mountFnGenerator.js';

export const mountTokenUsageDialog = (rootElement: HTMLElement, accessor: ServicesAccessor, initialProps?: { isOpen?: boolean; _ts?: number; onClose?: () => void }) => {
	const mount = mountFnGenerator(TokenUsageDialog);
	return mount(rootElement, accessor, initialProps);
};

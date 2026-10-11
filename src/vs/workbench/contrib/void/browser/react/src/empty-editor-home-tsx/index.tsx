/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen AI. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { areServicesRegistered, _registerServices } from '../util/services.js';
import { ServicesAccessor } from '../../../../../../../editor/browser/editorExtensions.js';

import { EmptyEditorHome } from './EmptyEditorHome.js';
import ErrorBoundary from '../sidebar-tsx/ErrorBoundary.js';

/**
 * Mounts the Codeen empty-editor home screen into a workbench DOM element.
 */
export const mountEmptyEditorHome = (rootElement: HTMLElement, accessor: ServicesAccessor) => {
	if (typeof document === 'undefined') {
		console.error('mountEmptyEditorHome error: document was undefined');
		return { rerender: () => { }, dispose: () => { } };
	}

	if (!areServicesRegistered()) {
		_registerServices(accessor);
	}

	const root = ReactDOM.createRoot(rootElement);
	root.render(<ErrorBoundary><EmptyEditorHome /></ErrorBoundary>);

	return {
		rerender: () => { root.render(<ErrorBoundary><EmptyEditorHome /></ErrorBoundary>); },
		dispose: () => { root.unmount(); },
	};
};

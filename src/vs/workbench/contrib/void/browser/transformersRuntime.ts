/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen AI. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

// This module deliberately contains NO static `import ... from '<npm-package>'`.
// We load the module at runtime to avoid bundler hoisting bare specifiers.

export type TransformersModule = any;

/** Paths relative to the app root (the sibling of `out/`). */
const TRANSFORMERS_ENTRY = 'node_modules/@huggingface/transformers/dist/transformers.web.js';
/** Directory holding the ORT .wasm/.mjs binaries, so they are never fetched from a CDN. */
const ORT_DIST_DIR = 'node_modules/onnxruntime-web/dist/';

const appRootUrl = (): string => {
	const fileRoot = (globalThis as { _VSCODE_FILE_ROOT?: string })._VSCODE_FILE_ROOT;
	if (typeof fileRoot === 'string' && fileRoot.length > 0) {
		return fileRoot.replace(/\/out\/$/, '/');
	}
	const href = (globalThis as { location?: { href?: string } }).location?.href;
	return new URL('../', href ?? 'file:///').toString();
};

export const loadTransformers = async (): Promise<TransformersModule> => {
	const root = appRootUrl();

	const mod = await import(/* @vite-ignore */ root + TRANSFORMERS_ENTRY);
	const transformers = (mod as { default?: TransformersModule }).default ?? (mod as TransformersModule);

	const wasm = (transformers as { env?: { backends?: { onnx?: { wasm?: { wasmPaths?: unknown } } } } }).env
		?.backends?.onnx?.wasm;
	if (wasm) {
		wasm.wasmPaths = root + ORT_DIST_DIR;
	}

	return transformers;
};

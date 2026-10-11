/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

// past values:
// 'void.settingsServiceStorage'
// 'void.settingsServiceStorageI' // 1.0.2
// 'void.settingsServiceStorageII' // 1.0.3

// Codeen Settings
export const VOID_SETTINGS_STORAGE_KEY = 'codeen.settingsServiceStorage'

// Stores only model installation metadata. Model weights remain in the
// Transformers.js browser cache and are never part of Codeen settings.
export const LOCAL_VOICE_MODELS_STORAGE_KEY = 'codeen.localVoiceModels.v1'


// past values:
// 'void.chatThreadStorage'
// 'void.chatThreadStorageI' // 1.0.2
// 'void.chatThreadStorageII' // 1.0.3

// Codeen Threads
export const THREAD_STORAGE_KEY = 'codeen.chatThreadStorage'

export const OPT_OUT_KEY = 'codeen.app.optOutAll'

export const PROJECT_MEMORY_STORAGE_KEY = 'codeen.projectMemory.v1'

// set once we've attempted to auto-bootstrap project memory for a workspace, so we never retry
// (even if the run failed or the user later clears the memory on purpose)
export const PROJECT_MEMORY_BOOTSTRAP_ATTEMPTED_KEY = 'codeen.projectMemory.bootstrapAttempted.v1'

export const TODO_STORAGE_KEY = 'codeen.todos.v1'

/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/


// register inline diffs
import './editCodeService.js'

// register Sidebar pane, state, actions (keybinds, menus) (Ctrl+L)
import './sidebarActions.js'
import './sidebarPane.js'

// register quick edit (Ctrl+K)
import './quickEditActions.js'


// register Autocomplete
import './autocompleteService.js'

// register Context services
// import './contextGatheringService.js'
// import './contextUserChangesService.js'

// settings pane
import './voidSettingsPane.js'

// register css
import './media/void.css'

// update (frontend part, also see platform/)
import './voidUpdateActions.js'

import './convertToLLMMessageWorkbenchContrib.js'

// tools
import './toolsService.js'
import './terminalToolService.js'

// register Thread History
import './chatThreadService.js'

// ping
import './metricsPollService.js'

// helper services
import './helperServices/consistentItemService.js'

// system docs service
import './systemDocsService.js'

// register selection helper
import './voidSelectionHelperWidget.js'

// register tooltip service
import './tooltipService.js'

// register onboarding service
import './voidOnboardingService.js'

// register misc service
import './miscWokrbenchContrib.js'

// register file service (for explorer context menu)
import './fileService.js'

// register source control management
import './voidSCMService.js'

// register memory service (persistent context, knowledge items, user rules)
import './voidMemoryService.js'

// register budget service (API request limits, command blocklist)
import './voidBudgetService.js'

// register context budget service (token budget allocation per context level)
import './contextBudgetService.js'

// register smart context service (compression, deduplication, history summarization)
import './smartContextService.js'

// register model router service (intelligent model selection based on task complexity)
import './modelRouterService.js'

// register skill service (specialized knowledge modules)
import './skillService.js'

// register workflow service (slash commands: /test, /doc, /review, /refactor, /explain, /fix)
import './workflowService.js'

// ---------- common (unclear if these actually need to be imported, because they're already imported wherever they're used) ----------

// llmMessage
import '../common/sendLLMMessageService.js'

// voidSettings
import '../common/voidSettingsService.js'

// refreshModel
import '../common/refreshModelService.js'

// metrics
import '../common/metricsService.js'

// updates
import '../common/voidUpdateService.js'

// model service
import '../common/voidModelService.js'

// token usage & cost tracking (Phase 2)
import '../common/tokenUsageService.js'
import './tokenUsageStatusBar.js'
import './tokenUsageDialogService.js'

// project memory bootstrap (Phase 5)
import './projectMemoryBootstrapContrib.js'

// local voice recognition zero-cloud (Phase 8)
import './localVoiceModelService.js'

import { CancellationToken } from '../../../../base/common/cancellation.js'
import { URI } from '../../../../base/common/uri.js'
import { VSBuffer } from '../../../../base/common/buffer.js'
import { IFileService } from '../../../../platform/files/common/files.js'
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js'
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js'
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js'
import { QueryBuilder } from '../../../services/search/common/queryBuilder.js'
import { ISearchService } from '../../../services/search/common/search.js'
import { IEditCodeService } from './editCodeServiceInterface.js'
import { ITerminalToolService } from './terminalToolService.js'
import { LintErrorItem, BuiltinToolCallParams, BuiltinToolResultType, BuiltinToolName } from '../common/toolsServiceTypes.js'
import { IVoidModelService } from '../common/voidModelService.js'
import { EndOfLinePreference } from '../../../../editor/common/model.js'
import { IVoidCommandBarService } from './voidCommandBarService.js'
import { computeDirectoryTree1Deep, IDirectoryStrService, stringifyDirectoryTree1Deep } from '../common/directoryStrService.js'
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js'
import { timeout } from '../../../../base/common/async.js'
import { RawToolParamsObj } from '../common/sendLLMMessageTypes.js'
import { MAX_CHILDREN_URIs_PAGE, MAX_FILE_CHARS_PAGE, MAX_TERMINAL_BG_COMMAND_TIME, MAX_TERMINAL_INACTIVE_TIME } from '../common/prompt/prompts.js'
import { IVoidSettingsService } from '../common/voidSettingsService.js'
import { generateUuid } from '../../../../base/common/uuid.js'
import { ISkillService } from './skillService.js'
import { PolicyEngine, isPathInWorkspace, Policy } from '../common/agent/policyEngine.js';
import { classifyCommand } from '../common/securityUtils.js';


// tool use for AI
type ValidateBuiltinParams = { [T in BuiltinToolName]: (p: RawToolParamsObj) => BuiltinToolCallParams[T] }
type CallBuiltinTool = { [T in BuiltinToolName]: (p: BuiltinToolCallParams[T]) => Promise<{ result: BuiltinToolResultType[T] | Promise<BuiltinToolResultType[T]>, interruptTool?: () => void }> }
type BuiltinToolResultToString = { [T in BuiltinToolName]: (p: BuiltinToolCallParams[T], result: Awaited<BuiltinToolResultType[T]>) => string }


const isFalsy = (u: unknown) => {
	return !u || u === 'null' || u === 'undefined'
}

const validateStr = (argName: string, value: unknown) => {
	if (value === null) throw new Error(`Invalid LLM output: ${argName} was null.`)
	if (typeof value !== 'string') throw new Error(`Invalid LLM output format: ${argName} must be a string, but its type is "${typeof value}". Full value: ${JSON.stringify(value)}.`)
	return value
}


// We are NOT checking to make sure in workspace
const validateURI = (uriStr: unknown) => {
	if (uriStr === null) throw new Error(`Invalid LLM output: uri was null.`)
	if (typeof uriStr !== 'string') throw new Error(`Invalid LLM output format: Provided uri must be a string, but it's a(n) ${typeof uriStr}. Full value: ${JSON.stringify(uriStr)}.`)

	// Check if it's already a full URI with scheme (e.g., vscode-remote://, file://, etc.)
	// Look for :// pattern which indicates a scheme is present
	// Examples of supported URIs:
	// - vscode-remote://wsl+Ubuntu/home/user/file.txt (WSL)
	// - vscode-remote://ssh-remote+myserver/home/user/file.txt (SSH)
	// - file:///home/user/file.txt (local file with scheme)
	// - /home/user/file.txt (local file path, will be converted to file://)
	// - C:\Users\file.txt (Windows local path, will be converted to file://)
	if (uriStr.includes('://')) {
		try {
			const uri = URI.parse(uriStr)
			return uri
		} catch (e) {
			// If parsing fails, it's a malformed URI
			throw new Error(`Invalid URI format: ${uriStr}. Error: ${e}`)
		}
	} else {
		// No scheme present, treat as file path
		// This handles regular file paths like /home/user/file.txt or C:\Users\file.txt
		const uri = URI.file(uriStr)
		return uri
	}
}

const validateOptionalURI = (uriStr: unknown) => {
	if (isFalsy(uriStr)) return null
	return validateURI(uriStr)
}

const validateOptionalStr = (argName: string, str: unknown) => {
	if (isFalsy(str)) return null
	return validateStr(argName, str)
}


const validatePageNum = (pageNumberUnknown: unknown) => {
	if (!pageNumberUnknown) return 1
	const parsedInt = Number.parseInt(pageNumberUnknown + '')
	if (!Number.isInteger(parsedInt)) throw new Error(`Page number was not an integer: "${pageNumberUnknown}".`)
	if (parsedInt < 1) throw new Error(`Invalid LLM output format: Specified page number must be 1 or greater: "${pageNumberUnknown}".`)
	return parsedInt
}

const validateNumber = (numStr: unknown, opts: { default: number | null }) => {
	if (typeof numStr === 'number')
		return numStr
	if (isFalsy(numStr)) return opts.default

	if (typeof numStr === 'string') {
		const parsedInt = Number.parseInt(numStr + '')
		if (!Number.isInteger(parsedInt)) return opts.default
		return parsedInt
	}

	return opts.default
}

const validateProposedTerminalId = (terminalIdUnknown: unknown) => {
	if (!terminalIdUnknown) throw new Error(`A value for terminalID must be specified, but the value was "${terminalIdUnknown}"`)
	const terminalId = terminalIdUnknown + ''
	return terminalId
}

const validateBoolean = (b: unknown, opts: { default: boolean }) => {
	if (typeof b === 'string') {
		if (b === 'true') return true
		if (b === 'false') return false
	}
	if (typeof b === 'boolean') {
		return b
	}
	return opts.default
}


const checkIfIsFolder = (uriStr: string) => {
	uriStr = uriStr.trim()
	if (uriStr.endsWith('/') || uriStr.endsWith('\\')) return true
	return false
}

export interface IToolsService {
	readonly _serviceBrand: undefined;
	validateParams: ValidateBuiltinParams;
	callTool: CallBuiltinTool;
	stringOfResult: BuiltinToolResultToString;
}

export const IToolsService = createDecorator<IToolsService>('ToolsService');

export class ToolsService implements IToolsService {

	readonly _serviceBrand: undefined;

	public validateParams: ValidateBuiltinParams;
	public callTool: CallBuiltinTool;
	public stringOfResult: BuiltinToolResultToString;

	constructor(
		@IFileService fileService: IFileService,
		@IWorkspaceContextService workspaceContextService: IWorkspaceContextService,
		@ISearchService searchService: ISearchService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IVoidModelService voidModelService: IVoidModelService,
		@IEditCodeService editCodeService: IEditCodeService,
		@ITerminalToolService private readonly terminalToolService: ITerminalToolService,
		@IVoidCommandBarService private readonly commandBarService: IVoidCommandBarService,
		@IDirectoryStrService private readonly directoryStrService: IDirectoryStrService,
		@IMarkerService private readonly markerService: IMarkerService,
		@IVoidSettingsService private readonly voidSettingsService: IVoidSettingsService,
		@ISkillService private readonly skillService: ISkillService,
	) {
		const queryBuilder = instantiationService.createInstance(QueryBuilder);

		this.validateParams = {
			read_file: (params: RawToolParamsObj) => {
				const { uri: uriStr, start_line: startLineUnknown, end_line: endLineUnknown, page_number: pageNumberUnknown } = params
				const uri = validateURI(uriStr)
				const pageNumber = validatePageNum(pageNumberUnknown)

				let startLine = validateNumber(startLineUnknown, { default: null })
				let endLine = validateNumber(endLineUnknown, { default: null })

				if (startLine !== null && startLine < 1) startLine = null
				if (endLine !== null && endLine < 1) endLine = null

				return { uri, startLine, endLine, pageNumber }
			},
			ls_dir: (params: RawToolParamsObj) => {
				const { uri: uriStr, page_number: pageNumberUnknown } = params

				const uri = validateURI(uriStr)
				const pageNumber = validatePageNum(pageNumberUnknown)
				return { uri, pageNumber }
			},
			get_dir_tree: (params: RawToolParamsObj) => {
				const { uri: uriStr, } = params
				const uri = validateURI(uriStr)
				return { uri }
			},
			search_pathnames_only: (params: RawToolParamsObj) => {
				const {
					query: queryUnknown,
					search_in_folder: includeUnknown,
					page_number: pageNumberUnknown
				} = params

				const queryStr = validateStr('query', queryUnknown)
				const pageNumber = validatePageNum(pageNumberUnknown)
				const includePattern = validateOptionalStr('include_pattern', includeUnknown)

				return { query: queryStr, includePattern, pageNumber }

			},
			search_for_files: (params: RawToolParamsObj) => {
				const {
					query: queryUnknown,
					search_in_folder: searchInFolderUnknown,
					is_regex: isRegexUnknown,
					page_number: pageNumberUnknown
				} = params
				const queryStr = validateStr('query', queryUnknown)
				const pageNumber = validatePageNum(pageNumberUnknown)
				const searchInFolder = validateOptionalURI(searchInFolderUnknown)
				const isRegex = validateBoolean(isRegexUnknown, { default: false })
				return {
					query: queryStr,
					isRegex,
					searchInFolder,
					pageNumber
				}
			},
			search_in_file: (params: RawToolParamsObj) => {
				const { uri: uriStr, query: queryUnknown, is_regex: isRegexUnknown } = params;
				const uri = validateURI(uriStr);
				const query = validateStr('query', queryUnknown);
				const isRegex = validateBoolean(isRegexUnknown, { default: false });
				return { uri, query, isRegex };
			},

			read_lint_errors: (params: RawToolParamsObj) => {
				const {
					uri: uriUnknown,
				} = params
				const uri = validateURI(uriUnknown)
				return { uri }
			},

			// ---

			create_file_or_folder: (params: RawToolParamsObj) => {
				const { uri: uriUnknown } = params
				const uri = validateURI(uriUnknown)
				const uriStr = validateStr('uri', uriUnknown)
				const isFolder = checkIfIsFolder(uriStr)
				return { uri, isFolder }
			},

			write_to_file: (params: RawToolParamsObj) => {
				const { uri: uriStr, content: contentUnknown } = params
				const uri = validateURI(uriStr)
				const content = validateStr('content', contentUnknown)
				return { uri, content }
			},

			delete_file_or_folder: (params: RawToolParamsObj) => {
				const { uri: uriUnknown, is_recursive: isRecursiveUnknown } = params
				const uri = validateURI(uriUnknown)
				const isRecursive = validateBoolean(isRecursiveUnknown, { default: false })
				const uriStr = validateStr('uri', uriUnknown)
				const isFolder = checkIfIsFolder(uriStr)
				return { uri, isRecursive, isFolder }
			},

			rewrite_file: (params: RawToolParamsObj) => {
				const { uri: uriStr, new_content: newContentUnknown } = params
				const uri = validateURI(uriStr)
				const newContent = validateStr('newContent', newContentUnknown)
				return { uri, newContent }
			},

			edit_file: (params: RawToolParamsObj) => {
				const { uri: uriStr, search_replace_blocks: searchReplaceBlocksUnknown } = params
				const uri = validateURI(uriStr)
				const searchReplaceBlocks = validateStr('searchReplaceBlocks', searchReplaceBlocksUnknown)
				return { uri, searchReplaceBlocks }
			},

			// ---

			run_command: (params: RawToolParamsObj) => {
				const { command: commandUnknown, cwd: cwdUnknown } = params
				const command = validateStr('command', commandUnknown)
				const cwd = validateOptionalStr('cwd', cwdUnknown)
				const terminalId = generateUuid()
				return { command, cwd, terminalId }
			},
			run_persistent_command: (params: RawToolParamsObj) => {
				const { command: commandUnknown, persistent_terminal_id: persistentTerminalIdUnknown } = params;
				const command = validateStr('command', commandUnknown);
				const persistentTerminalId = validateProposedTerminalId(persistentTerminalIdUnknown)
				return { command, persistentTerminalId };
			},
			open_persistent_terminal: (params: RawToolParamsObj) => {
				const { cwd: cwdUnknown } = params;
				const cwd = validateOptionalStr('cwd', cwdUnknown)
				// No parameters needed; will open a new background terminal
				return { cwd };
			},
			kill_persistent_terminal: (params: RawToolParamsObj) => {
				const { persistent_terminal_id: terminalIdUnknown } = params;
				const persistentTerminalId = validateProposedTerminalId(terminalIdUnknown);
				return { persistentTerminalId };
			},
			send_command_input: (params: RawToolParamsObj) => {
				const { persistent_terminal_id: terminalIdUnknown, input } = params;
				const persistentTerminalId = validateProposedTerminalId(terminalIdUnknown);
				if (!input) throw new Error('send_command_input: input is required');
				return { persistentTerminalId, input: input };
			},
			todo_list: (params: RawToolParamsObj) => {
				const { todos } = params;
				if (!todos) throw new Error('todo_list: todos parameter is required');
				return { todos: todos };
			},
			todo_write: (params: RawToolParamsObj) => {
				const { todos } = params;
				if (!todos) throw new Error('todo_write: todos parameter is required');
				return { todos: todos as any };
			},
			ask_user_question: (params: RawToolParamsObj) => {
				const { question, options, allow_free_text } = params;
				if (!question) throw new Error('ask_user_question: question is required');
				return { question: question, options: options || '[]', allowFreeText: allow_free_text !== 'false' };
			},
			invoke_skill: (params: RawToolParamsObj) => {
				const { skill_name } = params;
				if (!skill_name) throw new Error('invoke_skill: skill_name is required');
				return { skillName: skill_name };
			},
			search_web: (params: RawToolParamsObj) => {
				const { query } = params;
				if (!query) throw new Error('search_web: query is required');
				return { query: query };
			},
			read_url_content: (params: RawToolParamsObj) => {
				const { url } = params;
				if (!url) throw new Error('read_url_content: url is required');
				if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
					throw new Error('read_url_content: url must be an HTTP or HTTPS URL');
				}
				return { url: url };
			},
			create_system_doc: (params: RawToolParamsObj) => {
				const { type, title, content } = params;
				if (!type) throw new Error('create_system_doc: type is required');
				if (!title) throw new Error('create_system_doc: title is required');
				if (!content) throw new Error('create_system_doc: content is required');
				return { type: type, title: title, content: content };
			},

		}


		this.callTool = {
			read_file: async ({ uri, startLine, endLine, pageNumber }) => {
				await voidModelService.initializeModel(uri)
				const { model } = await voidModelService.getModelSafe(uri)
				if (model === null) { throw new Error(`No contents; File does not exist.`) }

				let contents: string
				if (startLine === null && endLine === null) {
					contents = model.getValue(EndOfLinePreference.LF)
				}
				else {
					const startLineNumber = startLine === null ? 1 : startLine
					const endLineNumber = endLine === null ? model.getLineCount() : endLine
					contents = model.getValueInRange({ startLineNumber, startColumn: 1, endLineNumber, endColumn: Number.MAX_SAFE_INTEGER }, EndOfLinePreference.LF)
				}

				const totalNumLines = model.getLineCount()

				const fromIdx = MAX_FILE_CHARS_PAGE * (pageNumber - 1)
				const toIdx = MAX_FILE_CHARS_PAGE * pageNumber - 1
				const fileContents = contents.slice(fromIdx, toIdx + 1) // paginate
				const hasNextPage = (contents.length - 1) - toIdx >= 1
				const totalFileLen = contents.length
				return { result: { fileContents, totalFileLen, hasNextPage, totalNumLines } }
			},

			ls_dir: async ({ uri, pageNumber }) => {
				const dirResult = await computeDirectoryTree1Deep(fileService, uri, pageNumber)
				return { result: dirResult }
			},

			get_dir_tree: async ({ uri }) => {
				const str = await this.directoryStrService.getDirectoryStrTool(uri)
				return { result: { str } }
			},

			search_pathnames_only: async ({ query: queryStr, includePattern, pageNumber }) => {

				const query = queryBuilder.file(workspaceContextService.getWorkspace().folders.map(f => f.uri), {
					filePattern: queryStr,
					includePattern: includePattern ?? undefined,
					sortByScore: true, // makes results 10x better
				})
				const data = await searchService.fileSearch(query, CancellationToken.None)

				const fromIdx = MAX_CHILDREN_URIs_PAGE * (pageNumber - 1)
				const toIdx = MAX_CHILDREN_URIs_PAGE * pageNumber - 1
				const uris = data.results
					.slice(fromIdx, toIdx + 1) // paginate
					.map(({ resource, results }) => resource)

				const hasNextPage = (data.results.length - 1) - toIdx >= 1
				return { result: { uris, hasNextPage } }
			},

			search_for_files: async ({ query: queryStr, isRegex, searchInFolder, pageNumber }) => {
				const searchFolders = searchInFolder === null ?
					workspaceContextService.getWorkspace().folders.map(f => f.uri)
					: [searchInFolder]

				const query = queryBuilder.text({
					pattern: queryStr,
					isRegExp: isRegex,
				}, searchFolders)

				const data = await searchService.textSearch(query, CancellationToken.None)

				const fromIdx = MAX_CHILDREN_URIs_PAGE * (pageNumber - 1)
				const toIdx = MAX_CHILDREN_URIs_PAGE * pageNumber - 1
				const uris = data.results
					.slice(fromIdx, toIdx + 1) // paginate
					.map(({ resource, results }) => resource)

				const hasNextPage = (data.results.length - 1) - toIdx >= 1
				return { result: { queryStr, uris, hasNextPage } }
			},
			search_in_file: async ({ uri, query, isRegex }) => {
				await voidModelService.initializeModel(uri);
				const { model } = await voidModelService.getModelSafe(uri);
				if (model === null) { throw new Error(`No contents; File does not exist.`); }
				const contents = model.getValue(EndOfLinePreference.LF);
				const contentOfLine = contents.split('\n');
				const totalLines = contentOfLine.length;
				const regex = isRegex ? new RegExp(query) : null;
				const lines: number[] = []
				for (let i = 0; i < totalLines; i++) {
					const line = contentOfLine[i];
					if ((isRegex && regex!.test(line)) || (!isRegex && line.includes(query))) {
						const matchLine = i + 1;
						lines.push(matchLine);
					}
				}
				return { result: { lines } };
			},

			read_lint_errors: async ({ uri }) => {
				await timeout(1000)
				const { lintErrors } = this._getLintErrors(uri)
				return { result: { lintErrors } }
			},

			// ---

			create_file_or_folder: async ({ uri, isFolder }) => {
				if (isFolder)
					await fileService.createFolder(uri)
				else {
					await fileService.createFile(uri, VSBuffer.fromString(''))
				}
				return { result: {} }
			},

			write_to_file: async ({ uri, content }) => {
				// Create parent directories if they don't exist
				const parentDir = URI.joinPath(uri, '..')
				try {
					await fileService.createFolder(parentDir)
				} catch {
					// Directory already exists
				}

				// Write content to file (creates file if doesn't exist)
				await fileService.writeFile(uri, VSBuffer.fromString(content))

				// Return lint errors like rewrite_file does (as a Promise)
				const lintErrorsPromise = Promise.resolve().then(async () => {
					await timeout(2000)
					const { lintErrors } = this._getLintErrors(uri)
					return { lintErrors }
				})
				return { result: lintErrorsPromise }
			},

			delete_file_or_folder: async ({ uri, isRecursive }) => {
				await fileService.del(uri, { recursive: isRecursive })
				return { result: {} }
			},

			rewrite_file: async ({ uri, newContent }) => {
				await voidModelService.initializeModel(uri)
				if (this.commandBarService.getStreamState(uri) === 'streaming') {
					throw new Error(`Another LLM is currently making changes to this file. Please stop streaming for now and ask the user to resume later.`)
				}
				await editCodeService.callBeforeApplyOrEdit(uri)
				editCodeService.instantlyRewriteFile({ uri, newContent })
				// at end, get lint errors
				const lintErrorsPromise = Promise.resolve().then(async () => {
					await timeout(2000)
					const { lintErrors } = this._getLintErrors(uri)
					return { lintErrors }
				})
				return { result: lintErrorsPromise }
			},

			edit_file: async ({ uri, searchReplaceBlocks }) => {
				await voidModelService.initializeModel(uri)
				if (this.commandBarService.getStreamState(uri) === 'streaming') {
					throw new Error(`Another LLM is currently making changes to this file. Please stop streaming for now and ask the user to resume later.`)
				}
				await editCodeService.callBeforeApplyOrEdit(uri)
				editCodeService.instantlyApplySearchReplaceBlocks({ uri, searchReplaceBlocks })

				// at end, get lint errors
				const lintErrorsPromise = Promise.resolve().then(async () => {
					await timeout(2000)
					const { lintErrors } = this._getLintErrors(uri)
					return { lintErrors }
				})

				return { result: lintErrorsPromise }
			},
			// ---
			run_command: async ({ command, cwd, terminalId }) => {
				const { resPromise, interrupt } = await this.terminalToolService.runCommand(command, { type: 'temporary', cwd, terminalId })
				return { result: resPromise, interruptTool: interrupt }
			},
			run_persistent_command: async ({ command, persistentTerminalId }) => {
				const { resPromise, interrupt } = await this.terminalToolService.runCommand(command, { type: 'persistent', persistentTerminalId })
				return { result: resPromise, interruptTool: interrupt }
			},
			open_persistent_terminal: async ({ cwd }) => {
				const persistentTerminalId = await this.terminalToolService.createPersistentTerminal({ cwd })
				return { result: { persistentTerminalId } }
			},
			kill_persistent_terminal: async ({ persistentTerminalId }) => {
				// Close the background terminal by sending exit
				await this.terminalToolService.killPersistentTerminal(persistentTerminalId)
				return { result: {} }
			},
			send_command_input: async ({ persistentTerminalId, input }) => {
				await this.terminalToolService.sendInputToPersistentTerminal(persistentTerminalId, input + '\n')
				return { result: { result: `Input "${input}" sent to terminal ${persistentTerminalId}.` } }
			},
			todo_list: async ({ todos }) => {
				// Parse the JSON and store in thread state (will be picked up by UI)
				// The actual storage is handled by chatThreadService via an event
				return { result: { success: true } }
			},
			todo_write: async ({ todos }) => {
				return { result: { success: true } }
			},
			ask_user_question: async ({ question, options, allowFreeText }) => {
				// This tool suspends execution — the result will be provided by the user
				// The interruptTool mechanism in chatThreadService handles this
				return { result: { userResponse: '' }, interruptTool: true } as any
			},
			invoke_skill: async ({ skillName }) => {
				if (skillName === 'list') {
					const skills = this.skillService.getAvailableSkills()
					return { result: { skillContent: 'Available skills:\n' + skills.map((s: { name: string; description: string }) => `- ${s.name}: ${s.description}`).join('\n') } }
				}
				const skill = this.skillService.getSkillByName(skillName)
				if (!skill) {
					return { result: { skillContent: `Skill "${skillName}" not found. Use skill_name="list" to see available skills.` } }
				}
				return { result: { skillContent: skill.content } }
			},
			search_web: async ({ query }) => {
				try {
					const encoded = encodeURIComponent(query)
					const resp = await fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`)
					const data = await resp.json()
					const results: string[] = []
					if (data.AbstractText) results.push(`Summary: ${data.AbstractText}`)
					if (data.RelatedTopics) {
						for (const topic of data.RelatedTopics.slice(0, 8)) {
							if (topic.Text) results.push(`- ${topic.Text}`)
						}
					}
					return { result: { results: results.length > 0 ? results.join('\n') : `No results found for "${query}". Try rephrasing.` } }
				} catch (e) {
					return { result: { results: `Search failed: ${e}` } }
				}
			},
			read_url_content: async ({ url }) => {
				try {
					const resp = await fetch(url, { headers: { 'User-Agent': 'VoidIDE/1.0' } })
					if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
					const html = await resp.text()
					// Simple HTML to text extraction
					const text = html
						.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
						.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
						.replace(/<[^>]+>/g, ' ')
						.replace(/\s+/g, ' ')
						.trim()
						.substring(0, 20_000) // limit to ~5K tokens to control context costs
					return { result: { content: text } }
				} catch (e) {
					return { result: { content: `Failed to read URL: ${e}` } }
				}
			},
			create_system_doc: async ({ type, title, content }) => {
				try {
					const systemDocsService = instantiationService.invokeFunction(accessor => accessor.get('ISystemDocsService' as any)) as any
					const chatThreadsService = instantiationService.invokeFunction(accessor => accessor.get('IChatThreadService' as any)) as any
					const threadId = chatThreadsService.state.currentThreadId
					const doc = await systemDocsService.createDoc({
						type: type as any,
						title,
						content,
						threadId,
					})
					const workspace = workspaceContextService.getWorkspace()
					const rootPath = workspace.folders[0]?.uri.fsPath || ''
					const relativePath = `.void/docs/${type}_${doc.id.slice(0, 8)}.md`
					return { result: { docId: doc.id, filePath: `${rootPath}/${relativePath}` } }
				} catch (e) {
					return { result: { docId: '', filePath: `Failed to create system doc: ${e}` } }
				}
			},
		}


		const nextPageStr = (hasNextPage: boolean) => hasNextPage ? '\n\n(more on next page...)' : ''

		const stringifyLintErrors = (lintErrors: LintErrorItem[]) => {
			return lintErrors
				.map((e, i) => `Error ${i + 1}:\nLines Affected: ${e.startLineNumber}-${e.endLineNumber}\nError message:${e.message}`)
				.join('\n\n')
				.substring(0, MAX_FILE_CHARS_PAGE)
		}

		// given to the LLM after the call for successful tool calls
		this.stringOfResult = {
			read_file: (params, result) => {
				return `${params.uri.fsPath}\n\`\`\`\n${result.fileContents}\n\`\`\`${nextPageStr(result.hasNextPage)}${result.hasNextPage ? `\nMore info because truncated: this file has ${result.totalNumLines} lines, or ${result.totalFileLen} characters.` : ''}`
			},
			ls_dir: (params, result) => {
				const dirTreeStr = stringifyDirectoryTree1Deep(params, result)
				return dirTreeStr // + nextPageStr(result.hasNextPage) // already handles num results remaining
			},
			get_dir_tree: (params, result) => {
				return result.str
			},
			search_pathnames_only: (params, result) => {
				return result.uris.map(uri => uri.fsPath).join('\n') + nextPageStr(result.hasNextPage)
			},
			search_for_files: (params, result) => {
				return result.uris.map(uri => uri.fsPath).join('\n') + nextPageStr(result.hasNextPage)
			},
			search_in_file: (params, result) => {
				const { model } = voidModelService.getModel(params.uri)
				if (!model) return '<Error getting string of result>'
				const lines = result.lines.map(n => {
					const lineContent = model.getValueInRange({ startLineNumber: n, startColumn: 1, endLineNumber: n, endColumn: Number.MAX_SAFE_INTEGER }, EndOfLinePreference.LF)
					return `Line ${n}:\n\`\`\`\n${lineContent}\n\`\`\``
				}).join('\n\n');
				return lines;
			},
			read_lint_errors: (params, result) => {
				return result.lintErrors ?
					stringifyLintErrors(result.lintErrors)
					: 'No lint errors found.'
			},
			// ---
			create_file_or_folder: (params, result) => {
				return `URI ${params.uri.fsPath} successfully created.`
			},
			write_to_file: (params, result) => {
				const lintErrsString = (
					this.voidSettingsService.state.globalSettings.includeToolLintErrors ?
						(result.lintErrors ? ` Lint errors found after writing:\n${stringifyLintErrors(result.lintErrors)}.\nIf this is related to a change made while calling this tool, you might want to fix the error.`
							: ` No lint errors found.`)
						: '')
				return `File ${params.uri.fsPath} successfully created and written.${lintErrsString}`
			},
			delete_file_or_folder: (params, result) => {
				return `URI ${params.uri.fsPath} successfully deleted.`
			},
			edit_file: (params, result) => {
				const lintErrsString = (
					this.voidSettingsService.state.globalSettings.includeToolLintErrors ?
						(result.lintErrors ? ` Lint errors found after change:\n${stringifyLintErrors(result.lintErrors)}.\nIf this is related to a change made while calling this tool, you might want to fix the error.`
							: ` No lint errors found.`)
						: '')

				return `Change successfully made to ${params.uri.fsPath}.${lintErrsString}`
			},
			rewrite_file: (params, result) => {
				const lintErrsString = (
					this.voidSettingsService.state.globalSettings.includeToolLintErrors ?
						(result.lintErrors ? ` Lint errors found after change:\n${stringifyLintErrors(result.lintErrors)}.\nIf this is related to a change made while calling this tool, you might want to fix the error.`
							: ` No lint errors found.`)
						: '')

				return `Change successfully made to ${params.uri.fsPath}.${lintErrsString}`
			},
			run_command: (params, result) => {
				const { resolveReason, result: result_, } = result
				// success
				if (resolveReason.type === 'done') {
					return `${result_}\n(exit code ${resolveReason.exitCode})`
				}
				// normal command
				if (resolveReason.type === 'timeout') {
					return `${result_}\nTerminal command ran, but was automatically killed by Void after ${MAX_TERMINAL_INACTIVE_TIME}s of inactivity and did not finish successfully. To try with more time, open a persistent terminal and run the command there.`
				}
				throw new Error(`Unexpected internal error: Terminal command did not resolve with a valid reason.`)
			},

			run_persistent_command: (params, result) => {
				const { resolveReason, result: result_, } = result
				const { persistentTerminalId } = params
				// success
				if (resolveReason.type === 'done') {
					return `${result_}\n(exit code ${resolveReason.exitCode})`
				}
				// bg command
				if (resolveReason.type === 'timeout') {
					return `${result_}\nTerminal command is running in terminal ${persistentTerminalId}. The given outputs are the results after ${MAX_TERMINAL_BG_COMMAND_TIME} seconds.`
				}
				throw new Error(`Unexpected internal error: Terminal command did not resolve with a valid reason.`)
			},

			open_persistent_terminal: (_params, result) => {
				const { persistentTerminalId } = result;
				return `Successfully created persistent terminal. persistentTerminalId="${persistentTerminalId}"`;
			},
			kill_persistent_terminal: (params, _result) => {
				return `Successfully closed terminal "${params.persistentTerminalId}".`;
			},
			send_command_input: (params, result) => {
				return result.result;
			},
			todo_list: (_params, _result) => {
				return 'Task list updated successfully.';
			},
			todo_write: (_params, _result) => {
				return 'Task list updated successfully.';
			},
			ask_user_question: (_params, result) => {
				return `User responded: ${result.userResponse}`;
			},
			invoke_skill: (_params, result) => {
				return result.skillContent;
			},
			search_web: (_params, result) => {
				return result.results;
			},
			read_url_content: (_params, result) => {
				return result.content;
			},
			create_system_doc: (_params, result) => {
				if (result.docId) {
					return `System document created successfully at: ${result.filePath}\nDocument ID: ${result.docId}`;
				}
				return result.filePath; // error message
			},
		}

		// --- Confinement de sécurité Codeen (AOP/Proxy) ---
		const getWorkspaces = () => workspaceContextService.getWorkspace().folders.map(f => f.uri.fsPath);

		const policies: Policy[] = [
			// 1. Bloquer impérativement toute écriture/modification hors du workspace (Fail-Closed)
			{
				name: 'block_outside_write_create',
				tool: 'create_file_or_folder',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_write_file',
				tool: 'write_to_file',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_delete',
				tool: 'delete_file_or_folder',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_rewrite',
				tool: 'rewrite_file',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_edit',
				tool: 'edit_file',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},

			// 2. Refuser la lecture hors workspace également pour un cloisonnement complet
			{
				name: 'block_outside_read_file',
				tool: 'read_file',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_ls',
				tool: 'ls_dir',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},
			{
				name: 'block_outside_tree',
				tool: 'get_dir_tree',
				decision: 'DENY',
				when: (args) => args.uri && !getWorkspaces().some(ws => isPathInWorkspace(args.uri.fsPath, ws))
			},

			// 3. Bloquer automatiquement toute commande destructive (rm -rf, format, drop db, etc.)
			{
				name: 'block_destructive_command',
				tool: 'run_command',
				decision: 'DENY',
				when: (args) => classifyCommand(args.command).level === 'destructive'
			},
			{
				name: 'block_destructive_persistent_command',
				tool: 'run_persistent_command',
				decision: 'DENY',
				when: (args) => classifyCommand(args.command).level === 'destructive'
			},

			// 4. Demander confirmation utilisateur pour l'exécution de commandes non-destructives
			{
				name: 'confirm_run_command',
				tool: 'run_command',
				decision: 'ASK_USER'
			},
			{
				name: 'confirm_run_persistent_command',
				tool: 'run_persistent_command',
				decision: 'ASK_USER'
			},

			// 4. Demander confirmation pour suppression
			{
				name: 'confirm_deletion',
				tool: 'delete_file_or_folder',
				decision: 'ASK_USER'
			},

			// 5. Par défaut, approuver les autres cas s'ils sont dans le workspace
			{
				name: 'allow_all_inside_workspace',
				tool: '*',
				decision: 'APPROVE'
			}
		];

		const policyEngine = new PolicyEngine(policies);

		// Proxy d'interception sur tous les appels d'outils
		for (const key of Object.keys(this.callTool) as BuiltinToolName[]) {
			const originalCall = this.callTool[key];
			(this.callTool as any)[key] = async (params: any) => {
				const decision = policyEngine.evaluate(key, params);

				if (decision === 'DENY') {
					throw new Error(`[Codeen Security] Action "${key}" bloquée : violation des politiques de confinement du workspace.`);
				}

				return originalCall(params);
			};
		}

	}


	private _getLintErrors(uri: URI): { lintErrors: LintErrorItem[] | null } {
		const lintErrors = this.markerService
			.read({ resource: uri })
			.filter(l => l.severity === MarkerSeverity.Error || l.severity === MarkerSeverity.Warning)
			.slice(0, 100)
			.map(l => ({
				code: typeof l.code === 'string' ? l.code : l.code?.value || '',
				message: (l.severity === MarkerSeverity.Error ? '(error) ' : '(warning) ') + l.message,
				startLineNumber: l.startLineNumber,
				endLineNumber: l.endLineNumber,
			} satisfies LintErrorItem))

		if (!lintErrors.length) return { lintErrors: null }
		return { lintErrors, }
	}


}

registerSingleton(IToolsService, ToolsService, InstantiationType.Eager);

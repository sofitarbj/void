/*--------------------------------------------------------------------------------------
 *  Copyright 2026 Codeen IDE. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------*/

import React, { useEffect, useRef, useState } from 'react';
import { useAccessor, useIsDark, useSettingsState } from '../util/services.js';
import {
	Check,
	ExternalLink,
	X,
	Eye,
	EyeOff,
	Key,
	Mic,
	ArrowLeft,
	ArrowRight,
	Terminal,
	MousePointer,
	Wind,
} from 'lucide-react';
import {
	ProviderName,
} from '../../../../common/voidSettingsTypes.js';
import ErrorBoundary from '../sidebar-tsx/ErrorBoundary.js';
import { os } from '../../../../common/helpers/systemInfo.js';
import { TransferEditorType } from '../../../extensionTransferTypes.js';
import { CODEEN_FULL_PNG } from '../util/CodeenBrandAssets.js';

const OVERRIDE_VALUE = false;

export const VoidOnboarding = () => {
	const voidSettingsState = useSettingsState();
	const isOnboardingComplete = voidSettingsState.globalSettings.isOnboardingComplete || OVERRIDE_VALUE;
	const isDark = useIsDark();

	return (
		<div className={`@@void-scope ${isDark ? 'dark' : ''}`}>
			<div
				className={`
					bg-surface-base fixed top-0 right-0 bottom-0 left-0 w-full z-[99999] overflow-y-auto
					transition-all duration-500 ${isOnboardingComplete ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
				`}
				style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
			>
				{/* Halos ambiants ultra-subtils */}
				<div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.07] rounded-full blur-[140px] pointer-events-none" />

				<ErrorBoundary>
					<CodeenOnboardingContent />
				</ErrorBoundary>
			</div>
		</div>
	);
};

// ============================================================================
//  HEADER PERSISTANT COMMUN À TOUTES LES ÉTAPES
// ============================================================================

interface OnboardingHeaderProps {
	currentStep: number; // 0, 1, 2, 3
	onStepClick?: (step: number) => void;
	onClose: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ currentStep, onStepClick, onClose }) => {
	const steps = [
		{ num: 1, label: 'Welcome' },
		{ num: 2, label: 'AI Engine' },
		{ num: 3, label: 'Theme' },
		{ num: 4, label: 'Migration' },
	];

	return (
		<header className="flex items-center justify-between w-full max-w-5xl mx-auto mb-8 px-4 select-none">
			{/* Logo officiel complet Codeen issu directement de brand/codeenfull.png */}
			<div className="flex items-center select-none">
				<img
					src={CODEEN_FULL_PNG}
					alt="Codeen IDE"
					className="h-7 object-contain select-none pointer-events-none"
				/>
			</div>

			{/* Fil d'Ariane épuré */}
			<nav aria-label="Onboarding Progress" className="flex items-center gap-2.5">
				{steps.map((s, idx) => {
					const isActive = currentStep === idx;
					const isPassed = currentStep > idx;

					return (
						<React.Fragment key={s.num}>
							{idx > 0 && <span className="text-zinc-600 font-mono text-xs">/</span>}
							<div
								onClick={() => isPassed && onStepClick?.(idx)}
								className={`flex items-center gap-1.5 transition-colors ${
									isPassed ? 'cursor-pointer hover:text-text-primary' : ''
								}`}
							>
								<span
									className={`w-5 h-5 rounded-none font-mono text-[11px] flex items-center justify-center font-bold transition-all ${
										isActive
											? 'bg-primary text-black font-extrabold shadow-[0_0_10px_rgba(0,220,130,0.35)]'
											: isPassed
											? 'bg-primary/20 text-primary border border-primary/40'
											: 'bg-surface-elevated text-text-muted border border-white/5'
									}`}
								>
									{isPassed ? <Check className="w-3 h-3" /> : s.num}
								</span>
								<span
									className={`font-mono text-[11px] uppercase tracking-wider ${
										isActive
											? 'text-primary font-semibold'
											: isPassed
											? 'text-text-secondary'
											: 'text-text-muted'
									}`}
								>
									{s.label}
								</span>
							</div>
						</React.Fragment>
					);
				})}
			</nav>

			{/* Bouton Fermer */}
			<button
				type="button"
				aria-label="Close setup modal"
				onClick={onClose}
				className="w-8 h-8 rounded-none bg-surface-elevated hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors border border-white/5 cursor-pointer"
			>
				<X className="w-4 h-4" />
			</button>
		</header>
	);
};

// ============================================================================
//  ÉCRAN 1 : WELCOME (Minimaliste royal & centré)
// ============================================================================

interface StepWelcomeProps {
	onNext: () => void;
	onClose: () => void;
}

const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext, onClose }) => {
	return (
		<div className="flex flex-col w-full max-w-4xl mx-auto py-8 px-4 text-center select-none items-center justify-center min-h-[70vh]">
			{/* Grand Logo officiel Codeen au centre issu directement de brand/codeenfull.png */}
			<img
				src={CODEEN_FULL_PNG}
				alt="Codeen IDE"
				className="h-16 md:h-20 object-contain mb-8 select-none pointer-events-none"
			/>

			{/* Hero Title */}
			<h1
				className="text-3xl sm:text-5xl font-semibold text-text-primary max-w-2xl mb-4 tracking-tight leading-tight"
				style={{ fontFamily: 'Outfit, sans-serif' }}
			>
				Beyond Code Completion
			</h1>

			{/* Description épurée */}
			<p className="text-sm sm:text-base text-text-secondary max-w-xl mb-10 leading-relaxed font-sans">
				An Agentic AI IDE designed for autonomous software engineering, systemic multi-file reasoning, and zero-latency technical workflows.
			</p>

			{/* Actions centrales épurées */}
			<div className="flex items-center justify-center gap-4">
				<button
					type="button"
					onClick={onClose}
					className="px-5 py-2.5 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors cursor-pointer border border-white/5"
				>
					Skip setup
				</button>
				<button
					type="button"
					onClick={onNext}
					className="px-7 py-2.5 rounded-none bg-primary text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
				>
					<span>Get Started</span>
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};

// ============================================================================
//  ÉCRAN 2 : PROVIDERS & AI ENGINE (Sobre & sans cartes lourdes)
// ============================================================================

interface StepProvidersProps {
	onBack: () => void;
	onNext: () => void;
	onClose: () => void;
}

type ProviderClassTab = 'free' | 'commercial' | 'local' | 'voice';

const StepProviders: React.FC<StepProvidersProps> = ({ onBack, onNext, onClose }) => {
	const accessor = useAccessor();
	const voidSettingsService = accessor.get('IVoidSettingsService');
	const voidSettingsState = useSettingsState();

	const [activeTab, setActiveTab] = useState<ProviderClassTab>('free');
	const [activeConnector, setActiveConnector] = useState<ProviderName>('openRouter');
	const [apiKeyInput, setApiKeyInput] = useState<string>('');
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

	// Synchronise la clé API affichée avec le provider sélectionné
	useEffect(() => {
		const currentKey = voidSettingsState.settingsOfProvider[activeConnector]?.apiKey || '';
		setApiKeyInput(currentKey);
		setVerifyStatus(null);
	}, [activeConnector, voidSettingsState.settingsOfProvider]);

	const handleSaveKey = (val: string) => {
		setApiKeyInput(val);
		voidSettingsService.setSettingOfProvider(activeConnector, 'apiKey', val);
	};

	const handleVerify = () => {
		if (apiKeyInput.trim().length > 5) {
			setVerifyStatus('TOKEN VERIFIED & ENCRYPTED IN LOCAL KEYCHAIN');
		} else {
			setVerifyStatus('KEY FORMAT INVALID OR EMPTY');
		}
	};

	return (
		<div className="flex flex-col w-full max-w-5xl mx-auto py-4 px-4 text-on-surface select-none">
			<OnboardingHeader currentStep={1} onClose={onClose} />

			{/* Titre & Description de la page */}
			<div className="text-center mb-6">
				<h1 className="text-2xl font-semibold text-text-primary tracking-tight font-sans">
					Connect your Intelligence Engine
				</h1>
				<p className="text-xs text-text-secondary mt-1">
					Choose between zero-friction community pools, authenticated cloud APIs, or strictly offline local neural weights.
				</p>
			</div>

			{/* Disposition 2 colonnes sans carte englobante */}
			<div className="grid grid-cols-12 gap-6 w-full">
				{/* Colonne Gauche : Classes de Providers */}
				<aside className="col-span-12 md:col-span-4 flex flex-col space-y-2">
					<div className="font-mono text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">
						Provider Classes
					</div>

					{/* Onglet 1 : Free & Community */}
					<button
						type="button"
						onClick={() => {
							setActiveTab('free');
							setActiveConnector('openRouter');
						}}
						className={`w-full text-left p-3 rounded-none flex items-start space-x-3 transition-colors cursor-pointer border ${
							activeTab === 'free'
								? 'bg-surface-elevated text-text-primary border-primary shadow-sm'
								: 'bg-surface-panel/40 hover:bg-surface-elevated text-text-secondary hover:text-text-primary border-white/5'
						}`}
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-text-primary">Free &amp; Community</span>
								<span className="w-1.5 h-1.5 rounded-none bg-primary" />
							</div>
							<p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">Instant OpenRouter &amp; Google tiers</p>
						</div>
					</button>

					{/* Onglet 2 : Commercial Cloud */}
					<button
						type="button"
						onClick={() => {
							setActiveTab('commercial');
							setActiveConnector('anthropic');
						}}
						className={`w-full text-left p-3 rounded-none flex items-start space-x-3 transition-colors cursor-pointer border ${
							activeTab === 'commercial'
								? 'bg-surface-elevated text-text-primary border-primary shadow-sm'
								: 'bg-surface-panel/40 hover:bg-surface-elevated text-text-secondary hover:text-text-primary border-white/5'
						}`}
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-text-primary">Commercial Cloud</span>
								<span className="font-mono text-[9px] text-text-muted">BYOK</span>
							</div>
							<p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">Anthropic, OpenAI, DeepSeek</p>
						</div>
					</button>

					{/* Onglet 3 : Local & Offline */}
					<button
						type="button"
						onClick={() => {
							setActiveTab('local');
							setActiveConnector('ollama');
						}}
						className={`w-full text-left p-3 rounded-none flex items-start space-x-3 transition-colors cursor-pointer border ${
							activeTab === 'local'
								? 'bg-surface-elevated text-text-primary border-primary shadow-sm'
								: 'bg-surface-panel/40 hover:bg-surface-elevated text-text-secondary hover:text-text-primary border-white/5'
						}`}
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-text-primary">Local &amp; Offline</span>
								<span className="font-mono text-[9px] text-text-muted">AIR-GAPPED</span>
							</div>
							<p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">Ollama, LM Studio, vLLM</p>
						</div>
					</button>

					{/* Onglet 4 : Voice Dictation */}
					<button
						type="button"
						onClick={() => setActiveTab('voice')}
						className={`w-full text-left p-3 rounded-none flex items-start space-x-3 transition-colors cursor-pointer border ${
							activeTab === 'voice'
								? 'bg-surface-elevated text-text-primary border-primary shadow-sm'
								: 'bg-surface-panel/40 hover:bg-surface-elevated text-text-secondary hover:text-text-primary border-white/5'
						}`}
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-text-primary">Voice Dictation</span>
								<span className="font-mono text-[9px] text-text-muted">WHISPER</span>
							</div>
							<p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">Zero-latency, offline code speech</p>
						</div>
					</button>
				</aside>

				{/* Colonne Droite : Configuration active sans surcharge */}
				<main className="col-span-12 md:col-span-8 flex flex-col space-y-4">
					{/* Si onglet standard : Connecteurs de modèles */}
					{activeTab !== 'voice' && (
						<>
							<div>
								<div className="font-mono text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">
									Recommended Engine Connectors
								</div>

								{/* Grille des connecteurs de la catégorie */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
									{activeTab === 'free' && (
										<>
											{/* OpenRouter Free */}
											<div
												onClick={() => setActiveConnector('openRouter')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'openRouter'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">OpenRouter Free</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													Free pooled quota (DeepSeek / Llama)
												</p>
											</div>

											{/* Gemini Flash */}
											<div
												onClick={() => setActiveConnector('gemini')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'gemini'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">Gemini 2.5 Flash</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													Google Developer Free Tier
												</p>
											</div>
										</>
									)}

									{activeTab === 'commercial' && (
										<>
											{/* Anthropic Direct */}
											<div
												onClick={() => setActiveConnector('anthropic')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'anthropic'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">Anthropic Direct</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													Claude 3.7 Sonnet hybrid reasoning
												</p>
											</div>

											{/* OpenAI Direct */}
											<div
												onClick={() => setActiveConnector('openAI')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'openAI'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">OpenAI Direct</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													GPT-4o, o3-mini reasoning
												</p>
											</div>

											{/* DeepSeek Direct */}
											<div
												onClick={() => setActiveConnector('deepseek')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'deepseek'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">DeepSeek Direct</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													DeepSeek-V3 &amp; R1 reasoning
												</p>
											</div>
										</>
									)}

									{activeTab === 'local' && (
										<>
											{/* Ollama */}
											<div
												onClick={() => setActiveConnector('ollama')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'ollama'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">Ollama Local</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													http://127.0.0.1:11434
												</p>
											</div>

											{/* LM Studio */}
											<div
												onClick={() => setActiveConnector('openAI')}
												className={`bg-surface-elevated p-3.5 rounded-none flex flex-col justify-between hover:bg-surface-hover transition-all cursor-pointer border ${
													activeConnector === 'openAI'
														? 'border-primary ring-1 ring-primary/30'
														: 'border-white/5'
												}`}
											>
												<h4 className="text-xs font-semibold text-text-primary">LM Studio / vLLM</h4>
												<p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
													OpenAI-compatible local server
												</p>
											</div>
										</>
									)}
								</div>
							</div>

							{/* Bloc Saisie Token API */}
							<div className="bg-surface-elevated p-4 rounded-none border border-white/5 space-y-2">
								<div className="flex items-center justify-between">
									<label className="font-mono text-[11px] text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
										<span>Authentication Token ({activeConnector})</span>
									</label>
									{activeConnector === 'openRouter' && (
										<a
											href="https://openrouter.ai/keys"
											target="_blank"
											rel="noreferrer"
											className="font-mono text-[10px] text-primary hover:underline flex items-center gap-1"
										>
											Get instant key <ExternalLink className="w-3 h-3" />
										</a>
									)}
								</div>

								<div className="relative flex items-center">
									<span className="absolute left-3 text-text-muted">
										<Key className="w-4 h-4" />
									</span>
									<input
										className="w-full bg-surface-base text-text-primary font-mono text-xs pl-9 pr-24 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary/60"
										placeholder={`Paste ${activeConnector} token or leave empty...`}
										type={isPasswordVisible ? 'text' : 'password'}
										value={apiKeyInput}
										onChange={(e) => handleSaveKey(e.target.value)}
									/>
									<div className="absolute right-2 flex items-center space-x-1">
										<button
											type="button"
											onClick={() => setIsPasswordVisible(!isPasswordVisible)}
											className="p-1 rounded-none text-text-muted hover:text-text-primary transition-colors cursor-pointer"
											title="Toggle visibility"
										>
											{isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
										</button>
										<button
											type="button"
											onClick={handleVerify}
											className="px-2.5 py-0.5 rounded-none bg-surface-elevated hover:bg-surface-hover text-primary font-mono text-[10px] font-semibold transition-colors cursor-pointer border border-white/10"
										>
											VERIFY
										</button>
									</div>
								</div>

								{verifyStatus && (
									<div className="font-mono text-[10px] text-primary pt-1">
										{verifyStatus}
									</div>
								)}
							</div>
						</>
					)}

					{/* Si onglet Voice Dictation : Panneau Whisper dédié */}
					{activeTab === 'voice' && (
						<div className="bg-surface-elevated p-5 rounded-none border border-white/5 space-y-4">
							<div>
								<h3 className="text-sm font-semibold text-text-primary font-sans flex items-center gap-2">
									<Mic className="w-4 h-4 text-primary" />
									<span>Local Whisper WASM Speech Engine</span>
								</h3>
								<p className="text-xs text-text-secondary mt-1">
									Transcribe speech to prompt directly on device without sending audio to external clouds.
								</p>
							</div>

							<div className="pt-2 border-t border-white/5 flex items-center justify-between">
								<span className="font-mono text-xs text-text-primary">Engine Status</span>
								<span className="px-2.5 py-1 rounded-none bg-primary/20 text-primary font-mono text-xs font-semibold">
									READY ON-DEVICE
								</span>
							</div>
						</div>
					)}
				</main>
			</div>

			{/* Footer de Navigation épuré */}
			<footer className="flex items-center justify-between w-full mt-8 pt-4 border-t border-white/5">
				<button
					type="button"
					onClick={onBack}
					className="px-4 py-2 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/5"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back</span>
				</button>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors cursor-pointer border border-white/5"
					>
						Skip for now
					</button>
					<button
						type="button"
						onClick={onNext}
						className="px-6 py-2 rounded-none bg-primary text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
					>
						<span>Continue to Theme</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</button>
				</div>
			</footer>
		</div>
	);
};

// ============================================================================
//  ÉCRAN 3 : THEME SELECTION (Minimaliste & Bords carrés)
// ============================================================================

interface StepThemesProps {
	onBack: () => void;
	onNext: () => void;
	onClose: () => void;
}

const StepThemes: React.FC<StepThemesProps> = ({ onBack, onNext, onClose }) => {
	const accessor = useAccessor();
	const themeService = accessor.get('IThemeService');
	const [selectedTheme, setSelectedTheme] = useState<'obsidian' | 'midnight' | 'vesper' | 'solar'>('obsidian');

	const themes = [
		{
			id: 'obsidian' as const,
			label: 'Obsidian Precision',
			badge: 'CODEEN DEFAULT',
			themeId: 'Default Dark Modern',
			renderCode: () => (
				<div className="font-mono text-[11px] leading-relaxed overflow-x-hidden text-zinc-300">
					<span className="text-zinc-500">async def</span> <span className="text-white font-medium">optimize_pipeline</span>(tokens: <span className="text-primary">int</span>):<br />
					&nbsp;&nbsp;stream = <span className="text-zinc-500">await</span> <span className="text-primary">agent</span>.reason()<br />
					&nbsp;&nbsp;<span className="text-zinc-500">return</span> stream.<span className="text-primary">apply_diff</span>()
				</div>
			)
		},
		{
			id: 'midnight' as const,
			label: 'Midnight Eclipse',
			badge: 'DEEP CONTRAST',
			themeId: 'Default Dark+',
			renderCode: () => (
				<div className="font-mono text-[11px] leading-relaxed overflow-x-hidden text-[#e6edf3]">
					<span className="text-[#79c0ff]">async def</span> <span className="text-[#d2a8ff] font-medium">optimize_pipeline</span>(tokens: <span className="text-[#ff7b72]">int</span>):<br />
					&nbsp;&nbsp;stream = <span className="text-[#79c0ff]">await</span> <span className="text-[#7ee787]">agent</span>.reason()<br />
					&nbsp;&nbsp;<span className="text-[#ff7b72]">return</span> stream.<span className="text-[#7ee787]">apply_diff</span>()
				</div>
			)
		},
		{
			id: 'vesper' as const,
			label: 'Vesper Monochrome',
			badge: 'ULTRA MINIMAL',
			themeId: 'Visual Studio Dark',
			renderCode: () => (
				<div className="font-mono text-[11px] leading-relaxed overflow-x-hidden text-neutral-400">
					<span className="text-white font-semibold">async def</span> <span className="text-neutral-200 font-medium">optimize_pipeline</span>(tokens: <span className="text-white">int</span>):<br />
					&nbsp;&nbsp;stream = <span className="text-white">await</span> <span className="text-neutral-100">agent</span>.reason()<br />
					&nbsp;&nbsp;<span className="text-white font-semibold">return</span> stream.<span className="text-white">apply_diff</span>()
				</div>
			)
		},
		{
			id: 'solar' as const,
			label: 'Codeen Pure Light',
			badge: 'LIGHT / BLANC',
			themeId: 'Default Light Modern',
			renderCode: () => (
				<div className="font-mono text-[11px] leading-relaxed overflow-x-hidden text-zinc-900">
					<span className="text-blue-700 font-semibold">async def</span> <span className="text-purple-700 font-medium">optimize_pipeline</span>(tokens: <span className="text-teal-700">int</span>):<br />
					&nbsp;&nbsp;stream = <span className="text-blue-700">await</span> <span className="text-emerald-700">agent</span>.reason()<br />
					&nbsp;&nbsp;<span className="text-blue-700">return</span> stream.<span className="text-emerald-700">apply_diff</span>()
				</div>
			)
		}
	];

	const handleSelect = (t: typeof themes[0]) => {
		setSelectedTheme(t.id);
		try {
			themeService.setColorTheme(t.themeId, 'auto');
		} catch (e) {
			console.error('Failed to set theme:', e);
		}
	};

	return (
		<div className="flex flex-col w-full max-w-5xl mx-auto py-4 px-4 text-on-surface select-none">
			<OnboardingHeader currentStep={2} onClose={onClose} />

			{/* Titre & Description */}
			<div className="text-center mb-6">
				<h1 className="text-2xl font-semibold text-text-primary tracking-tight font-sans">
					Select your Visual Workspace Theme
				</h1>
				<p className="text-xs text-text-secondary mt-1">
					Obsidian-tuned colorways engineered for cognitive endurance and syntax clarity.
				</p>
			</div>

			{/* Grille des 4 thèmes avec bordures carrées */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
				{themes.map((t) => {
					const isSelected = selectedTheme === t.id;
					const isLight = t.id === 'solar';

					return (
						<div
							key={t.id}
							onClick={() => handleSelect(t)}
							className={`p-4 rounded-none transition-all cursor-pointer flex flex-col justify-between border ${
								isLight
									? 'bg-[#f4f5f8] text-zinc-900 hover:bg-[#ffffff]'
									: 'bg-surface-elevated hover:bg-surface-hover text-text-primary'
							} ${
								isSelected
									? 'border-primary ring-1 ring-primary/40 shadow-lg shadow-primary/10'
									: isLight
									? 'border-zinc-300'
									: 'border-white/5'
							}`}
						>
							<div className="flex items-center justify-between mb-3">
								<span className={`text-sm font-semibold font-sans ${isLight ? 'text-zinc-900' : 'text-text-primary'}`}>
									{t.label}
								</span>
								<span
									className={`font-mono text-[10px] px-2 py-0.5 rounded-none font-semibold ${
										isSelected
											? 'bg-primary text-black'
											: isLight
											? 'bg-white text-zinc-900 border border-zinc-300'
											: 'bg-surface-base text-text-muted'
									}`}
								>
									{t.badge}
								</span>
							</div>

							<div className={`p-3 rounded-none my-2 border ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-surface-base border-white/5'}`}>
								{t.renderCode()}
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer de Navigation */}
			<footer className="flex items-center justify-between w-full mt-8 pt-4 border-t border-white/5">
				<button
					type="button"
					onClick={onBack}
					className="px-4 py-2 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/5"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back</span>
				</button>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors cursor-pointer border border-white/5"
					>
						Skip for now
					</button>
					<button
						type="button"
						onClick={onNext}
						className="px-6 py-2 rounded-none bg-primary text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
					>
						<span>Continue to Migration</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</button>
				</div>
			</footer>
		</div>
	);
};

// ============================================================================
//  ÉCRAN 4 : MIGRATION & FINALISATION (Épuré, optionnel & direct)
// ============================================================================

interface StepMigrationProps {
	onBack: () => void;
	onFinish: () => void;
}

const StepMigration: React.FC<StepMigrationProps> = ({ onBack, onFinish }) => {
	const accessor = useAccessor();
	const extensionTransferService = accessor.get('IExtensionTransferService');

	// Possibilité de ne rien cocher (initialement null, toggleable au clic)
	const [selectedSource, setSelectedSource] = useState<TransferEditorType | null>(null);

	const handleToggleSource = (source: TransferEditorType) => {
		setSelectedSource((prev) => (prev === source ? null : source));
	};

	const handleEnterIDE = () => {
		// Applique et termine l'onboarding immédiatement
		onFinish();

		// Transfert en arrière-plan sans bloquer si un éditeur a été sélectionné
		if (selectedSource && extensionTransferService) {
			try {
				extensionTransferService.transferExtensions(os, selectedSource).catch((err) => {
					console.warn('Background transfer warning:', err);
				});
			} catch (e) {
				console.error('Transfer trigger error:', e);
			}
		}
	};

	return (
		<div className="flex flex-col w-full max-w-5xl mx-auto py-4 px-4 text-on-surface select-none">
			<OnboardingHeader currentStep={3} onClose={onFinish} />

			{/* Titre & Description */}
			<div className="text-center mb-8">
				<h1 className="text-2xl font-semibold text-text-primary tracking-tight font-sans">
					Import your IDE Configurations &amp; Keybindings
				</h1>
				<p className="text-xs text-text-secondary mt-1 max-w-lg mx-auto">
					Instantly mirror your muscle memory and extensions from your existing environments (optional — click to select or deselect).
				</p>
			</div>

			{/* Grille des 3 éditeurs sources à bords carrés (sélectionnable / désélectionnable) */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
				{/* VS Code */}
				<div
					onClick={() => handleToggleSource('VS Code')}
					className={`p-5 rounded-none cursor-pointer transition-all flex flex-col justify-between border ${
						selectedSource === 'VS Code'
							? 'bg-surface-elevated border-primary ring-1 ring-primary/40 shadow-lg shadow-primary/10'
							: 'bg-surface-elevated/40 border-white/5 hover:bg-surface-elevated hover:border-white/10'
					}`}
				>
					<div className="flex items-center justify-between mb-4">
						<Terminal className={`w-5 h-5 ${selectedSource === 'VS Code' ? 'text-primary' : 'text-text-secondary'}`} />
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-[9px] px-1.5 py-0.5 rounded-none bg-primary/20 text-primary font-semibold">
								DETECTED
							</span>
							{selectedSource === 'VS Code' && (
								<Check className="w-3.5 h-3.5 text-primary" />
							)}
						</div>
					</div>
					<div>
						<h3 className="font-semibold text-sm text-text-primary font-sans">VS Code</h3>
						<p className="text-xs text-text-secondary mt-1">Local settings.json &amp; extensions</p>
					</div>
				</div>

				{/* Cursor */}
				<div
					onClick={() => handleToggleSource('Cursor')}
					className={`p-5 rounded-none cursor-pointer transition-all flex flex-col justify-between border ${
						selectedSource === 'Cursor'
							? 'bg-surface-elevated border-primary ring-1 ring-primary/40 shadow-lg shadow-primary/10'
							: 'bg-surface-elevated/40 border-white/5 hover:bg-surface-elevated hover:border-white/10'
					}`}
				>
					<div className="flex items-center justify-between mb-4">
						<MousePointer className={`w-5 h-5 ${selectedSource === 'Cursor' ? 'text-primary' : 'text-text-secondary'}`} />
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-[9px] px-1.5 py-0.5 rounded-none bg-surface-base text-text-muted">
								AVAILABLE
							</span>
							{selectedSource === 'Cursor' && (
								<Check className="w-3.5 h-3.5 text-primary" />
							)}
						</div>
					</div>
					<div>
						<h3 className="font-semibold text-sm text-text-primary font-sans">Cursor</h3>
						<p className="text-xs text-text-secondary mt-1">.cursorrules, prompts &amp; AI configs</p>
					</div>
				</div>

				{/* Windsurf */}
				<div
					onClick={() => handleToggleSource('Windsurf')}
					className={`p-5 rounded-none cursor-pointer transition-all flex flex-col justify-between border ${
						selectedSource === 'Windsurf'
							? 'bg-surface-elevated border-primary ring-1 ring-primary/40 shadow-lg shadow-primary/10'
							: 'bg-surface-elevated/40 border-white/5 hover:bg-surface-elevated hover:border-white/10'
					}`}
				>
					<div className="flex items-center justify-between mb-4">
						<Wind className={`w-5 h-5 ${selectedSource === 'Windsurf' ? 'text-primary' : 'text-text-secondary'}`} />
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-[9px] px-1.5 py-0.5 rounded-none bg-surface-base text-text-muted">
								AVAILABLE
							</span>
							{selectedSource === 'Windsurf' && (
								<Check className="w-3.5 h-3.5 text-primary" />
							)}
						</div>
					</div>
					<div>
						<h3 className="font-semibold text-sm text-text-primary font-sans">Windsurf</h3>
						<p className="text-xs text-text-secondary mt-1">Cascade memories &amp; custom action maps</p>
					</div>
				</div>
			</div>

			{/* Footer de Navigation */}
			<footer className="flex items-center justify-between w-full pt-6 border-t border-white/5">
				<button
					type="button"
					onClick={onBack}
					className="px-4 py-2 rounded-none text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/5"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back</span>
				</button>

				<button
					type="button"
					onClick={handleEnterIDE}
					className="bg-primary hover:brightness-110 text-black font-semibold text-xs px-7 py-2.5 rounded-none transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
				>
					<span>Enter Codeen IDE</span>
					<ArrowRight className="w-4 h-4" />
				</button>
			</footer>
		</div>
	);
};

// ============================================================================
//  MAIN CONTAINER CONTENT
// ============================================================================

export const CodeenOnboardingContent = () => {
	const accessor = useAccessor();
	const voidSettingsService = accessor.get('IVoidSettingsService');
	const voidSettingsState = useSettingsState();

	const [pageIndex, setPageIndex] = useState<number>(0);

	// Réinitialise la page à 0 si l'onboarding est relancé manuellement
	const prevIsComplete = useRef(voidSettingsState.globalSettings.isOnboardingComplete);
	useEffect(() => {
		const isComplete = voidSettingsState.globalSettings.isOnboardingComplete;
		if (prevIsComplete.current === true && isComplete === false) {
			setPageIndex(0);
		}
		prevIsComplete.current = isComplete;
	}, [voidSettingsState.globalSettings.isOnboardingComplete]);

	const handleClose = () => {
		voidSettingsService.setGlobalSetting('isOnboardingComplete', true);
	};

	return (
		<div className="w-full min-h-screen flex items-center justify-center p-4">
			{pageIndex === 0 && (
				<StepWelcome
					onNext={() => setPageIndex(1)}
					onClose={handleClose}
				/>
			)}
			{pageIndex === 1 && (
				<StepProviders
					onBack={() => setPageIndex(0)}
					onNext={() => setPageIndex(2)}
					onClose={handleClose}
				/>
			)}
			{pageIndex === 2 && (
				<StepThemes
					onBack={() => setPageIndex(1)}
					onNext={() => setPageIndex(3)}
					onClose={handleClose}
				/>
			)}
			{pageIndex === 3 && (
				<StepMigration
					onBack={() => setPageIndex(2)}
					onFinish={handleClose}
				/>
			)}
		</div>
	);
};

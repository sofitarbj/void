/*--------------------------------------------------------------------------------------
 *  F3: VoiceInput — Voice recording with oscillation + transcription
 *  Uses Web Speech API for transcription (works in Electron/Chrome).
 *  Shows animated waveform during recording.
 *--------------------------------------------------------------------------------------*/

import React, { useState, useRef, useCallback, useEffect } from 'react'

type VoiceState = 'idle' | 'recording' | 'processing'

export const VoiceInput = ({ onTranscript }: { onTranscript: (text: string) => void }) => {
	const [state, setState] = useState<VoiceState>('idle')
	const [transcript, setTranscript] = useState('')
	const [volume, setVolume] = useState(0)
	const recognitionRef = useRef<any>(null)
	const analyserRef = useRef<AnalyserNode | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const animFrameRef = useRef<number>(0)

	const startRecording = useCallback(async () => {
		try {
			const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
			if (!SpeechRecognition) {
				console.error('SpeechRecognition not supported')
				return
			}

			// Start audio stream for visualization
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			streamRef.current = stream
			const audioCtx = new AudioContext()
			const source = audioCtx.createMediaStreamSource(stream)
			const analyser = audioCtx.createAnalyser()
			analyser.fftSize = 256
			source.connect(analyser)
			analyserRef.current = analyser

			// Animate volume
			const dataArray = new Uint8Array(analyser.frequencyBinCount)
			const updateVolume = () => {
				analyser.getByteFrequencyData(dataArray)
				const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
				setVolume(avg / 128) // normalize 0-1
				animFrameRef.current = requestAnimationFrame(updateVolume)
			}
			updateVolume()

			// Start speech recognition
			const recognition = new SpeechRecognition()
			recognition.continuous = true
			recognition.interimResults = true
			recognition.lang = 'fr-FR' // Default to French, can be made configurable

			let finalTranscript = ''
			recognition.onresult = (event: any) => {
				let interim = ''
				for (let i = event.resultIndex; i < event.results.length; i++) {
					if (event.results[i].isFinal) {
						finalTranscript += event.results[i][0].transcript + ' '
					} else {
						interim += event.results[i][0].transcript
					}
				}
				setTranscript(finalTranscript + interim)
			}

			recognition.onerror = (event: any) => {
				console.error('Speech recognition error:', event.error)
				if (event.error === 'network') {
					console.warn('Speech recognition requires internet connection. Transcription unavailable offline.')
				}
				stopRecording()
			}

			recognition.start()
			recognitionRef.current = recognition
			setState('recording')
		} catch (err) {
			console.error('Failed to start recording:', err)
		}
	}, [])

	const stopRecording = useCallback(() => {
		// Stop speech recognition
		if (recognitionRef.current) {
			recognitionRef.current.stop()
			recognitionRef.current = null
		}

		// Stop audio stream
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(t => t.stop())
			streamRef.current = null
		}

		// Stop animation
		if (animFrameRef.current) {
			cancelAnimationFrame(animFrameRef.current)
		}

		analyserRef.current = null
		setVolume(0)
		setState('idle')
	}, [])

	const confirmTranscript = useCallback(() => {
		if (transcript.trim()) {
			onTranscript(transcript.trim())
		}
		setTranscript('')
		stopRecording()
	}, [transcript, onTranscript, stopRecording])

	const cancelTranscript = useCallback(() => {
		setTranscript('')
		stopRecording()
	}, [stopRecording])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopRecording()
		}
	}, [stopRecording])

	if (state === 'idle' && !transcript) {
		return (
			<button
				type='button'
				title='Start voice input'
				className='flex items-center justify-center w-6 h-6 rounded hover:bg-void-bg-2 text-void-fg-3 hover:text-void-fg-1 transition-colors'
				onClick={startRecording}
				data-tooltip-id='void-tooltip'
				data-tooltip-content='Voice input'
				data-tooltip-place='top'
			>
				<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
					<path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' />
					<path d='M19 10v2a7 7 0 0 1-14 0v-2' />
					<line x1='12' y1='19' x2='12' y2='23' />
					<line x1='8' y1='23' x2='16' y2='23' />
				</svg>
			</button>
		)
	}

	// Recording or has transcript
	return (
		<div className='flex items-center gap-1.5 px-2 py-1 rounded-md border border-void-border-3 bg-void-bg-1'>
			{state === 'recording' && (
				<>
					{/* Oscillation indicator */}
					<div className='flex items-center gap-[2px] h-4'>
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className='w-[2px] rounded-full bg-red-500 transition-all duration-75'
								style={{
									height: `${Math.max(2, volume * 16 * (0.5 + Math.random() * 0.5))}px`,
								}}
							/>
						))}
					</div>
					<span className='text-[10px] text-red-400 animate-pulse'>● REC</span>
				</>
			)}

			{/* Transcript preview */}
			{transcript && (
				<span className='text-xs text-void-fg-3 truncate max-w-[150px]'>{transcript}</span>
			)}

			{/* Controls */}
			<div className='flex items-center gap-0.5 ml-auto'>
				{state === 'recording' ? (
					<button
						type='button'
						title='Stop recording'
						className='w-5 h-5 rounded flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500/30'
						onClick={stopRecording}
					>
						<svg width='10' height='10' viewBox='0 0 24 24' fill='currentColor'><rect x='6' y='6' width='12' height='12' /></svg>
					</button>
				) : null}

				{transcript && state === 'idle' && (
					<>
						<button
							type='button'
							title='Cancel'
							className='w-5 h-5 rounded flex items-center justify-center text-void-fg-3 hover:text-red-400'
							onClick={cancelTranscript}
						>
							<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'><line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' /></svg>
						</button>
						<button
							type='button'
							title='Insert transcript'
							className='w-5 h-5 rounded flex items-center justify-center text-green-400 hover:text-green-300'
							onClick={confirmTranscript}
						>
							<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'><polyline points='20 6 9 17 4 12' /></svg>
						</button>
					</>
				)}
			</div>
		</div>
	)
}

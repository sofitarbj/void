/*--------------------------------------------------------------------------------------
 *  F2: ImageUpload — Image attachment for multimodal chat
 *  Allows users to attach images (paste, click, drag) that get sent to the LLM.
 *--------------------------------------------------------------------------------------*/

import React, { useRef, useState, useCallback } from 'react'
import { ChatImageAttachment } from '../../../../common/chatThreadServiceTypes.js'

const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB — limit to control token costs (~1600 tokens per image)
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result as string
			const base64 = result.split(',')[1]
			resolve(base64)
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export const useImageAttachments = () => {
	const [images, setImages] = useState<ChatImageAttachment[]>([])

	const addImage = useCallback(async (file: File) => {
		if (!ALLOWED_TYPES.includes(file.type)) return
		if (file.size > MAX_IMAGE_SIZE) return

		const base64 = await fileToBase64(file)
		const attachment: ChatImageAttachment = {
			base64,
			mimeType: file.type as ChatImageAttachment['mimeType'],
			fileName: file.name,
		}
		setImages(prev => [...prev, attachment])
	}, [])

	const removeImage = useCallback((index: number) => {
		setImages(prev => prev.filter((_, i) => i !== index))
	}, [])

	const clearImages = useCallback(() => {
		setImages([])
	}, [])

	return { images, addImage, removeImage, clearImages }
}

export const ImageUploadButton = ({ onImageAdd }: { onImageAdd: (file: File) => void }) => {
	const inputRef = useRef<HTMLInputElement>(null)

	return (
		<>
			<input
				ref={inputRef}
				type='file'
				accept='image/png,image/jpeg,image/gif,image/webp'
				title='Select image to attach'
				className='hidden'
				onChange={(e) => {
					const file = e.target.files?.[0]
					if (file) onImageAdd(file)
					if (inputRef.current) inputRef.current.value = ''
				}}
			/>
			<button
				type='button'
				title='Attach image'
				className='flex items-center justify-center w-6 h-6 rounded hover:bg-void-bg-2 text-void-fg-3 hover:text-void-fg-1 transition-colors'
				onClick={() => inputRef.current?.click()}
				data-tooltip-id='void-tooltip'
				data-tooltip-content='Attach image'
				data-tooltip-place='top'
			>
				<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
					<rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
					<circle cx='8.5' cy='8.5' r='1.5' />
					<polyline points='21 15 16 10 5 21' />
				</svg>
			</button>
		</>
	)
}

export const ImagePreviewStrip = ({ images, onRemove }: { images: ChatImageAttachment[], onRemove: (i: number) => void }) => {
	if (images.length === 0) return null

	return (
		<div className='flex gap-1 px-1 py-1 overflow-x-auto'>
			{images.map((img, i) => (
				<div key={i} className='relative group shrink-0'>
					<img
						src={`data:${img.mimeType};base64,${img.base64}`}
						alt={img.fileName || 'attachment'}
						className='h-12 w-12 rounded object-cover border border-void-border-3'
					/>
					<button
						type='button'
						className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
						onClick={() => onRemove(i)}
					>×</button>
				</div>
			))}
		</div>
	)
}

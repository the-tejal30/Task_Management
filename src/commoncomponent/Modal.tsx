'use client'
import React, { useEffect, useRef } from 'react'
import { XIcon } from 'icons'

export const ModalSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const
export type ModalSize = typeof ModalSize[keyof typeof ModalSize]

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={[
          'w-full rounded-xl bg-white dark:bg-black-700',
          'shadow-2xl border border-white-300 dark:border-black-500',
          sizeClasses[size],
          'animate-modal-in',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white-300 dark:border-black-500">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-black-300 dark:text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-400 hover:bg-white-300 dark:hover:bg-black-500 dark:hover:text-white-400 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

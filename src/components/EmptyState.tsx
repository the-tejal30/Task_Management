import type { ReactNode } from 'react'
import Button from 'commoncomponent/Button'
import { ClipboardIcon } from 'icons'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export default function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="mb-4 text-gray-200 dark:text-gray-400">{icon}</div>
      ) : (
        <div className="mb-4 w-16 h-16 rounded-full bg-white-300 dark:bg-black-500 flex items-center justify-center">
          <ClipboardIcon className="w-8 h-8 text-gray-300 dark:text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-black-300 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-300 dark:text-gray-200 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touched?: boolean
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, touched, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const hasError = touched && error

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-black-300 dark:text-white-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'block w-full rounded-lg border px-3 py-2.5 text-sm',
            'bg-white dark:bg-black-700',
            'text-black-300 dark:text-white',
            'placeholder-gray-300 dark:placeholder-gray-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            hasError
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
              : 'border-white-300 dark:border-black-400 focus:border-primary-300 focus:ring-primary-200',
            'disabled:opacity-50 disabled:bg-white-200 dark:disabled:bg-black-600',
            className,
          ].join(' ')}
          {...props}
        />
        {hasError && (
          <span className="text-xs text-red-300" role="alert">{error}</span>
        )}
        {hint && !hasError && (
          <span className="text-xs text-gray-300 dark:text-gray-400">{hint}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

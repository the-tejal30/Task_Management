import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SpinnerIcon } from 'icons'

export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
  Danger: 'danger',
  Ghost: 'ghost',
} as const
export type ButtonVariant = typeof ButtonVariant[keyof typeof ButtonVariant]

export const ButtonSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const
export type ButtonSize = typeof ButtonSize[keyof typeof ButtonSize]

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-300 hover:bg-primary-400 text-white border border-transparent focus:ring-primary-200',
  secondary: 'bg-white hover:bg-white-200 text-black-300 border border-white-300 dark:bg-black-500 dark:hover:bg-black-400 dark:text-white dark:border-black-400 focus:ring-white-400',
  danger: 'bg-red-300 hover:bg-red-400 text-white border border-transparent focus:ring-red-200',
  ghost: 'bg-transparent hover:bg-white-300 text-gray-300 border border-transparent dark:hover:bg-black-500 dark:text-gray-200 focus:ring-white-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <SpinnerIcon className="animate-spin h-4 w-4" />}
      {children}
    </button>
  )
}

'use client'

interface Option<T extends string = string> {
  value: T
  label: string
}

interface DropdownProps<T extends string = string> {
  label?: string
  id?: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  error?: string
  touched?: boolean
  placeholder?: string
  disabled?: boolean
}

export default function Dropdown<T extends string = string>({
  label,
  id,
  value,
  options,
  onChange,
  error,
  touched,
  placeholder = 'Select an option',
  disabled = false,
}: DropdownProps<T>) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = touched && error

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-black-300 dark:text-white-400">
          {label}
        </label>
      )}
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className={[
          'block w-full rounded-lg border px-3 py-2.5 text-sm',
          'bg-white dark:bg-black-700',
          'text-black-300 dark:text-white',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
            : 'border-white-300 dark:border-black-400 focus:border-primary-300 focus:ring-primary-200',
        ].join(' ')}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span className="text-xs text-red-300" role="alert">{error}</span>
      )}
    </div>
  )
}

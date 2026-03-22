'use client'
import { useAuth } from 'hooks/useAuth'
import Button from 'commoncomponent/Button'
import { ClipboardCheckIcon, SunIcon, MoonIcon, LogoutIcon } from 'icons'

interface NavbarProps {
  darkMode: boolean
  onToggleDark: () => void
}

export default function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white-300 dark:border-black-500 bg-white/80 dark:bg-black-800/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-300 flex items-center justify-center">
            <ClipboardCheckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-black-300 dark:text-white tracking-tight">
            TaskFlow
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-300 dark:text-gray-200">
            {user?.username}
          </span>

          <button
            onClick={onToggleDark}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-gray-300 hover:text-black-300 hover:bg-white-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-black-500 transition-colors"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          <Button variant="secondary" size="sm" onClick={logout}>
            <LogoutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { AppRootState } from 'store/index'
import Navbar from 'components/Navbar'
import Dashboard from 'pages/Dashboard'
import { storage } from 'utils/storage'
import { Theme } from 'types/index'

export default function App() {
  const router = useRouter()
  const isAuthenticated = useSelector((state: AppRootState) => state.auth.isAuthenticated)
  const [darkMode, setDarkMode] = useState(() => storage.getTheme() === Theme.Dark)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    storage.setTheme(darkMode ? Theme.Dark : Theme.Light)
  }, [darkMode])

  if (!isAuthenticated) return null

  return (
    <>
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(prev => !prev)} />
      <Dashboard />
    </>
  )
}

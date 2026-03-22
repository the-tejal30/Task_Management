import { Theme } from 'types/index'

const TOKEN_KEY = 'task_manager_token'
const USER_KEY = 'task_manager_user'
const THEME_KEY = 'task_manager_theme'

const ls = () => (typeof window !== 'undefined' ? window.localStorage : null)

export const storage = {
  getToken(): string | null {
    return ls()?.getItem(TOKEN_KEY) ?? null
  },

  setToken(token: string): void {
    ls()?.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    ls()?.removeItem(TOKEN_KEY)
  },

  getUser(): { username: string } | null {
    const raw = ls()?.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as { username: string }
    } catch {
      return null
    }
  },

  setUser(user: { username: string }): void {
    ls()?.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    ls()?.removeItem(USER_KEY)
  },

  getTheme(): Theme {
    return (ls()?.getItem(THEME_KEY) as Theme) ?? Theme.Light
  },

  setTheme(theme: Theme): void {
    ls()?.setItem(THEME_KEY, theme)
  },

  clearAll(): void {
    ls()?.removeItem(TOKEN_KEY)
    ls()?.removeItem(USER_KEY)
  },
}

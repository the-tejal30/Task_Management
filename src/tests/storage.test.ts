import { storage } from 'utils/storage'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('token', () => {
    it('returns null when no token stored', () => {
      expect(storage.getToken()).toBeNull()
    })

    it('stores and retrieves token', () => {
      storage.setToken('my-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('task_manager_token', 'my-token')
    })

    it('removes token', () => {
      storage.removeToken()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('task_manager_token')
    })
  })

  describe('user', () => {
    it('returns null when no user stored', () => {
      expect(storage.getUser()).toBeNull()
    })

    it('stores and retrieves user', () => {
      storage.setUser({ username: 'test' })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'task_manager_user',
        JSON.stringify({ username: 'test' })
      )
    })

    it('removes user', () => {
      storage.removeUser()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('task_manager_user')
    })

    it('returns parsed user when valid JSON is stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ username: 'alice' }))
      const user = storage.getUser()
      expect(user).toEqual({ username: 'alice' })
    })

    it('returns null when stored value is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('not-json}}}')
      const user = storage.getUser()
      expect(user).toBeNull()
    })
  })

  describe('theme', () => {
    it('returns light when nothing stored', () => {
      expect(storage.getTheme()).toBe('light')
    })

    it('returns stored theme', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark')
      expect(storage.getTheme()).toBe('dark')
    })

    it('sets theme', () => {
      storage.setTheme('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('task_manager_theme', 'dark')
    })
  })

  describe('clearAll', () => {
    it('removes token and user', () => {
      storage.clearAll()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('task_manager_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('task_manager_user')
    })
  })
})

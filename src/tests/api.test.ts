jest.mock('utils/storage', () => ({
  storage: {
    getToken: jest.fn(),
    clearAll: jest.fn(),
  },
}))

import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { storage } from 'utils/storage'
import api from 'services/api'

interface InterceptorHandler<V> {
  fulfilled: (value: V) => V | Promise<V>
  rejected: (error: unknown) => unknown
}

interface InterceptorManagerInternal<V> {
  handlers: InterceptorHandler<V>[]
}

describe('api interceptors', () => {
  const mockStorage = storage as jest.Mocked<typeof storage>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token exists', () => {
      mockStorage.getToken.mockReturnValueOnce('test-token')
      const { handlers } = api.interceptors.request as unknown as InterceptorManagerInternal<InternalAxiosRequestConfig>
      const requestFn = handlers[0].fulfilled
      const config = { headers: {} as Record<string, string> } as InternalAxiosRequestConfig
      const result = requestFn(config) as InternalAxiosRequestConfig & { headers: Record<string, string> }
      expect(result.headers['Authorization']).toBe('Bearer test-token')
    })

    it('does not add Authorization header when no token', () => {
      mockStorage.getToken.mockReturnValueOnce(null)
      const { handlers } = api.interceptors.request as unknown as InterceptorManagerInternal<InternalAxiosRequestConfig>
      const requestFn = handlers[0].fulfilled
      const config = { headers: {} as Record<string, string> } as InternalAxiosRequestConfig
      const result = requestFn(config) as InternalAxiosRequestConfig & { headers: Record<string, string> }
      expect(result.headers['Authorization']).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('passes through successful responses', () => {
      const { handlers } = api.interceptors.response as unknown as InterceptorManagerInternal<AxiosResponse>
      const successFn = handlers[0].fulfilled
      const response = { status: 200, data: 'ok' } as AxiosResponse
      expect(successFn(response)).toBe(response)
    })

    it('clears storage and rejects on 401 error', async () => {
      const { handlers } = api.interceptors.response as unknown as InterceptorManagerInternal<AxiosResponse>
      const errorFn = handlers[0].rejected
      const error = { response: { status: 401 } }
      await expect(errorFn(error)).rejects.toEqual(error)
      expect(mockStorage.clearAll).toHaveBeenCalledTimes(1)
    })

    it('rejects non-401 errors without clearing storage', async () => {
      jest.clearAllMocks()
      const { handlers } = api.interceptors.response as unknown as InterceptorManagerInternal<AxiosResponse>
      const errorFn = handlers[0].rejected
      const error = { response: { status: 500, data: 'Server error' } }
      await expect(errorFn(error)).rejects.toEqual(error)
      expect(mockStorage.clearAll).not.toHaveBeenCalled()
    })

    it('rejects errors with no response without clearing storage', async () => {
      jest.clearAllMocks()
      const { handlers } = api.interceptors.response as unknown as InterceptorManagerInternal<AxiosResponse>
      const errorFn = handlers[0].rejected
      const error = new Error('Network Error')
      await expect(errorFn(error)).rejects.toEqual(error)
      expect(mockStorage.clearAll).not.toHaveBeenCalled()
    })
  })
})

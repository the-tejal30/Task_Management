export const AUTH_ENDPOINTS = {
  login: '/login',
} as const

export const TASK_ENDPOINTS = {
  getAll: '/tasks',
  create: '/tasks',
  update: (id: string) => `/tasks/${id}`,
  remove: (id: string) => `/tasks/${id}`,
} as const

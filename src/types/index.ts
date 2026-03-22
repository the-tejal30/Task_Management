export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in-progress',
  Done: 'done',
} as const
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

export const Theme = {
  Light: 'light',
  Dark: 'dark',
} as const
export type Theme = typeof Theme[keyof typeof Theme]

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskCreatePayload {
  title: string
  description: string
  status: TaskStatus
}

export interface TaskUpdatePayload {
  id: string
  title: string
  description: string
  status: TaskStatus
}

export interface User {
  username: string
  token: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    username: string
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  submitting: boolean
}

export interface RootState {
  auth: AuthState
  tasks: TasksState
}

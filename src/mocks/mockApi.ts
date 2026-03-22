import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import api from 'services/api'
import { TaskStatus } from 'types/index'
import type { Task, LoginPayload, TaskCreatePayload, TaskUpdatePayload } from 'types/index'

const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE2MDAwMDAwMDB9.fake-signature'

let tasks: Task[] = [
  {
    id: '1',
    title: 'Set up project structure',
    description: 'Initialize the React + TypeScript + Next.js project with all dependencies.',
    status: TaskStatus.Done,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    title: 'Implement authentication flow',
    description: 'Create login page, auth guards, and JWT handling with Redux Toolkit.',
    status: TaskStatus.InProgress,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Build task dashboard',
    description: 'Design and implement the main dashboard with task cards, filtering, and CRUD operations.',
    status: TaskStatus.Todo,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

let nextId = 4

function parse(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data
}

function buildResponse(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: '', headers: {}, config }
}

function buildError(config: InternalAxiosRequestConfig, message: string, status: number): AxiosError {
  const response = buildResponse(config, { message }, status)
  return new AxiosError(message, String(status), config, null, response)
}

export function setupMockApi(): void {
  api.defaults.adapter = (config: InternalAxiosRequestConfig) =>
    new Promise((resolve, reject) => {
      const method = config.method?.toLowerCase()
      const url = config.url ?? ''
      const auth = (config.headers?.Authorization as string) ?? ''
      const isAuthed = auth.startsWith('Bearer ')
      const body = parse(config.data)

      if (method === 'post' && url === '/login') {
        const { username, password } = body as LoginPayload
        if (username === 'test' && password === 'test123') {
          return resolve(buildResponse(config, { token: FAKE_TOKEN, user: { username } }))
        }
        return reject(buildError(config, 'Invalid credentials', 401))
      }

      if (!isAuthed) {
        return reject(buildError(config, 'Unauthorized', 401))
      }

      if (method === 'get' && url === '/tasks') {
        return resolve(buildResponse(config, tasks))
      }

      if (method === 'post' && url === '/tasks') {
        const { title, description, status } = body as TaskCreatePayload
        const now = new Date().toISOString()
        const newTask: Task = { id: String(nextId++), title, description, status, createdAt: now, updatedAt: now }
        tasks = [...tasks, newTask]
        return resolve(buildResponse(config, newTask, 201))
      }

      const taskMatch = url.match(/^\/tasks\/(.+)$/)
      if (taskMatch) {
        const id = taskMatch[1]!

        if (method === 'put') {
          const { title, description, status } = body as TaskUpdatePayload
          const idx = tasks.findIndex((t) => t.id === id)
          if (idx === -1) return reject(buildError(config, 'Task not found', 404))
          const updated: Task = { ...tasks[idx]!, title, description, status, updatedAt: new Date().toISOString() }
          tasks = tasks.map((t) => (t.id === id ? updated : t))
          return resolve(buildResponse(config, updated))
        }

        if (method === 'delete') {
          if (!tasks.some((t) => t.id === id)) return reject(buildError(config, 'Task not found', 404))
          tasks = tasks.filter((t) => t.id !== id)
          return resolve(buildResponse(config, null, 204))
        }
      }

      reject(buildError(config, 'Not Found', 404))
    })
}

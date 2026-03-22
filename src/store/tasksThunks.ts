import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Task, TaskCreatePayload, TaskUpdatePayload } from 'types/index'
import api from 'services/api'
import { TASK_ENDPOINTS } from 'services/endpoints'

type ApiError = { response?: { data?: { message?: string } } }

const getMsg = (error: ApiError, fallback: string) =>
  error.response?.data?.message ?? fallback

export const fetchTasks = createAsyncThunk<Task[]>(
  'tasks/fetchAll',
  (_, { rejectWithValue }) =>
    api.get<Task[]>(TASK_ENDPOINTS.getAll)
      .then(res => res.data)
      .catch((err: ApiError) => rejectWithValue(getMsg(err, 'Failed to fetch tasks')))
)

export const createTask = createAsyncThunk<Task, TaskCreatePayload>(
  'tasks/create',
  (payload, { rejectWithValue }) =>
    api.post<Task>(TASK_ENDPOINTS.create, payload)
      .then(res => res.data)
      .catch((err: ApiError) => rejectWithValue(getMsg(err, 'Failed to create task')))
)

export const updateTask = createAsyncThunk<Task, TaskUpdatePayload>(
  'tasks/update',
  ({ id, ...data }, { rejectWithValue }) =>
    api.put<Task>(TASK_ENDPOINTS.update(id), data)
      .then(res => res.data)
      .catch((err: ApiError) => rejectWithValue(getMsg(err, 'Failed to update task')))
)

export const deleteTask = createAsyncThunk<string, string>(
  'tasks/delete',
  (id, { rejectWithValue }) =>
    api.delete(TASK_ENDPOINTS.remove(id))
      .then(() => id)
      .catch((err: ApiError) => rejectWithValue(getMsg(err, 'Failed to delete task')))
)

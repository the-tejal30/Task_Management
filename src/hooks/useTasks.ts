import { useSelector, useDispatch } from 'react-redux'
import type { AppRootState, AppDispatch } from 'store/index'
import { fetchTasks, createTask, updateTask, deleteTask, clearTasksError } from 'store/tasksSlice'
import type { TaskCreatePayload, TaskUpdatePayload } from 'types/index'

export function useTasks() {
  const dispatch = useDispatch<AppDispatch>()
  const tasks = useSelector((state: AppRootState) => state.tasks)

  return {
    tasks: tasks.tasks,
    loading: tasks.loading,
    error: tasks.error,
    submitting: tasks.submitting,
    loadTasks: () => dispatch(fetchTasks()),
    addTask: (payload: TaskCreatePayload) => dispatch(createTask(payload)),
    editTask: (payload: TaskUpdatePayload) => dispatch(updateTask(payload)),
    removeTask: (id: string) => dispatch(deleteTask(id)),
    clearError: () => dispatch(clearTasksError()),
  }
}

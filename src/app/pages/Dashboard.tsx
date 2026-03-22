'use client'
import { useEffect, useState, useCallback } from 'react'
import { useTasks } from 'hooks/useTasks'
import { TaskStatus } from 'types/index'
import type { Task, TaskCreatePayload, TaskUpdatePayload } from 'types/index'
import TaskCard from 'components/TaskCard'
import TaskForm from 'components/TaskForm'
import EmptyState from 'components/EmptyState'
import Modal from 'commoncomponent/Modal'
import Button from 'commoncomponent/Button'
import { PlusIcon, SearchIcon, ErrorCircleIcon, XIcon } from 'icons'

const FilterStatus = {
  All: 'all',
  Todo: TaskStatus.Todo,
  InProgress: TaskStatus.InProgress,
  Done: TaskStatus.Done,
} as const
type FilterStatus = typeof FilterStatus[keyof typeof FilterStatus]

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: FilterStatus.All, label: 'All' },
  { value: FilterStatus.Todo, label: 'To Do' },
  { value: FilterStatus.InProgress, label: 'In Progress' },
  { value: FilterStatus.Done, label: 'Done' },
]

export default function Dashboard() {
  const { tasks, loading, error, submitting, loadTasks, addTask, editTask, removeTask, clearError } = useTasks()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.All)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const handleOpenCreate = useCallback(() => {
    setEditingTask(null)
    setIsFormOpen(true)
  }, [])

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }, [])

  const handleOpenDelete = useCallback((task: Task) => {
    setDeletingTask(task)
    setIsDeleteOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingTask(null)
  }, [])

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false)
    setDeletingTask(null)
  }, [])

  const handleFormSubmit = async (values: TaskCreatePayload | TaskUpdatePayload) => {
    if (editingTask) {
      await editTask(values as TaskUpdatePayload)
    } else {
      await addTask(values as TaskCreatePayload)
    }
    handleCloseForm()
  }

  const handleConfirmDelete = async () => {
    await removeTask(deletingTask!.id)
    handleCloseDelete()
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === FilterStatus.All || task.status === filterStatus
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const taskCounts: Record<FilterStatus, number> = {
    [FilterStatus.All]: tasks.length,
    [FilterStatus.Todo]: tasks.filter((t) => t.status === TaskStatus.Todo).length,
    [FilterStatus.InProgress]: tasks.filter((t) => t.status === TaskStatus.InProgress).length,
    [FilterStatus.Done]: tasks.filter((t) => t.status === TaskStatus.Done).length,
  }

  return (
    <div className="min-h-screen bg-white-200 dark:bg-black-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black-300 dark:text-white">Tasks</h1>
            <p className="text-sm text-gray-300 dark:text-gray-200 mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            <PlusIcon className="w-4 h-4" />
            New Task
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white-300 dark:border-black-400 bg-white dark:bg-black-700 text-black-300 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  filterStatus === option.value
                    ? 'bg-primary-300 text-white'
                    : 'bg-white dark:bg-black-700 text-gray-300 dark:text-gray-200 border border-white-300 dark:border-black-400 hover:bg-white-200 dark:hover:bg-black-600',
                ].join(' ')}
              >
                {option.label}
                <span className={[
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
                  filterStatus === option.value
                    ? 'bg-primary-400 text-white'
                    : 'bg-white-300 dark:bg-black-500 text-gray-300 dark:text-gray-200',
                ].join(' ')}>
                  {taskCounts[option.value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red dark:bg-red-900 border border-red-200 dark:border-red-800 px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ErrorCircleIcon className="w-4 h-4 text-red-300 shrink-0" />
              <p className="text-sm text-red-400 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-400 transition-colors"
              aria-label="Dismiss error"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white-300 dark:border-black-500 bg-white dark:bg-black-700 p-5 space-y-3">
                <div className="h-4 bg-white-300 dark:bg-black-500 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-white-200 dark:bg-black-500 rounded animate-pulse w-full" />
                <div className="h-3 bg-white-200 dark:bg-black-500 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title={searchQuery || filterStatus !== FilterStatus.All ? 'No matching tasks' : 'No tasks yet'}
            description={
              searchQuery || filterStatus !== FilterStatus.All
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Create your first task to get started tracking your work.'
            }
            actionLabel={!searchQuery && filterStatus === FilterStatus.All ? 'Create Task' : undefined}
            onAction={!searchQuery && filterStatus === FilterStatus.All ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        size="md"
      >
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          submitting={submitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        title="Delete Task"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-300 dark:text-gray-200">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-black-300 dark:text-white">
              "{deletingTask?.title}"
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleCloseDelete} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={submitting}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

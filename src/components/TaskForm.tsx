'use client'
import { useEffect, useState } from 'react'
import { TaskStatus } from 'types/index'
import type { Task, TaskCreatePayload, TaskUpdatePayload } from 'types/index'
import Input from 'commoncomponent/Input'
import Button from 'commoncomponent/Button'
import Dropdown from 'commoncomponent/Dropdown'

interface TaskFormProps {
  initialTask?: Task | null
  onSubmit: (values: TaskCreatePayload | TaskUpdatePayload) => Promise<void>
  onCancel: () => void
  submitting: boolean
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: TaskStatus.Todo, label: 'To Do' },
  { value: TaskStatus.InProgress, label: 'In Progress' },
  { value: TaskStatus.Done, label: 'Done' },
]

interface FormValues {
  title: string
  description: string
  status: TaskStatus
}

interface FormErrors {
  title?: string
  description?: string
  status?: string
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  const title = values.title.trim()
  if (!title) {
    errors.title = 'Title is required'
  } else if (title.length < 2) {
    errors.title = 'Title must be at least 2 characters'
  } else if (title.length > 100) {
    errors.title = 'Title cannot exceed 100 characters'
  }
  if (values.description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }
  return errors
}

export default function TaskForm({ initialTask, onSubmit, onCancel, submitting }: TaskFormProps) {
  const isEditing = !!initialTask

  const [values, setValues] = useState<FormValues>({
    title: initialTask?.title ?? '',
    description: initialTask?.description ?? '',
    status: initialTask?.status ?? TaskStatus.Todo,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})

  useEffect(() => {
    setValues({
      title: initialTask?.title ?? '',
      description: initialTask?.description ?? '',
      status: initialTask?.status ?? TaskStatus.Todo,
    })
    setErrors({})
    setTouched({})
  }, [initialTask])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const next = { ...values, [name]: value }
    setValues(next)
    if (touched[name as keyof FormValues]) {
      setErrors(validate(next))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(validate(values))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({ title: true, description: true, status: true })
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    if (isEditing && initialTask) {
      await onSubmit({ id: initialTask.id, ...values })
    } else {
      await onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Title"
        id="title"
        name="title"
        type="text"
        placeholder="Enter task title"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.title}
        touched={touched.title}
        autoFocus
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-black-300 dark:text-white-400"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe the task..."
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={[
            'block w-full rounded-lg border px-3 py-2.5 text-sm resize-none',
            'bg-white dark:bg-black-700',
            'text-black-300 dark:text-white',
            'placeholder-gray-300 dark:placeholder-gray-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            touched.description && errors.description
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
              : 'border-white-300 dark:border-black-400 focus:border-primary-300 focus:ring-primary-200',
          ].join(' ')}
        />
        {touched.description && errors.description && (
          <span className="text-xs text-red-300" role="alert">
            {errors.description}
          </span>
        )}
        <span className="text-xs text-gray-300 dark:text-gray-400 text-right">
          {values.description.length}/500
        </span>
      </div>

      <Dropdown<TaskStatus>
        label="Status"
        id="status"
        value={values.status}
        options={statusOptions}
        onChange={(val) => {
          setValues(prev => ({ ...prev, status: val }))
        }}
        error={errors.status}
        touched={touched.status}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}

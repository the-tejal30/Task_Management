import type { Task } from 'types/index'
import Badge from 'commoncomponent/Badge'
import Button from 'commoncomponent/Button'
import { EditIcon, TrashIcon } from 'icons'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-white-300 dark:border-black-500 bg-white dark:bg-black-700 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-black-300 dark:text-white leading-snug line-clamp-2">
          {task.title}
        </h3>
        <Badge status={task.status} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-300 dark:text-gray-200 leading-relaxed line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-2 border-t border-white-300 dark:border-black-500">
        <span className="text-xs text-gray-300 dark:text-gray-400">
          Updated {formatDate(task.updatedAt)}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            aria-label={`Edit task: ${task.title}`}
          >
            <EditIcon className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task)}
            className="text-red-300 hover:text-red-400 hover:bg-red dark:hover:bg-red-900"
            aria-label={`Delete task: ${task.title}`}
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

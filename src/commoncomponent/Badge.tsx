import { TaskStatus } from 'types/index'

interface BadgeProps {
  status: TaskStatus
}

const statusConfig: Record<TaskStatus, { label: string; classes: string; dot: string }> = {
  [TaskStatus.Todo]: {
    label: 'To Do',
    classes: 'bg-white-300 text-gray-400 dark:bg-black-500 dark:text-gray-200',
    dot: 'bg-gray-400 dark:bg-gray-300',
  },
  [TaskStatus.InProgress]: {
    label: 'In Progress',
    classes: 'bg-secondary text-secondary-700 dark:bg-black-500 dark:text-secondary-200',
    dot: 'bg-secondary-300',
  },
  [TaskStatus.Done]: {
    label: 'Done',
    classes: 'bg-green text-green-700 dark:bg-black-500 dark:text-green-200',
    dot: 'bg-green-300',
  },
}

export default function Badge({ status }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        config.classes,
      ].join(' ')}
    >
      <span className={['w-1.5 h-1.5 rounded-full', config.dot].join(' ')} />
      {config.label}
    </span>
  )
}

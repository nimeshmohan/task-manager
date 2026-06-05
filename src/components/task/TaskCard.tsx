import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Flag } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { useUIStore } from '@/store/uiStore'
import { PRIORITY_CONFIG, TAG_COLORS } from '@/utils/priority'
import { cn } from '@/lib/cn'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  overlay?: boolean
}

export function TaskCard({ task, overlay }: TaskCardProps) {
  const { setActiveTaskId } = useUIStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-xl bg-white p-4 shadow-card cursor-grab active:cursor-grabbing transition-shadow dark:bg-gray-800',
        isDragging && 'opacity-50',
        overlay && 'shadow-card-hover rotate-2',
      )}
      onClick={() => setActiveTaskId(task.id)}
    >
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-2 flex gap-1.5 flex-wrap">
          {task.tags.map((tag) => (
            <div
              key={tag}
              className={cn('h-1.5 w-8 rounded-full', TAG_COLORS[tag])}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-3">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            priority.bg,
            priority.color,
          )}
        >
          <Flag size={10} />
          {priority.label}
        </span>

        {task.dueDate && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-500' : 'text-gray-400',
            )}
          >
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

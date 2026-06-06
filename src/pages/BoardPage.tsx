import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Column } from '@/components/column/Column'
import { AddColumn } from '@/components/column/AddColumn'
import { TaskCard } from '@/components/task/TaskCard'
import { TaskModal } from '@/components/task/TaskModal'
import { ColumnSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBoardStore } from '@/store/boardStore'
import { useBoardData } from '@/hooks/useBoardData'
import { useBoards } from '@/hooks/useBoards'
import { updateColumnOrder, updateCardOrder, moveTaskBetweenColumns } from '@/firebase/firestore'
import { LayoutGrid } from 'lucide-react'
import type { Task } from '@/types'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { boards, columns, setActiveBoardId, getActiveBoard, reorderColumnsLocally, moveTaskLocally, updateColumnLocally } = useBoardStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const dragStartColumnId = useRef<string | null>(null)

  useBoards()
  useBoardData(boardId ?? '')

  useEffect(() => {
    if (boardId) {
      setActiveBoardId(boardId)
      const timer = setTimeout(() => setLoading(false), 600)
      return () => clearTimeout(timer)
    }
  }, [boardId])

  const board = getActiveBoard()
  const boardColumns = board
    ? board.columnOrder.map((id) => columns.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
    : []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function onDragStart(event: DragStartEvent) {
    const { active } = event
    if (active.data.current?.type === 'task') {
      const task = active.data.current.task as Task
      setActiveTask(task)
      dragStartColumnId.current = task.columnId
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (active.data.current?.type !== 'task') return

    const activeId = String(active.id)
    const overId = String(over.id)
    const cols = useBoardStore.getState().columns

    const fromCol = cols.find((c) => c.cardOrder.includes(activeId))
    if (!fromCol) return

    const isOverTask = over.data.current?.type === 'task'

    if (isOverTask) {
      // Find toCol by cardOrder lookup — avoids stale over.data.current.task.columnId
      const toCol = cols.find((c) => c.cardOrder.includes(overId))
      if (!toCol) return

      if (fromCol.id === toCol.id) {
        // Same column: reorder
        const oldIdx = fromCol.cardOrder.indexOf(activeId)
        const newIdx = fromCol.cardOrder.indexOf(overId)
        if (oldIdx === newIdx) return
        const newOrder = arrayMove(fromCol.cardOrder, oldIdx, newIdx)
        updateColumnLocally(fromCol.id, { cardOrder: newOrder })
      } else {
        // Cross-column
        const fromOrder = fromCol.cardOrder.filter((id) => id !== activeId)
        const toOrder = [...toCol.cardOrder]
        const overIdx = toOrder.indexOf(overId)
        toOrder.splice(overIdx >= 0 ? overIdx : toOrder.length, 0, activeId)
        moveTaskLocally(activeId, fromCol.id, toCol.id, fromOrder, toOrder)
        setActiveTask((prev) => (prev ? { ...prev, columnId: toCol.id } : prev))
      }
    } else {
      // Dropped on column body (empty area)
      const toColId = overId
      const toCol = cols.find((c) => c.id === toColId)
      if (!toCol || fromCol.id === toCol.id) return

      const fromOrder = fromCol.cardOrder.filter((id) => id !== activeId)
      const toOrder = [...toCol.cardOrder, activeId]
      moveTaskLocally(activeId, fromCol.id, toCol.id, fromOrder, toOrder)
      setActiveTask((prev) => (prev ? { ...prev, columnId: toCol.id } : prev))
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over || !boardId) return

    // Column reorder
    if (active.data.current?.type === 'column') {
      const currentBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)
      const oldOrder = currentBoard?.columnOrder ?? []
      const oldIdx = oldOrder.indexOf(String(active.id))
      const newIdx = oldOrder.indexOf(String(over.id))
      if (oldIdx === newIdx || newIdx === -1) return
      const newOrder = [...oldOrder]
      newOrder.splice(oldIdx, 1)
      newOrder.splice(newIdx, 0, String(active.id))
      reorderColumnsLocally(boardId, newOrder)
      await updateColumnOrder(boardId, newOrder)
      return
    }

    // Task drop — persist final store state
    if (active.data.current?.type === 'task') {
      const currentState = useBoardStore.getState()
      const currentTask = currentState.tasks.find((t) => t.id === String(active.id))
      if (!currentTask) return

      const currentCol = currentState.columns.find((c) => c.cardOrder.includes(String(active.id)))
      if (!currentCol) return

      const originalColumnId = dragStartColumnId.current
      dragStartColumnId.current = null

      if (originalColumnId && originalColumnId !== currentTask.columnId) {
        // Moved to different column
        const fromColState = currentState.columns.find((c) => c.id === originalColumnId)
        const toColState = currentState.columns.find((c) => c.id === currentTask.columnId)
        if (fromColState && toColState) {
          await moveTaskBetweenColumns(
            currentTask.id,
            originalColumnId,
            currentTask.columnId,
            toColState.cardOrder,
            fromColState.cardOrder.filter((id) => id !== currentTask.id),
          )
        }
      } else {
        // Same column reorder (or no move)
        await updateCardOrder(currentCol.id, currentCol.cardOrder)
      }
    }
  }

  if (!boardId) return null

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-6">
        {[1, 2, 3, 4].map((i) => <ColumnSkeleton key={i} />)}
      </div>
    )
  }

  if (!board) {
    return (
      <div className="p-8">
        <EmptyState
          icon={LayoutGrid}
          title="Board not found"
          description="This board doesn't exist or you don't have access."
        />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        <SortableContext items={board.columnOrder} strategy={horizontalListSortingStrategy}>
          {boardColumns.map((col) => (
            <Column key={col.id} column={col} boardId={boardId} />
          ))}
        </SortableContext>
        <AddColumn boardId={boardId} />
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} overlay />}
      </DragOverlay>

      <TaskModal />
    </DndContext>
  )
}

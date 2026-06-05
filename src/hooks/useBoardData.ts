import { useEffect } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { subscribeToColumns, subscribeToTasks } from '@/firebase/firestore'

export function useBoardData(boardId: string) {
  const { setColumns, setTasks } = useBoardStore()

  useEffect(() => {
    if (!boardId) return
    const unsubCols = subscribeToColumns(boardId, setColumns)
    const unsubTasks = subscribeToTasks(boardId, setTasks)
    return () => {
      unsubCols()
      unsubTasks()
    }
  }, [boardId])
}

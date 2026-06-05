import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useBoardStore } from '@/store/boardStore'
import { subscribeToBoards } from '@/firebase/firestore'

export function useBoards() {
  const { user } = useAuthStore()
  const { setBoards } = useBoardStore()

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToBoards(user.uid, setBoards)
    return unsub
  }, [user?.uid])
}

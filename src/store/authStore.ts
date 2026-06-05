import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user, initialized: true }),
  setLoading: (loading) => set({ loading }),
}))

// Initialize Firebase auth listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    useAuthStore.getState().setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isGuest: firebaseUser.isAnonymous,
    })
  } else {
    useAuthStore.getState().setUser(null)
  }
  useAuthStore.setState({ loading: false })
})

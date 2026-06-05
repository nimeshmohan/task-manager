import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './config'
import { createUserDoc } from './firestore'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await createUserDoc(result.user, false)
  return result.user
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await createUserDoc(result.user, false)
  return result.user
}

export async function signInAsGuest() {
  const result = await signInAnonymously(auth)
  await updateProfile(result.user, { displayName: 'Guest User' })
  await createUserDoc(result.user, true)
  return result.user
}

export async function signOutUser() {
  await signOut(auth)
}

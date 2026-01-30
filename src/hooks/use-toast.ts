
import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE
  return toastCount.toString()
}

// Simple in-memory toast state for now
let listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = { toasts: [] }

function dispatch(toast: Omit<Toast, 'id'>) {
  const id = genId()
  const newToast = { ...toast, id }
  
  memoryState = {
    toasts: [...memoryState.toasts, newToast],
  }
  
  listeners.forEach((listener) => {
    listener(memoryState)
  })

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    }
    listeners.forEach((listener) => {
      listener(memoryState)
    })
  }, 3000)

  return id
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState)

  const toast = useCallback(
    ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
      return dispatch({ title, description, variant })
    },
    []
  )

  // Subscribe to state changes
  useState(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  })

  return {
    toasts: state.toasts,
    toast,
  }
}

export { type Toast }

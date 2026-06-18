/**
 * useToastStore — lightweight global toast notifications.
 * Shared by both the driver app and the manager dashboard.
 */

import { create } from 'zustand'

let idSeq = 0

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3200) => {
    const id = ++idSeq
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    if (duration) {
      setTimeout(() => get().removeToast(id), duration)
    }
    return id
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// Convenience helper for non-component code.
export const toast = (message, type, duration) =>
  useToastStore.getState().addToast(message, type, duration)

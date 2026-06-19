/**
 * useAuthStore — simulated manager/owner authentication + active location.
 *
 * ⚠️ SIMULATED AUTH ONLY (prototype). Credentials are validated against the
 * accounts held in useManagerStore (plain text in the browser). This is NOT
 * secure and must be replaced with real authentication before launch.
 *
 * AIRTABLE: Replace login() with a real auth provider (e.g. Airtable + Auth0 /
 * Clerk / Supabase Auth). currentUser would come from the verified session.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useManagerStore } from './useManagerStore'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null, // { id, name, email, role, locationId }
      activeLocationId: null, // location currently being viewed

      login: (email, password) => {
        const accounts = useManagerStore.getState().accounts
        const locations = useManagerStore.getState().locations
        const match = accounts.find(
          (a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password,
        )
        if (!match) return { ok: false, error: 'Invalid email or password.' }

        // Owner defaults to the first active location; managers to their own.
        const defaultLoc =
          match.role === 'owner'
            ? locations.find((l) => l.active)?.id || locations[0]?.id || null
            : match.locationId

        set({
          currentUser: {
            id: match.id,
            name: match.name,
            email: match.email,
            role: match.role,
            locationId: match.locationId,
          },
          activeLocationId: defaultLoc,
        })
        return { ok: true, role: match.role }
      },

      logout: () => set({ currentUser: null, activeLocationId: null }),

      setActiveLocation: (locationId) => {
        const user = get().currentUser
        // Only the owner may switch locations; managers are locked to theirs.
        if (user?.role === 'owner') set({ activeLocationId: locationId })
      },

      isOwner: () => get().currentUser?.role === 'owner',
    }),
    { name: 'shuttlelog-auth' },
  ),
)

export default useAuthStore

import { useManagerStore, scopeData } from '../store/useManagerStore'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Returns the manager store collections scoped to the currently active
 * location (the manager's own location, or the location the owner has
 * selected in the sidebar switcher). Owner with no location → all data.
 */
export function useScope() {
  const activeLocationId = useAuthStore((s) => s.activeLocationId)
  const state = useManagerStore()
  const scoped = scopeData(state, activeLocationId)
  return { ...scoped, activeLocationId, referenceToday: state.referenceToday, raw: state }
}

export default useScope

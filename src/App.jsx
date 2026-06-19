import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastHost } from './components/shared/Toast'
import { useAuthStore } from './store/useAuthStore'

// Layouts
import DriverLayout from './components/driver/DriverLayout'
import ManagerLayout from './components/manager/ManagerLayout'

// Driver pages
import DriverApp from './pages/driver/DriverApp'
import TripLog from './pages/driver/TripLog'
import Inspection from './pages/driver/Inspection'
import DriverTrips from './pages/driver/DriverTrips'
import EndShift from './pages/driver/EndShift'
import IncidentReport from './pages/driver/IncidentReport'

// Manager pages
import Login from './pages/manager/Login'
import Dashboard from './pages/manager/Dashboard'
import Trips from './pages/manager/Trips'
import Fleet from './pages/manager/Fleet'
import Drivers from './pages/manager/Drivers'
import DriverDetail from './pages/manager/DriverDetail'
import Incidents from './pages/manager/Incidents'
import Reports from './pages/manager/Reports'
import Settings from './pages/manager/Settings'
import Locations from './pages/manager/admin/Locations'
import Managers from './pages/manager/admin/Managers'

import Landing from './pages/Landing'

// Simple auth guard for the manager/owner area (simulated auth).
function RequireAuth({ children }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/manager/login" replace />
  return children
}

// Owner-only guard.
function RequireOwner({ children }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/manager/login" replace />
  if (currentUser.role !== 'owner') return <Navigate to="/manager" replace />
  return children
}

export default function App() {
  return (
    <>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Driver app (tablet) */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<DriverApp />} />
          <Route path="log" element={<TripLog />} />
          <Route path="inspection" element={<Inspection />} />
          <Route path="trips" element={<DriverTrips />} />
          <Route path="incident" element={<IncidentReport />} />
          <Route path="end-shift" element={<EndShift />} />
        </Route>

        {/* Manager login (no layout) */}
        <Route path="/manager/login" element={<Login />} />

        {/* Manager dashboard (desktop) — auth required */}
        <Route
          path="/manager"
          element={
            <RequireAuth>
              <ManagerLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:driverId" element={<DriverDetail />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin/locations" element={<RequireOwner><Locations /></RequireOwner>} />
          <Route path="admin/managers" element={<RequireOwner><Managers /></RequireOwner>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

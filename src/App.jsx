import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastHost } from './components/shared/Toast'

// Layouts
import DriverLayout from './components/driver/DriverLayout'
import ManagerLayout from './components/manager/ManagerLayout'

// Driver pages
import DriverApp from './pages/driver/DriverApp'
import TripLog from './pages/driver/TripLog'
import Inspection from './pages/driver/Inspection'
import DriverTrips from './pages/driver/DriverTrips'
import EndShift from './pages/driver/EndShift'

// Manager pages
import Dashboard from './pages/manager/Dashboard'
import Trips from './pages/manager/Trips'
import Fleet from './pages/manager/Fleet'
import Drivers from './pages/manager/Drivers'
import DriverDetail from './pages/manager/DriverDetail'
import Reports from './pages/manager/Reports'
import Settings from './pages/manager/Settings'

import Landing from './pages/Landing'

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
          <Route path="end-shift" element={<EndShift />} />
        </Route>

        {/* Manager dashboard (desktop) */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:driverId" element={<DriverDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

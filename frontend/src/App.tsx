import { Suspense } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom'

import './assets/App.css'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

import Login from './pages/Login'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import AllUser from './pages/AllUser'

// import ProfilePage from './pages/ProfilePage'
// import FinAllProjectPage from './pages/FinAllProjectPage'
// import ReportsPage from './pages/ReportsPage'
// import SettingsPage from './pages/SettingsPage'
// import ProjectDetailPage from './pages/ProjectDetailPage'
// import EventDetailPage from './pages/EventDetailPage'
// import TrxDetailPage from './pages/TrxDetailPage'
// import CurrentUserEventPage from './pages/CurrentUserEventPage'
// import FinAllEvnPage from './pages/FinAllEvnPage'
// import FinAllTrxPage from './pages/FinAllTrxPage'
// import TimeMapPage from './pages/TimeMap'



function AppRoutes() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* 
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/users" element={<AllUsersPage />} />
                    <Route path="/finance/event" element={<CurrentUserEventPage />} /> 
                    */}

                    {/* Finance sub-routes */}
                    <Route path="/allUser" element={<AllUser />} />
                    {/* 
                    <Route path="/finance/projects" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <FinAllProjectPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/project/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <ProjectDetailPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/finance/event/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <EventDetailPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/transaction/:trxId" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TrxDetailPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/finance/all-events" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <FinAllEvnPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/all-trx" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <FinAllTrxPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/time-map" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeMapPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/dashboard/reports" element={<ReportsPage />} />
                    <Route path="/dashboard/settings" element={<SettingsPage />} /> 
                    */}
                </Route>
            </Routes>
        </Suspense>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    )
}

export default App

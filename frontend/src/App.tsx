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
import AllProject from './pages/AllProject'   

import ProjectDetail from './pages/ProjectDetail'   
import BudgetDetail from './pages/BudgetDetail'
import ActualDetail from './pages/ActualDetail'
import TrxDetail from './pages/TrxDetail'
// import ProfilePage from './pages/ProfilePage'
// import ReportsPage from './pages/ReportsPage'
// import SettingsPage from './pages/SettingsPage'



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
                    
                        
                    {/* manage sub-routes */}
                    <Route path="/manage/allUser" element={
                        <ProtectedRoute roles={['admin']}>
                            <AllUser />
                        </ProtectedRoute>
                    } />
                                   
                    {/* Finance sub-routes */}
                    <Route path="/finance/allProject" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <AllProject />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/project/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <ProjectDetail />
                        </ProtectedRoute>
                    } />

                    <Route path="/finance/budget/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <BudgetDetail />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/finance/actual/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <ActualDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/trx/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TrxDetail />
                        </ProtectedRoute>
                    } />
                    {/* 
                    
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

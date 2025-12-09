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
import MainLayout from './components/MainLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

import AllUser from './pages/AllUser'
import AllProject from './pages/AllProject'   

import ProjectDetail from './pages/ProjectDetail'   
import BudgetDetail from './pages/BudgetDetail'
import ActualDetail from './pages/ActualDetail'
import TrxDetail from './pages/TrxDetail'

import TimeBudget from './pages/TimeBudget'
import TimeActual from './pages/TimeActual'
import TimeTrx from './pages/TimeTrx'

import CurrentUserTimeActual from './pages/CurrentUserTimeActual' // Changed from './pages/CuTimeActual' to './pages/CuTimeActual'

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
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cu/time-actual" element={<CurrentUserTimeActual />} />
                        
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
                    <Route path="/finance/time-budget" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeBudget />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/time-actual" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeActual />
                        </ProtectedRoute>
                    } />
                    <Route path="/finance/time-trx" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeTrx />
                        </ProtectedRoute>
                    } />
                    
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

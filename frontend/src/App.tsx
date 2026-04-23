import { Suspense, lazy } from 'react'
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

// Lazy load pages to reduce main bundle size
const AllUser = lazy(() => import('./pages/AllUser'))
const AllProject = lazy(() => import('./pages/AllProject'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const BudgetDetail = lazy(() => import('./pages/BudgetDetail'))
const ActualDetail = lazy(() => import('./pages/ActualDetail'))
const TrxDetail = lazy(() => import('./pages/TrxDetail'))
const TimeBudget = lazy(() => import('./pages/TimeBudget'))
// const TimeActual = lazy(() => import('./pages/TimeActual'))
const TimeActualByAssignee = lazy(() => import('./pages/TimeActualByAssignee'))
// const TimeTrx = lazy(() => import('./pages/TimeTrx'))
const TimeTrxByAssignee = lazy(() => import('./pages/TimeTrxByAssignee'))
const CurrentUserTimeActual = lazy(() => import('./pages/CurrentUserTimeActual'))
const CurrentUserTimeTrx = lazy(() => import('./pages/CurrentUserTimeTrx'))
const UserDetail = lazy(() => import('./pages/UserDetail'))

function AppRoutes() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
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
                    <Route path="/cu/time-trx" element={<CurrentUserTimeTrx />} />
                        
                    {/* manage sub-routes */}
                    <Route path="/manage/allUser" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <AllUser />
                        </ProtectedRoute>
                    } />
                    <Route path="/manage/user/:id" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <UserDetail />
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
                    {/* <Route path="/finance/time-actual" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeActual />
                        </ProtectedRoute>
                    } /> */}
                    <Route path="/finance/time-actual-by-assignee" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeActualByAssignee />
                        </ProtectedRoute>
                    } />
                    {/* <Route path="/finance/time-trx" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeTrx />
                        </ProtectedRoute>
                    } /> */}
                    <Route path="/finance/time-trx-by-assignee" element={
                        <ProtectedRoute roles={['admin', 'finance']}>
                            <TimeTrxByAssignee />
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

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { cn } from './lib/utils'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import DSATracker from './pages/DSATracker'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import JobMatch from './pages/JobMatch'
import CompanyPrep from './pages/CompanyPrep'
import DailyGoals from './pages/DailyGoals'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={cn(
        'flex-1 relative min-h-screen transition-[margin] duration-200',
        'p-10 max-md:px-4 max-md:py-6',
        'ml-[248px] max-md:ml-16',
        'peer-data-[collapsed=true]:ml-16'
      )}>
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login"  element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dsa"       element={<DSATracker />} />
                <Route path="/resume"    element={<ResumeAnalyzer />} />
                <Route path="/jobmatch"  element={<JobMatch />} />
                <Route path="/companies" element={<CompanyPrep />} />
                <Route path="/goals"     element={<DailyGoals />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

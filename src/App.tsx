import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

// Auth Pages
import LoginPage from '@/pages/auth/login'
import SignupPage from '@/pages/auth/signup'

// Marketing Pages
import LandingPage from '@/pages/landing'

// Dashboard Pages
import DashboardLayout from '@/layouts/DashboardLayout'
import DashboardHome from '@/pages/dashboard/home'
import MyResumes from '@/pages/dashboard/my-resumes'
import AICustomize from '@/pages/dashboard/ai-customize'
import Templates from '@/pages/dashboard/templates'
import InterviewPrep from '@/pages/dashboard/interview-prep'
import SalaryGuide from '@/pages/dashboard/salary-guide'
import VisitingCards from '@/pages/dashboard/visiting-cards'
import Settings from '@/pages/dashboard/settings'

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="resume-builder-theme">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="my-resumes" element={<MyResumes />} />
          <Route path="ai-customize" element={<AICustomize />} />
          <Route path="templates" element={<Templates />} />
          <Route path="interview-prep" element={<InterviewPrep />} />
          <Route path="salary-guide" element={<SalaryGuide />} />
          <Route path="visiting-cards" element={<VisitingCards />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </ThemeProvider>
  )
}

export default App

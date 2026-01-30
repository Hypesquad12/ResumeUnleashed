
import { useState, useEffect } from 'react'
import { OnboardingModal } from './onboarding-modal'

interface DashboardClientProps {
  isNewUser: boolean
  userName?: string
  children: React.ReactNode
}

export function DashboardClient({ isNewUser, userName, children }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (isNewUser && !hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [isNewUser])

  const handleCloseOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      {children}
      <OnboardingModal 
        open={showOnboarding} 
        onClose={handleCloseOnboarding}
        userName={userName}
      />
    </>
  )
}

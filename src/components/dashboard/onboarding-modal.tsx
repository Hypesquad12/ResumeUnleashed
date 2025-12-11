'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog'
import { FileText, Upload, Sparkles, ArrowRight, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  userName?: string
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to ResumeAI! 🎉',
    description: 'Let\'s get you started with creating your perfect resume.',
  },
  {
    id: 'choose',
    title: 'How would you like to start?',
    description: 'Choose the option that works best for you.',
  },
]

export function OnboardingModal({ open, onClose, userName }: OnboardingModalProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleStartFromScratch = () => {
    onClose()
    router.push('/resumes/new')
  }

  const handleUploadResume = () => {
    onClose()
    router.push('/resumes/new?method=upload')
  }

  const handleExplore = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl w-fit">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-2xl">
                  Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! 🎉
                </DialogTitle>
                <DialogDescription className="text-base">
                  You&apos;re all set to create AI-powered resumes that get you hired.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">AI-Powered Optimization</p>
                    <p className="text-sm text-muted-foreground">
                      Tailor your resume for any job description
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">ATS-Friendly Templates</p>
                    <p className="text-sm text-muted-foreground">
                      Pass applicant tracking systems with ease
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Digital Business Cards</p>
                    <p className="text-sm text-muted-foreground">
                      Share your profile with a QR code
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentStep(1)}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-2xl">
                  How would you like to start?
                </DialogTitle>
                <DialogDescription className="text-base">
                  Choose the option that works best for you
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <button
                  onClick={handleStartFromScratch}
                  className="flex items-start gap-4 p-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Start from Scratch</p>
                    <p className="text-sm text-muted-foreground">
                      Build your resume step by step with our guided form
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </button>

                <button
                  onClick={handleUploadResume}
                  className="flex items-start gap-4 p-4 rounded-xl border-2 hover:border-violet-500 hover:bg-violet-500/5 transition-all text-left group"
                >
                  <div className="p-3 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <Upload className="h-6 w-6 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Upload Existing Resume</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a PDF or DOCX and we&apos;ll extract the content
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-500 transition-colors mt-1" />
                </button>

                <button
                  onClick={handleExplore}
                  className="flex items-start gap-4 p-4 rounded-xl border-2 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left group"
                >
                  <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Sparkles className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Explore First</p>
                    <p className="text-sm text-muted-foreground">
                      Take a look around and start when you&apos;re ready
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors mt-1" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

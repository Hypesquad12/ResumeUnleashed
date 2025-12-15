'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog'
import { FileText, Upload, Sparkles, ArrowRight, Check, Brain, Target, CreditCard, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  userName?: string
}

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

  const firstName = userName?.split(' ')[0] || ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-2xl">
                  Welcome{firstName ? `, ${firstName}` : ''}! 👋
                </DialogTitle>
                <DialogDescription className="text-base">
                  Your complete career toolkit is ready
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 py-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Resume Builder</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <span className="text-sm font-medium">AI Customize</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium">Interview Prep</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-500/5 border border-teal-500/10">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-teal-500" />
                  </div>
                  <span className="text-sm font-medium">Resume Score</span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-center text-muted-foreground">
                  <span className="font-medium text-foreground">Pro tip:</span> Start by creating your base resume, then use AI to tailor it for each job application.
                </p>
              </div>

              <Button onClick={() => setCurrentStep(1)} className="w-full" size="lg">
                Let&apos;s Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <button 
                onClick={() => setCurrentStep(0)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-xl">
                  Create Your First Resume
                </DialogTitle>
                <DialogDescription>
                  Choose how you&apos;d like to get started
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <button
                  onClick={handleStartFromScratch}
                  className="flex items-center gap-4 w-full p-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Start Fresh</p>
                    <p className="text-sm text-muted-foreground">
                      Build step by step with our guided form
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={handleUploadResume}
                  className="flex items-center gap-4 w-full p-4 rounded-xl border-2 hover:border-violet-500 hover:bg-violet-500/5 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <Upload className="h-6 w-6 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Upload Existing</p>
                    <p className="text-sm text-muted-foreground">
                      Import from PDF or DOCX file
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                </button>
              </div>

              <div className="pt-4 border-t mt-4">
                <button
                  onClick={handleExplore}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  I&apos;ll explore first →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

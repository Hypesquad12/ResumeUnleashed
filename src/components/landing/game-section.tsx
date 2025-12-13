'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, Trophy, Star, Zap, Target, Award, Gift, Lock, 
  ArrowRight, RotateCcw, CheckCircle, X, Timer, Flame,
  Crown, Rocket, Heart, Shield
} from 'lucide-react'
import Link from 'next/link'

// Keywords for the matching game
const resumeKeywords = [
  { word: 'Leadership', category: 'soft', points: 10 },
  { word: 'Python', category: 'tech', points: 15 },
  { word: 'Agile', category: 'method', points: 12 },
  { word: 'React', category: 'tech', points: 15 },
  { word: 'Communication', category: 'soft', points: 10 },
  { word: 'AWS', category: 'tech', points: 15 },
  { word: 'Problem-solving', category: 'soft', points: 10 },
  { word: 'TypeScript', category: 'tech', points: 15 },
  { word: 'Teamwork', category: 'soft', points: 10 },
  { word: 'SQL', category: 'tech', points: 12 },
  { word: 'Project Management', category: 'method', points: 12 },
  { word: 'Node.js', category: 'tech', points: 15 },
]

const jobDescriptions = [
  {
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    keywords: ['React', 'TypeScript', 'AWS', 'Agile', 'Leadership'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    keywords: ['Python', 'React', 'SQL', 'Node.js', 'Teamwork'],
    color: 'from-teal-500 to-cyan-500',
  },
  {
    title: 'Tech Lead',
    company: 'Enterprise Inc',
    keywords: ['Leadership', 'Project Management', 'Communication', 'AWS', 'Agile'],
    color: 'from-amber-500 to-orange-500',
  },
]

// Rewards that unlock at different score thresholds
const rewards = [
  { threshold: 50, icon: Star, label: 'Resume Rookie', color: 'from-slate-400 to-slate-500', unlocked: false },
  { threshold: 100, icon: Zap, label: 'Keyword Hunter', color: 'from-amber-400 to-orange-500', unlocked: false },
  { threshold: 150, icon: Trophy, label: 'ATS Master', color: 'from-violet-500 to-purple-500', unlocked: false },
  { threshold: 200, icon: Crown, label: 'Resume Legend', color: 'from-amber-400 to-yellow-500', unlocked: false },
]

// Confetti component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 5)],
          }}
          initial={{ y: -20, opacity: 1, scale: 1 }}
          animate={{
            y: window.innerHeight + 20,
            opacity: 0,
            rotate: Math.random() * 720,
            scale: Math.random() * 0.5 + 0.5,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export function GameSection() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro')
  const [currentJob, setCurrentJob] = useState(0)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showConfetti, setShowConfetti] = useState(false)
  const [combo, setCombo] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [unlockedRewards, setUnlockedRewards] = useState<number[]>([])
  const [showRewardPopup, setShowRewardPopup] = useState<number | null>(null)
  const [shuffledKeywords, setShuffledKeywords] = useState(resumeKeywords)

  const job = jobDescriptions[currentJob]

  // Shuffle keywords
  const shuffleKeywords = useCallback(() => {
    setShuffledKeywords([...resumeKeywords].sort(() => Math.random() - 0.5))
  }, [])

  // Start game
  const startGame = () => {
    setGameState('playing')
    setSelectedKeywords([])
    setScore(0)
    setTimeLeft(30)
    setCombo(0)
    setCurrentJob(Math.floor(Math.random() * jobDescriptions.length))
    shuffleKeywords()
  }

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return
    if (timeLeft <= 0) {
      endRound()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  // Select keyword
  const selectKeyword = (word: string) => {
    if (selectedKeywords.includes(word)) return
    
    setSelectedKeywords([...selectedKeywords, word])
    
    const isMatch = job.keywords.includes(word)
    const keyword = resumeKeywords.find(k => k.word === word)
    
    if (isMatch && keyword) {
      const comboMultiplier = 1 + combo * 0.2
      const points = Math.round(keyword.points * comboMultiplier)
      setScore(s => s + points)
      setCombo(c => c + 1)
      
      // Check if all keywords found
      const matchedCount = [...selectedKeywords, word].filter(w => job.keywords.includes(w)).length
      if (matchedCount === job.keywords.length) {
        // Bonus for completing all keywords
        setScore(s => s + 50)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } else {
      setCombo(0)
    }
  }

  // End round
  const endRound = () => {
    setGameState('result')
    const newTotal = totalScore + score
    setTotalScore(newTotal)
    
    if (newTotal > highScore) {
      setHighScore(newTotal)
    }
    
    // Check for new rewards
    rewards.forEach((reward, index) => {
      if (newTotal >= reward.threshold && !unlockedRewards.includes(index)) {
        setUnlockedRewards([...unlockedRewards, index])
        setShowRewardPopup(index)
        setShowConfetti(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowRewardPopup(null)
        }, 3000)
      }
    })
  }

  // Play again
  const playAgain = () => {
    startGame()
  }

  // Next job
  const nextJob = () => {
    setCurrentJob((currentJob + 1) % jobDescriptions.length)
    setSelectedKeywords([])
    setScore(0)
    setTimeLeft(30)
    setCombo(0)
    shuffleKeywords()
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Interactive Challenge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Test Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Resume Skills</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Match keywords to job descriptions and earn rewards! Unlock exclusive bonuses when you sign up.
          </p>
        </motion.div>

        {/* Score & Rewards Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          {/* Total Score */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-white font-bold">{totalScore}</span>
            <span className="text-slate-400 text-sm">Total XP</span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-bold">{highScore}</span>
            <span className="text-slate-400 text-sm">Best</span>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-2">
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  unlockedRewards.includes(index)
                    ? `bg-gradient-to-r ${reward.color}`
                    : 'bg-slate-700/50 border border-slate-600'
                }`}
                whileHover={{ scale: 1.1 }}
                title={`${reward.label} - ${reward.threshold} XP`}
              >
                {unlockedRewards.includes(index) ? (
                  <reward.icon className="h-5 w-5 text-white" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-500" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 relative overflow-hidden"
        >
          {/* Intro State */}
          <AnimatePresence mode="wait">
            {gameState === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Target className="h-12 w-12 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-4">Keyword Matching Challenge</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Match the right keywords to job descriptions before time runs out. 
                  Build combos for bonus points and unlock exclusive rewards!
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50">
                    <Timer className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm">30 seconds per round</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300 text-sm">Combo multipliers</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50">
                    <Gift className="h-4 w-4 text-pink-400" />
                    <span className="text-slate-300 text-sm">Unlock rewards</span>
                  </div>
                </div>

                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-8"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Challenge
                </Button>
              </motion.div>
            )}

            {/* Playing State */}
            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Game Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  {/* Job Card */}
                  <div className={`flex-1 min-w-[200px] p-4 rounded-xl bg-gradient-to-r ${job.color}`}>
                    <div className="text-white/80 text-sm">{job.company}</div>
                    <div className="text-white font-bold text-lg">{job.title}</div>
                    <div className="text-white/60 text-xs mt-1">Find {job.keywords.length} matching keywords</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                      timeLeft <= 10 ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-700/50 border-slate-600'
                    } border`}>
                      <Timer className={`h-5 w-5 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                      <span className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                        {timeLeft}s
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50">
                      <Star className="h-5 w-5 text-amber-400" />
                      <span className="font-bold text-xl text-white">{score}</span>
                    </div>

                    {/* Combo */}
                    {combo > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/50"
                      >
                        <Flame className="h-5 w-5 text-orange-400" />
                        <span className="font-bold text-white">x{combo}</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Keywords Found</span>
                    <span>{selectedKeywords.filter(w => job.keywords.includes(w)).length} / {job.keywords.length}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${job.color}`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(selectedKeywords.filter(w => job.keywords.includes(w)).length / job.keywords.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Keywords Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {shuffledKeywords.map((keyword, index) => {
                    const isSelected = selectedKeywords.includes(keyword.word)
                    const isMatch = isSelected && job.keywords.includes(keyword.word)
                    const isWrong = isSelected && !job.keywords.includes(keyword.word)

                    return (
                      <motion.button
                        key={keyword.word}
                        onClick={() => selectKeyword(keyword.word)}
                        disabled={isSelected}
                        className={`relative p-3 rounded-xl text-sm font-medium transition-all ${
                          isMatch
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : isWrong
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500'
                        } border`}
                        whileHover={!isSelected ? { scale: 1.05 } : {}}
                        whileTap={!isSelected ? { scale: 0.95 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {keyword.word}
                        {isMatch && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <CheckCircle className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                        {isWrong && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            <X className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Result State */}
            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center"
                >
                  <Trophy className="h-10 w-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2">Round Complete!</h3>
                <p className="text-slate-400 mb-6">You earned {score} XP this round</p>

                {/* Stats */}
                <div className="flex justify-center gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{selectedKeywords.filter(w => job.keywords.includes(w)).length}</div>
                    <div className="text-sm text-slate-400">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">{score}</div>
                    <div className="text-sm text-slate-400">XP Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-400">{totalScore}</div>
                    <div className="text-sm text-slate-400">Total XP</div>
                  </div>
                </div>

                {/* Next reward progress */}
                {(() => {
                  const nextReward = rewards.find((r, i) => !unlockedRewards.includes(i))
                  if (nextReward) {
                    const progress = Math.min((totalScore / nextReward.threshold) * 100, 100)
                    return (
                      <div className="max-w-sm mx-auto mb-8">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Next Reward: {nextReward.label}</span>
                          <span className="text-white">{totalScore} / {nextReward.threshold} XP</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${nextReward.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={playAgain}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Play Again
                  </Button>
                  <Button
                    onClick={nextJob}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Try Different Job
                  </Button>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white">
                      <Gift className="mr-2 h-4 w-4" />
                      Claim Rewards - Sign Up
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reward Popup */}
          <AnimatePresence>
            {showRewardPopup !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20"
              >
                <motion.div
                  className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700"
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                >
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${rewards[showRewardPopup].color} flex items-center justify-center`}
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {(() => {
                      const Icon = rewards[showRewardPopup].icon
                      return <Icon className="h-10 w-10 text-white" />
                    })()}
                  </motion.div>
                  <h4 className="text-xl font-bold text-white mb-2">Achievement Unlocked!</h4>
                  <p className="text-violet-400 font-semibold">{rewards[showRewardPopup].label}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30">
            <Gift className="h-6 w-6 text-violet-400" />
            <div className="text-left">
              <div className="text-white font-semibold">Sign up to keep your progress!</div>
              <div className="text-slate-400 text-sm">Plus get 500 bonus XP and unlock premium features</div>
            </div>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white">
                Sign Up Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

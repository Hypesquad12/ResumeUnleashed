import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type InterviewQuestionType = 'intro' | 'behavioral' | 'technical' | 'situational' | 'closing'

type InterviewRound = 'managerial' | 'technical_round_1' | 'technical_round_2' | 'hr'
type InterviewLevel = 'easy' | 'medium' | 'hard' | 'god'

type InterviewTurn = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      threadId,
      message,
      jobTitle,
      jobDescription,
      resumeData,
      interviewRound,
      interviewLevel,
      interviewContext,
      messages,
    } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limit for interview prep when starting a new interview
    if (action === 'start') {
      const { checkUsageLimit } = await import('@/lib/usage-control')
      const hasQuota = await checkUsageLimit(user.id, 'interview_prep')
      
      if (!hasQuota) {
        return NextResponse.json(
          { 
            error: 'Interview prep limit reached. Please upgrade your plan.',
            errorCode: 'LIMIT_REACHED'
          },
          { status: 403 }
        )
      }
    }

    switch (action) {
      case 'start':
        return await startInterview(user.id, jobTitle, jobDescription, resumeData, interviewRound, interviewLevel)
      
      case 'respond':
        return await continueInterview(threadId, message, interviewContext, messages)
      
      case 'end':
        return await endInterview(threadId, user.id, interviewContext, messages)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function buildSystemContext(
  jobTitle: string,
  jobDescription: string,
  resumeData: any,
  interviewRound: InterviewRound | undefined,
  interviewLevel: InterviewLevel | undefined
) {
  const roundLabel =
    interviewRound === 'managerial'
      ? 'Managerial round'
      : interviewRound === 'technical_round_1'
      ? 'Technical round 1'
      : interviewRound === 'technical_round_2'
      ? 'Technical round 2'
      : interviewRound === 'hr'
      ? 'HR round'
      : 'General round'

  const levelLabel =
    interviewLevel === 'god' ? 'God level (extremely challenging)' : interviewLevel || 'medium'

  return `You are an experienced interviewer conducting a realistic interview for the position: ${jobTitle}.

This interview should follow these constraints:
- Round: ${roundLabel}
- Difficulty level: ${levelLabel}

Job Description:
${jobDescription}

Candidate's Resume Summary:
- Skills: ${resumeData?.skills?.join(', ') || 'Not provided'}
- Experience: ${JSON.stringify(resumeData?.experience || []).substring(0, 500)}
- Education: ${JSON.stringify(resumeData?.education || []).substring(0, 300)}

INTERVIEW GUIDELINES:
1. Start with a warm, professional introduction about yourself and the company
2. ALWAYS begin with "Tell me about yourself" as the first question
3. Ask follow-up questions based on the candidate's answers
4. Ask a mix of behavioral, technical, and situational questions (8-10 total)
5. Reference specific skills or experience from their resume
6. Probe deeper when answers are vague or need clarification
7. Be encouraging and professional throughout
8. After each answer, provide brief acknowledgment before moving to next question
9. End with asking if they have questions for you

RESPONSE FORMAT:
Return JSON in this exact format:
{
  "question": "Your next question here",
  "questionNumber": 1,
  "questionType": "intro" | "behavioral" | "technical" | "situational" | "closing",
  "context": "Brief note about why you're asking this (for internal tracking)",
  "isComplete": false
}

When the interview is complete (after 8-10 questions), set "isComplete": true and "question" should be your closing remarks.

Start the interview now with your introduction and first question.`

}

function parseOrFallbackQuestion(text: string, fallbackQuestionNumber: number) {
  try {
    const parsed = JSON.parse(text)
    return {
      question: parsed.question as string,
      questionNumber: (parsed.questionNumber as number) || fallbackQuestionNumber,
      questionType: (parsed.questionType as InterviewQuestionType) || 'behavioral',
      context: parsed.context as string | undefined,
      isComplete: Boolean(parsed.isComplete),
    }
  } catch {
    return {
      question: text,
      questionNumber: fallbackQuestionNumber,
      questionType: 'intro' as InterviewQuestionType,
      context: undefined,
      isComplete: false,
    }
  }
}

async function runInterviewModel(turns: InterviewTurn[]) {
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: turns.map(t => ({ role: t.role, content: t.content })),
  })

  const text = response.output_text
  return { text }
}

async function startInterview(
  userId: string,
  jobTitle: string,
  jobDescription: string,
  resumeData: any,
  interviewRound: InterviewRound | undefined,
  interviewLevel: InterviewLevel | undefined
) {
  const systemContext = buildSystemContext(jobTitle, jobDescription, resumeData, interviewRound, interviewLevel)

  const turns: InterviewTurn[] = [
    { role: 'system', content: systemContext },
    {
      role: 'user',
      content:
        'Start now. Introduce yourself as the interviewer briefly and ask the first question. Remember: first question must be "Tell me about yourself".',
    },
  ]

  const { text } = await runInterviewModel(turns)
  const parsed = parseOrFallbackQuestion(text, 1)

  const newMessages: InterviewTurn[] = [
    ...turns,
    { role: 'assistant', content: JSON.stringify(parsed) },
  ]

  // Use a lightweight thread id (no OpenAI thread dependency)
  const threadId = crypto.randomUUID()

  return NextResponse.json({
    threadId,
    messages: newMessages,
    ...parsed,
  })
}

async function continueInterview(threadId: string, candidateAnswer: string, interviewContext: any, messages: InterviewTurn[] | undefined) {
  const questionNumber = (interviewContext?.questionNumber as number) || 1
  const turns: InterviewTurn[] = Array.isArray(messages) ? messages : []

  turns.push({
    role: 'user',
    content: `CANDIDATE'S ANSWER: "${candidateAnswer}"

Now provide your next question following the interview guidelines. Remember to:
- Acknowledge their answer briefly if appropriate
- Ask relevant follow-up questions or move to next topic
- Keep track of question count (currently at question ${interviewContext?.questionNumber || 1})
- After 8-10 substantive questions, wrap up the interview

Return JSON format as specified in the system context.`
  })

  const { text } = await runInterviewModel(turns)
  const parsed = parseOrFallbackQuestion(text, questionNumber + 1)
  turns.push({ role: 'assistant', content: JSON.stringify(parsed) })

  return NextResponse.json({
    threadId,
    messages: turns,
    ...parsed,
  })
}

async function endInterview(threadId: string, userId: string, interviewContext: any, messages: InterviewTurn[] | undefined) {
  const turns: InterviewTurn[] = Array.isArray(messages) ? messages : []

  turns.push({
    role: 'user',
    content: `The interview is now ending. Please provide:
1. A brief summary of the candidate's performance
2. Overall score (0-100)
3. Key strengths observed
4. Areas for improvement
5. Recommendation (Strong Hire, Hire, Maybe, No Hire)

Return as JSON:
{
  "summary": "Overall performance summary",
  "overallScore": 85,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "recommendation": "Hire"
}`
  })

  const { text } = await runInterviewModel(turns)
  let evaluation: any
  try {
    evaluation = JSON.parse(text)
  } catch {
    evaluation = {
      summary: text,
      overallScore: 75,
      strengths: [],
      improvements: [],
      recommendation: 'Maybe',
    }
  }

  try {
    const supabase = await createClient()
    await supabase.from('interview_sessions').insert({
      user_id: userId,
      job_title: interviewContext?.jobTitle,
      job_description: interviewContext?.jobDescription,
      interview_round: interviewContext?.interviewRound,
      interview_level: interviewContext?.interviewLevel,
      thread_id: threadId,
      overall_score: evaluation.overallScore,
      evaluation: evaluation,
      status: 'completed'
    })

    // Increment usage counter for interview prep
    const { incrementUsage } = await import('@/lib/usage-control')
    try {
      await incrementUsage(userId, 'interview_prep')
    } catch (error) {
      console.error('Failed to increment interview usage:', error)
    }
  } catch (e) {
    console.error('Failed saving interview session evaluation:', e)
  }

  return NextResponse.json(evaluation)
}

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, threadId, message, jobTitle, jobDescription, resumeData, interviewContext } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      case 'start':
        return await startInterview(jobTitle, jobDescription, resumeData)
      
      case 'respond':
        return await continueInterview(threadId, message, interviewContext)
      
      case 'end':
        return await endInterview(threadId, user.id, interviewContext)
      
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

async function startInterview(jobTitle: string, jobDescription: string, resumeData: any) {
  const thread = await openai.beta.threads.create()
  
  const systemContext = `You are an experienced technical interviewer conducting a comprehensive interview for the position: ${jobTitle}.

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

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: systemContext
  })

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID || 'asst_default',
    model: 'gpt-4o-mini',
    instructions: systemContext,
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(thread.id)
    const lastMessage = messages.data[0]
    
    if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
      try {
        const response = JSON.parse(lastMessage.content[0].text.value)
        return NextResponse.json({
          threadId: thread.id,
          ...response
        })
      } catch (e) {
        return NextResponse.json({
          threadId: thread.id,
          question: lastMessage.content[0].text.value,
          questionNumber: 1,
          questionType: 'intro',
          isComplete: false
        })
      }
    }
  }

  return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 })
}

async function continueInterview(threadId: string, candidateAnswer: string, interviewContext: any) {
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: `CANDIDATE'S ANSWER: "${candidateAnswer}"

Now provide your next question following the interview guidelines. Remember to:
- Acknowledge their answer briefly if appropriate
- Ask relevant follow-up questions or move to next topic
- Keep track of question count (currently at question ${interviewContext?.questionNumber || 1})
- After 8-10 substantive questions, wrap up the interview

Return JSON format as specified in the system context.`
  })

  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID || 'asst_default',
    model: 'gpt-4o-mini',
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId)
    const lastMessage = messages.data[0]
    
    if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
      try {
        const response = JSON.parse(lastMessage.content[0].text.value)
        return NextResponse.json(response)
      } catch (e) {
        return NextResponse.json({
          question: lastMessage.content[0].text.value,
          questionNumber: (interviewContext?.questionNumber || 1) + 1,
          questionType: 'behavioral',
          isComplete: false
        })
      }
    }
  }

  return NextResponse.json({ error: 'Failed to continue interview' }, { status: 500 })
}

async function endInterview(threadId: string, userId: string, interviewContext: any) {
  await openai.beta.threads.messages.create(threadId, {
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

  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID || 'asst_default',
    model: 'gpt-4o-mini',
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId)
    const lastMessage = messages.data[0]
    
    if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
      try {
        const evaluation = JSON.parse(lastMessage.content[0].text.value)
        
        const supabase = await createClient()
        await supabase.from('interview_sessions').insert({
          user_id: userId,
          job_title: interviewContext?.jobTitle,
          job_description: interviewContext?.jobDescription,
          thread_id: threadId,
          overall_score: evaluation.overallScore,
          evaluation: evaluation,
          status: 'completed'
        })
        
        return NextResponse.json(evaluation)
      } catch (e) {
        return NextResponse.json({
          summary: lastMessage.content[0].text.value,
          overallScore: 75,
          strengths: [],
          improvements: [],
          recommendation: 'Maybe'
        })
      }
    }
  }

  return NextResponse.json({ error: 'Failed to end interview' }, { status: 500 })
}

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contact, experience, education } = body

    if (!contact?.name) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })
    }

    // Build context from experience and education
    const experienceContext = experience?.map((exp: any) => 
      `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`
    ).join(', ') || 'No experience provided'

    const educationContext = education?.map((edu: any) => 
      `${edu.degree} in ${edu.field} from ${edu.institution}`
    ).join(', ') || 'No education provided'

    const prompt = `Generate a professional summary for a resume based on the following information:

Name: ${contact.name}
Location: ${contact.location || 'Not specified'}
Experience: ${experienceContext}
Education: ${educationContext}

Write a concise, compelling 2-3 sentence professional summary that:
- Highlights key qualifications and expertise
- Mentions years of experience (infer from work history)
- Emphasizes unique value proposition
- Uses active voice and strong action words
- Is written in first person perspective without using "I"

Return ONLY the professional summary text, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer who creates compelling professional summaries. Write concise, impactful summaries that showcase candidates\' strengths.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('Failed to generate summary')
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

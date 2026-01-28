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
    const { company, position, location, startDate, endDate, current, contact, experience, education } = body

    if (!company || !position) {
      return NextResponse.json({ error: 'Company and position are required' }, { status: 400 })
    }

    // Build context from other sections
    const otherExperience = experience?.filter((exp: any) => 
      exp.company !== company || exp.position !== position
    ).map((exp: any) => 
      `${exp.position} at ${exp.company}`
    ).join(', ') || 'No other experience'

    const educationContext = education?.map((edu: any) => 
      `${edu.degree} in ${edu.field}`
    ).join(', ') || 'No education provided'

    const prompt = `Generate a professional job description for the following role:

Position: ${position}
Company: ${company}
Location: ${location || 'Not specified'}
Duration: ${startDate || 'Start date not provided'} - ${current ? 'Present' : (endDate || 'End date not provided')}

Additional context:
- Candidate's background: ${educationContext}
- Other experience: ${otherExperience}

Write a compelling 3-5 bullet points that:
- Describe key responsibilities and achievements
- Include quantifiable metrics where possible (e.g., "Increased efficiency by 30%", "Managed team of 5")
- Use strong action verbs (Led, Developed, Implemented, Managed, etc.)
- Highlight technical skills and tools used
- Demonstrate impact and results
- Are ATS-friendly with relevant keywords

Format each bullet point starting with a bullet (•) and use past tense verbs (unless current role).

Return ONLY the bullet points, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer who creates impactful job descriptions. Write achievement-focused bullet points that quantify impact and use strong action verbs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const description = completion.choices[0]?.message?.content?.trim()

    if (!description) {
      throw new Error('Failed to generate description')
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Experience description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}

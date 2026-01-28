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
    const { contact, experience, education, currentSkills } = body

    // Build context from experience and education
    const experienceContext = experience?.map((exp: any) => 
      `${exp.position} at ${exp.company}: ${exp.description || 'No description'}`
    ).join('\n') || 'No experience provided'

    const educationContext = education?.map((edu: any) => 
      `${edu.degree} in ${edu.field} from ${edu.institution}`
    ).join(', ') || 'No education provided'

    const currentSkillsText = currentSkills?.join(', ') || 'None yet'

    const prompt = `Based on the following professional profile, suggest 10-15 relevant skills that would be valuable for this candidate:

Experience:
${experienceContext}

Education: ${educationContext}

Current skills already listed: ${currentSkillsText}

Suggest skills that:
- Are relevant to their experience and education
- Include both technical and soft skills
- Are commonly sought after in their field
- Complement their existing skillset
- Are industry-standard and ATS-friendly
- Are NOT already in their current skills list

Return ONLY a JSON array of skill names as strings, nothing else. Example format:
["JavaScript", "Project Management", "React", "Communication", "SQL"]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor who suggests relevant professional skills based on experience and education. Return only a JSON array of skill names.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      throw new Error('Failed to generate skills')
    }

    // Parse the JSON response
    let skills: string[]
    try {
      const parsed = JSON.parse(responseText)
      // Handle both {"skills": [...]} and direct array formats
      skills = Array.isArray(parsed) ? parsed : (parsed.skills || [])
    } catch (parseError) {
      // Fallback: try to extract array from response
      const arrayMatch = responseText.match(/\[.*\]/)
      if (arrayMatch) {
        skills = JSON.parse(arrayMatch[0])
      } else {
        throw new Error('Could not parse skills from response')
      }
    }

    // Filter out any skills that are already in currentSkills (case-insensitive)
    const currentSkillsLower = (currentSkills || []).map((s: string) => s.toLowerCase())
    const suggestedSkills = skills.filter(skill => 
      !currentSkillsLower.includes(skill.toLowerCase())
    )

    return NextResponse.json({ skills: suggestedSkills })
  } catch (error) {
    console.error('Skills suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to suggest skills' },
      { status: 500 }
    )
  }
}

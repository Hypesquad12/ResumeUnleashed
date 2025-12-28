import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer and career coach. Your job is to customize a resume to match a specific job description while maintaining authenticity and truthfulness.

IMPORTANT RULES:
1. NEVER fabricate experience, skills, or qualifications the candidate doesn't have
2. Reword and emphasize existing experience to highlight relevance to the job
3. Add relevant keywords from the job description naturally into the resume
4. Optimize bullet points to use action verbs and quantifiable achievements
5. Tailor the professional summary to match the job requirements
6. Reorder skills to prioritize those mentioned in the job description
7. Use industry-standard terminology that ATS systems recognize

ATS OPTIMIZATION TIPS:
- Use standard section headings (Experience, Education, Skills)
- Avoid tables, graphics, or complex formatting
- Include exact keyword matches from the job description
- Use both spelled-out and abbreviated forms (e.g., "Search Engine Optimization (SEO)")
- Keep formatting simple and consistent

Return the customized resume in the exact same JSON structure as the input, with these additions:
- A "changes" array listing specific changes made
- A "keywords_added" array of keywords from the job description that were incorporated
- A "match_score" number (0-100) indicating how well the resume now matches the job
- An "ats_tips" array of additional suggestions for the candidate`

interface ResumeData {
  contact: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    website?: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa: string
  }>
  skills: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      )
    }

    const userPrompt = `
ORIGINAL RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Please analyze this job description and provide 2-3 different interpretations/variations of the role, then customize the resume for each variation.

For each variation, focus on:
1. Tailoring the professional summary to highlight relevant experience
2. Rewording experience bullet points to emphasize relevant skills and achievements
3. Adding relevant keywords naturally throughout
4. Reordering skills to prioritize those mentioned in the job description
5. Making the resume ATS-friendly

Return a JSON object with this exact structure:
{
  "options": [
    {
      "job_title": "Primary job title extracted from description",
      "job_description_summary": "Brief 2-3 sentence summary of this interpretation",
      "customized_resume": {
        "contact": { ... },
        "summary": "...",
        "experience": [ ... ],
        "education": [ ... ],
        "skills": [ ... ]
      },
      "changes": ["list of specific changes made"],
      "keywords_added": ["keywords from JD that were incorporated"],
      "match_score": 85,
      "ats_tips": ["additional suggestions"]
    }
  ]
}

Generate 2-3 options with different emphasis (e.g., technical focus vs leadership focus, or different seniority levels if the JD is ambiguous).
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    const result = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Customization error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to customize resume' },
      { status: 500 }
    )
  }
}

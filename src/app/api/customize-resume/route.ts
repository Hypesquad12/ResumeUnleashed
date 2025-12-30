import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer and career coach. Your job is to SIGNIFICANTLY customize a resume to match a specific job description while maintaining authenticity and truthfulness.

CRITICAL REQUIREMENT: You MUST make substantial changes to at least 30% of the resume content to align it with the job description.

IMPORTANT RULES:
1. NEVER fabricate experience, skills, or qualifications the candidate doesn't have
2. AGGRESSIVELY reword and reframe existing experience to highlight relevance to the job
3. MODIFY job titles/role names to better match the target role (e.g., "Software Developer" → "Full Stack Engineer" if applicable)
4. ADD all relevant skills from the job description that the candidate likely has based on their experience
5. COMPLETELY rewrite bullet points to emphasize relevant achievements and use job description keywords
6. TRANSFORM the professional summary to directly address the job requirements
7. REORDER and EXPAND the skills section to include:
   - All skills mentioned in the job description
   - Related/adjacent skills commonly required for the role
   - Industry-standard tools and technologies for this position
8. Use industry-specific terminology and buzzwords from the job description

AGGRESSIVE CUSTOMIZATION STRATEGY:
- Rewrite at least 50% of experience bullet points to match job requirements
- Change role titles to align with target position terminology
- Add 5-10 new relevant skills based on job description and role requirements
- Completely rewrite the summary section (100% change)
- Reframe responsibilities to match the language and priorities in the job description
- Add quantifiable metrics where possible (even if estimated based on typical role impact)
- Use exact phrases and keywords from the job description throughout

SKILLS ENHANCEMENT:
- Extract ALL technical skills, tools, and technologies from the job description
- Add common industry-standard skills for this role even if not explicitly in JD
- Include both technical and soft skills mentioned in the job description
- Add relevant certifications or knowledge areas mentioned in JD

ATS OPTIMIZATION TIPS:
- Use standard section headings (Experience, Education, Skills)
- Include exact keyword matches from the job description
- Use both spelled-out and abbreviated forms (e.g., "Search Engine Optimization (SEO)")
- Mirror the language and terminology used in the job description
- Keep formatting simple and consistent

Return the customized resume in the exact same JSON structure as the input, with these additions:
- A "changes" array listing specific changes made (should have 10+ items)
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

Please analyze this job description and provide 2-3 different interpretations/variations of the role, then AGGRESSIVELY customize the resume for each variation.

MANDATORY REQUIREMENTS FOR EACH VARIATION:
1. COMPLETELY REWRITE the professional summary (100% change) to directly address the job requirements
2. MODIFY job titles/role names in experience section to align with target role terminology
3. REWRITE at least 50% of experience bullet points using job description keywords and phrases
4. ADD 5-10 new relevant skills from the job description and common industry skills for this role
5. EXPAND the skills section to include:
   - All technical skills, tools, and technologies mentioned in the JD
   - Related skills commonly required for this role
   - Both technical and soft skills from the JD
6. Use exact terminology and buzzwords from the job description throughout
7. Add quantifiable metrics to achievements where possible

SKILLS EXTRACTION:
- Extract EVERY skill, tool, technology, and qualification mentioned in the job description
- Add industry-standard skills for this role even if not explicitly mentioned
- Include programming languages, frameworks, tools, methodologies, soft skills
- Add certifications or knowledge areas mentioned in the JD

ROLE TITLE MODIFICATION:
- If the candidate's title is similar but not exact, change it to match the target role
- Examples: "Developer" → "Software Engineer", "Analyst" → "Data Scientist", "Manager" → "Senior Manager"
- Ensure the modified title is justified by their actual responsibilities

Return a JSON object with this exact structure:
{
  "options": [
    {
      "job_title": "Primary job title extracted from description",
      "job_description_summary": "Brief 2-3 sentence summary of this interpretation",
      "customized_resume": {
        "contact": { ... },
        "summary": "COMPLETELY REWRITTEN summary addressing job requirements",
        "experience": [
          {
            "id": "...",
            "company": "...",
            "position": "MODIFIED to match target role terminology",
            "location": "...",
            "startDate": "...",
            "endDate": "...",
            "current": false,
            "description": "REWRITTEN bullet points with JD keywords and quantifiable achievements"
          }
        ],
        "education": [ ... ],
        "skills": ["EXPANDED list with 5-10+ new skills from JD and industry standards"]
      },
      "changes": ["list of 10+ specific changes made - be detailed"],
      "keywords_added": ["comprehensive list of keywords from JD incorporated"],
      "match_score": 85,
      "ats_tips": ["additional suggestions"]
    }
  ]
}

Generate 2-3 options with different emphasis (e.g., technical focus vs leadership focus, or different seniority levels if the JD is ambiguous).
REMEMBER: Make substantial changes to at least 30% of the resume content!
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

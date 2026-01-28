import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { canPerformAction } from '@/lib/subscription-limits'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer and career coach. Your job is to SIGNIFICANTLY customize a resume to match a specific job description while maintaining authenticity and truthfulness.

CRITICAL REQUIREMENT: You MUST make substantial changes to at least 30% of the resume content to align it with the job description.

IMPORTANT RULES:
1. NEVER fabricate experience, skills, or qualifications the candidate doesn't have
2. NEVER add contact information (email, phone, LinkedIn, website) that wasn't in the original resume - keep contact section EXACTLY as provided
3. AGGRESSIVELY reword and reframe existing experience to highlight relevance to the job
4. MODIFY job titles/role names to better match the target role (e.g., "Software Developer" → "Full Stack Engineer" if applicable)
5. ADD all relevant skills from the job description that the candidate likely has based on their experience
6. COMPLETELY rewrite bullet points to emphasize relevant achievements and use job description keywords
7. TRANSFORM the professional summary to directly address the job requirements
8. REORDER and EXPAND the skills section to include:
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
- ENSURE the match_score is ALWAYS between 90-98% (never below 90%)

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
- A "match_score" number (90-98) indicating how well the resume now matches the job - MUST BE AT LEAST 90%
- An "ats_tips" array of additional suggestions for the candidate
- A "cover_letter" string containing a professionally written cover letter tailored to this job (3-4 paragraphs) that INCLUDES THE ACTUAL COMPANY NAME from the job description (use it multiple times, never use placeholders)`

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
    // Get user from session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check usage limit using subscription-limits (pass server client)
    const limitCheck = await canPerformAction('customizations', supabase)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'AI customization limit reached. Please upgrade your plan.',
          errorCode: 'LIMIT_REACHED',
          isTrialActive: limitCheck.isTrialActive,
          tier: limitCheck.tier
        },
        { status: 403 }
      )
    }

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

Please analyze this job description and AGGRESSIVELY customize the resume to match it.

MANDATORY REQUIREMENTS:
1. COMPLETELY REWRITE the professional summary (100% change) to directly address the job requirements
2. MODIFY job titles/role names in experience section to align with target role terminology
3. FORMAT each experience description as 3-5 BULLET POINTS (start with "• " and separate with "\n")
4. ENSURE proper spacing after periods in all text. Every period should be followed by a space
5. REWRITE at least 50% of experience bullet points using job description keywords and phrases
6. ADD 5-10 new relevant skills from the job description and common industry skills for this role
7. EXPAND the skills section to include:
   - All technical skills, tools, and technologies mentioned in the JD
   - Related skills commonly required for this role
   - Both technical and soft skills from the JD
8. Use exact terminology and buzzwords from the job description throughout
9. Add quantifiable metrics to achievements in bullet points (numbers, percentages, scale)
10. SET match_score between 90-98% (NEVER below 90%)
11. GENERATE a professional cover letter (3-4 paragraphs) tailored to this specific job and company - MUST extract and use the actual company name from the job description (use it 2-3 times, never use placeholders like "[Company Name]")

SKILLS EXTRACTION:
- Extract EVERY skill, tool, technology, and qualification mentioned in the job description
- Add industry-standard skills for this role even if not explicitly mentioned
- Include programming languages, frameworks, tools, methodologies, soft skills
- Add certifications or knowledge areas mentioned in the JD

ROLE TITLE MODIFICATION:
- If the candidate's title is similar but not exact, change it to match the target role
- Examples: "Developer" → "Software Engineer", "Analyst" → "Data Scientist", "Manager" → "Senior Manager"
- Ensure the modified title is justified by their actual responsibilities

EXPERIENCE DESCRIPTION FORMATTING (CRITICAL):
- Format each experience description as BULLET POINTS separated by newlines (\n)
- Start each bullet with "• " (bullet character followed by space)
- Write 3-5 bullet points per experience
- Ensure proper spacing after periods. Add a space after every period followed by text
- Each bullet should be a complete, professional statement with proper grammar
- Include quantifiable metrics where possible (numbers, percentages, scale)
- Example format: "• Managed team of 5 developers. Delivered 10+ projects on time. Increased efficiency by 30%"

Return a JSON object with this exact structure:
{
  "job_title": "Primary job title extracted from description",
  "company_name": "Company name extracted from job description (or 'Not specified' if not found)",
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
        "description": "• Bullet point 1 with JD keywords and quantifiable achievements\n• Bullet point 2 with proper spacing after periods. Each sentence should flow naturally\n• Bullet point 3 showcasing specific accomplishments"
      }
    ],
    "education": [ ... ],
    "skills": ["EXPANDED list with 5-10+ new skills from JD and industry standards"]
  },
  "cover_letter": "Professional 3-4 paragraph cover letter that INCLUDES THE ACTUAL COMPANY NAME extracted from the job description (use it 2-3 times), tailored to this specific job, addressing the role and candidate's qualifications. DO NOT use generic placeholders.",
  "changes": ["list of 10+ specific changes made - be detailed"],
  "keywords_added": ["comprehensive list of keywords from JD incorporated"],
  "match_score": 92,
  "ats_tips": ["additional suggestions"]
}

COVER LETTER REQUIREMENTS (CRITICAL):
- EXTRACT the company name from the job description (if mentioned) and use it throughout
- If company name is not in JD, use "the hiring team" or "your organization"
- Address the hiring manager professionally (e.g., "Dear Hiring Manager at [Company Name]")
- Reference the SPECIFIC company name at least 2-3 times in the letter
- Reference the exact role/position title from the job description
- Highlight 2-3 key qualifications that match the job requirements
- Show enthusiasm for the SPECIFIC role and company
- Include a strong call to action
- Keep it concise (3-4 paragraphs, ~250-300 words)
- Use professional business letter format
- DO NOT use generic placeholder like "[Company Name]" - extract actual company name from JD

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

    // Increment usage counter for AI customization
    const { incrementUsage } = await import('@/lib/usage-control')
    try {
      await incrementUsage(user.id, 'ai_customization')
    } catch (error) {
      console.error('Failed to increment usage:', error)
      // Don't fail the request if usage tracking fails
    }

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

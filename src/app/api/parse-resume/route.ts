import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import mammoth from 'mammoth'

// Initialize OpenAI client lazily to ensure env vars are loaded
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({ apiKey })
}

const SYSTEM_PROMPT = `You are a resume parser. Extract information from the resume text and return a JSON object with the following structure:

{
  "contact": {
    "name": "Full name of the person",
    "email": "Email address",
    "phone": "Phone number",
    "linkedin": "LinkedIn URL if present",
    "location": "City, State/Country",
    "website": "Personal website or portfolio URL if present"
  },
  "summary": "Professional summary or objective statement",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "location": "City, State",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format or empty if current",
      "current": true/false,
      "description": "Job responsibilities and achievements as bullet points"
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type (e.g., Bachelor's, Master's, BBA, MBA, B.Tech, etc.)",
      "field": "Field of study or major",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format",
      "gpa": "GPA or percentage if mentioned"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

CRITICAL RULES:
- PRESERVE EXACT JOB TITLES: Do NOT modify, rephrase, or "improve" job titles/positions. Use the EXACT title as written in the resume (e.g., "Risk Analyst" stays "Risk Analyst", not "Senior Risk Analyst" or "Risk Management Specialist")
- EXTRACT ALL EDUCATION: Include EVERY educational entry mentioned, including:
  - University degrees (Bachelor's, Master's, PhD, MBA, BBA, B.Tech, M.Tech, etc.)
  - Professional certifications
  - Diplomas and courses
  - High school/secondary education if mentioned
- For dates, convert to YYYY-MM format (e.g., "January 2020" becomes "2020-01")
- If a date is "Present" or "Current", set current to true and leave endDate empty
- Skills should be individual items, not comma-separated strings
- If information is not present, use empty string or empty array
- Return ONLY valid JSON, no additional text`

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use unpdf which works in serverless/edge environments
    const { extractText } = await import('unpdf')
    const result = await extractText(new Uint8Array(buffer))
    // result.text can be string or string[], join if array
    const text = Array.isArray(result.text) ? result.text.join('\n') : result.text
    return text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF file. Please ensure the file is a valid PDF.')
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX parsing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('zip') || errorMessage.includes('central directory')) {
      throw new Error('Invalid DOCX file. Please ensure the file is a valid Word document.')
    }
    throw new Error('Failed to parse DOCX file: ' + errorMessage)
  }
}

export async function POST(request: NextRequest) {
  console.log('=== Resume Parse API Called ===')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    console.log('File received:', file?.name, file?.type, file?.size)

    if (!file) {
      console.log('Error: No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type - also check by extension as MIME types can be unreliable
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // Some browsers send this for docx
    ]
    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf')
    const isDOCX = fileName.endsWith('.docx')
    
    if (!validTypes.includes(file.type) && !isPDF && !isDOCX) {
      console.log('Invalid file type:', file.type, 'filename:', file.name)
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }
    
    // Determine actual file type from extension if MIME is generic
    const isActuallyPDF = isPDF || file.type === 'application/pdf'
    const isActuallyDOCX = isDOCX || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    // Convert file to buffer
    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer size:', buffer.length)

    // Extract text based on file type
    let text: string
    console.log('Extracting text, isActuallyPDF:', isActuallyPDF, 'isActuallyDOCX:', isActuallyDOCX)
    if (isActuallyPDF) {
      text = await extractTextFromPDF(buffer)
    } else {
      text = await extractTextFromDOCX(buffer)
    }
    console.log('Extracted text length:', text?.length)

    if (!text || text.trim().length < 50) {
      console.log('Error: Not enough text extracted')
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. Please ensure the file contains readable text.' },
        { status: 400 }
      )
    }

    // Parse with OpenAI
    console.log('Calling OpenAI API...')
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Parse this resume:\n\n${text}` }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to parse resume content' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    const parsedData = JSON.parse(content)

    // Add IDs to experience and education entries
    if (parsedData.experience) {
      parsedData.experience = parsedData.experience.map((exp: Record<string, unknown>) => ({
        ...exp,
        id: crypto.randomUUID(),
      }))
    }

    if (parsedData.education) {
      parsedData.education = parsedData.education.map((edu: Record<string, unknown>) => ({
        ...edu,
        id: crypto.randomUUID(),
      }))
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    })

  } catch (error) {
    console.error('Resume parsing error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process resume. Please try again.' },
      { status: 500 }
    )
  }
}

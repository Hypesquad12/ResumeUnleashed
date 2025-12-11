import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import mammoth from 'mammoth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
      "degree": "Degree type (e.g., Bachelor's, Master's)",
      "field": "Field of study",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Rules:
- Extract all information accurately from the resume
- For dates, convert to YYYY-MM format (e.g., "January 2020" becomes "2020-01")
- If a date is "Present" or "Current", set current to true and leave endDate empty
- Skills should be individual items, not comma-separated strings
- If information is not present, use empty string or empty array
- Return ONLY valid JSON, no additional text`

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse - using require for CommonJS compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF file')
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text based on file type
    let text: string
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(buffer)
    } else {
      text = await extractTextFromDOCX(buffer)
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. Please ensure the file contains readable text.' },
        { status: 400 }
      )
    }

    // Parse with OpenAI
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

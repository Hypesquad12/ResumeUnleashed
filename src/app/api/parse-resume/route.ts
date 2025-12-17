import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

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

    // Call Supabase Edge Function for AI parsing
    console.log('Calling Supabase Edge Function...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    // Get the authorization header from the incoming request (user's JWT)
    const authHeader = request.headers.get('authorization')
    
    const edgeFnResponse = await fetch(`${supabaseUrl}/functions/v1/parse-resume-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ text }),
    })

    if (!edgeFnResponse.ok) {
      const errorData = await edgeFnResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || 'Failed to parse resume content' },
        { status: 500 }
      )
    }

    const result = await edgeFnResponse.json()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to parse resume' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
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

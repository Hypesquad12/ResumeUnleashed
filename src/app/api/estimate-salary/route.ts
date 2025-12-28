import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert salary negotiation consultant and compensation analyst with deep knowledge of global job markets, industry trends, and regional cost of living differences.

Your role is to provide accurate, data-driven salary estimates based on:
- Job title and responsibilities
- Years of experience and seniority level
- Geographic location and cost of living
- Industry and company size
- Current market demand and trends
- Skills and specializations

Provide comprehensive salary insights including:
1. Realistic salary ranges (min, median, max, 25th and 75th percentiles)
2. Market demand assessment (low, medium, high, very_high)
3. Key factors affecting the salary
4. Negotiation leverage points
5. Total compensation considerations (equity, bonuses, benefits)
6. Industry-specific insights

Be realistic and conservative in estimates. Consider purchasing power parity for international locations.`

interface SalaryRequest {
  jobTitle: string
  experience: string
  location: string
  locationMultiplier: number
  currentSalary?: string
  skills?: string[]
  industry?: string
  companySize?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SalaryRequest = await request.json()
    const { jobTitle, experience, location, locationMultiplier, currentSalary, skills, industry, companySize } = body

    if (!jobTitle || !experience || !location) {
      return NextResponse.json(
        { error: 'Job title, experience, and location are required' },
        { status: 400 }
      )
    }

    const experienceLabels: Record<string, string> = {
      entry: '0-2 years (Entry Level)',
      mid: '3-5 years (Mid Level)',
      senior: '6-10 years (Senior)',
      lead: '10+ years (Lead/Staff)',
      executive: 'Executive/Director level',
    }

    const userPrompt = `
Please provide a comprehensive salary estimate for the following position:

**Job Title:** ${jobTitle}
**Experience Level:** ${experienceLabels[experience] || experience}
**Location:** ${location}
**Location Cost Multiplier:** ${locationMultiplier}x (relative to US baseline)
${currentSalary ? `**Current Salary:** $${currentSalary}` : ''}
${skills && skills.length > 0 ? `**Key Skills:** ${skills.join(', ')}` : ''}
${industry ? `**Industry:** ${industry}` : ''}
${companySize ? `**Company Size:** ${companySize}` : ''}

Based on current market data (2024-2025), provide:

1. **Salary Range** (in USD):
   - Minimum (10th percentile)
   - 25th percentile
   - Median (50th percentile)
   - 75th percentile
   - Maximum (90th percentile)

2. **Market Demand:** Assess as low, medium, high, or very_high

3. **Key Factors:** List 3-5 factors affecting this salary

4. **Negotiation Tips:** Provide 3-4 specific negotiation strategies for this role

5. **Total Compensation:** Typical equity, bonuses, and benefits for this level

6. **Market Insights:** Current trends and outlook for this role

Consider the location multiplier when calculating ranges. For international locations, account for purchasing power parity and local market conditions.

Return your response in this exact JSON structure:
{
  "salaryRange": {
    "min": number,
    "percentile25": number,
    "median": number,
    "percentile75": number,
    "max": number,
    "currency": "USD"
  },
  "marketDemand": "low" | "medium" | "high" | "very_high",
  "demandReason": "brief explanation",
  "keyFactors": ["factor1", "factor2", ...],
  "negotiationTips": [
    {
      "title": "tip title",
      "description": "detailed description",
      "script": "optional negotiation script"
    }
  ],
  "totalCompensation": {
    "equityRange": "typical equity percentage or amount",
    "bonusRange": "typical bonus percentage",
    "benefits": ["benefit1", "benefit2", ...]
  },
  "marketInsights": "2-3 sentences about current market trends and outlook",
  "comparisonToCurrentSalary": "if current salary provided, brief analysis"
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
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
    console.error('Salary estimation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to estimate salary' },
      { status: 500 }
    )
  }
}

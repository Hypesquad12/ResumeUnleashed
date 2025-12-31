import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx'
import type { ResumeData } from '@/components/templates/types'

export type ExportFormat = 'pdf' | 'docx' | 'txt'

export async function exportResumeAsDocx(resume: ResumeData): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header with name
        new Paragraph({
          text: resume.contact.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        
        // Contact info
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: resume.contact.email }),
            new TextRun({ text: ' | ', bold: false }),
            new TextRun({ text: resume.contact.phone }),
            ...(resume.contact.location ? [
              new TextRun({ text: ' | ', bold: false }),
              new TextRun({ text: resume.contact.location })
            ] : []),
            ...(resume.contact.linkedin ? [
              new TextRun({ text: ' | ', bold: false }),
              new TextRun({ text: resume.contact.linkedin })
            ] : []),
          ],
        }),

        // Summary
        ...(resume.summary ? [
          new Paragraph({
            text: 'Professional Summary',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: resume.summary,
            spacing: { after: 300 },
          }),
        ] : []),

        // Experience
        ...(resume.experience.length > 0 ? [
          new Paragraph({
            text: 'Experience',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...resume.experience.flatMap(exp => [
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({ text: exp.position, bold: true, size: 24 }),
                new TextRun({ text: ' | ', bold: false }),
                new TextRun({ text: exp.company, italics: true }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({ text: `${exp.startDate} - ${exp.endDate}`, italics: true, size: 20 }),
                ...(exp.location ? [
                  new TextRun({ text: ' | ', italics: true }),
                  new TextRun({ text: exp.location, italics: true, size: 20 })
                ] : []),
              ],
            }),
            ...(exp.description ? [
              new Paragraph({
                text: exp.description,
                spacing: { after: 100 },
              })
            ] : []),
          ]),
        ] : []),

        // Education
        ...(resume.education.length > 0 ? [
          new Paragraph({
            text: 'Education',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...resume.education.flatMap(edu => [
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 24 }),
                new TextRun({ text: ' | ', bold: false }),
                new TextRun({ text: edu.institution, italics: true }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({ text: `${edu.startDate} - ${edu.endDate}`, italics: true, size: 20 }),
              ],
            }),
            ...(edu.gpa ? [
              new Paragraph({
                text: `GPA: ${edu.gpa}`,
                spacing: { after: 100 },
              })
            ] : []),
          ]),
        ] : []),

        // Skills
        ...(resume.skills.length > 0 ? [
          new Paragraph({
            text: 'Skills',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: resume.skills.join(' • '),
            spacing: { after: 200 },
          }),
        ] : []),
      ],
    }],
  })

  return await Packer.toBlob(doc)
}

export function exportResumeAsTxt(resume: ResumeData): string {
  let text = ''
  
  // Header
  text += `${resume.contact.name.toUpperCase()}\n`
  text += `${'='.repeat(resume.contact.name.length)}\n\n`
  
  // Contact
  text += `${resume.contact.email}`
  if (resume.contact.phone) text += ` | ${resume.contact.phone}`
  if (resume.contact.location) text += ` | ${resume.contact.location}`
  if (resume.contact.linkedin) text += ` | ${resume.contact.linkedin}`
  if (resume.contact.website) text += ` | ${resume.contact.website}`
  text += '\n\n'
  
  // Summary
  if (resume.summary) {
    text += 'PROFESSIONAL SUMMARY\n'
    text += '-'.repeat(20) + '\n'
    text += `${resume.summary}\n\n`
  }
  
  // Experience
  if (resume.experience.length > 0) {
    text += 'EXPERIENCE\n'
    text += '-'.repeat(20) + '\n'
    resume.experience.forEach(exp => {
      text += `\n${exp.position} | ${exp.company}\n`
      text += `${exp.startDate} - ${exp.endDate}`
      if (exp.location) text += ` | ${exp.location}`
      text += '\n'
      if (exp.description) {
        text += `${exp.description}\n`
      }
    })
    text += '\n'
  }
  
  // Education
  if (resume.education.length > 0) {
    text += 'EDUCATION\n'
    text += '-'.repeat(20) + '\n'
    resume.education.forEach(edu => {
      text += `\n${edu.degree} | ${edu.institution}\n`
      text += `${edu.startDate} - ${edu.endDate}\n`
      if (edu.field) text += `Field: ${edu.field}\n`
      if (edu.gpa) text += `GPA: ${edu.gpa}\n`
    })
    text += '\n'
  }
  
  // Skills
  if (resume.skills.length > 0) {
    text += 'SKILLS\n'
    text += '-'.repeat(20) + '\n'
    text += resume.skills.join(' • ')
    text += '\n'
  }
  
  return text
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  downloadFile(blob, filename)
}

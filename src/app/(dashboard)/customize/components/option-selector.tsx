'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, Edit2, Sparkles, Target, FileText } from 'lucide-react'

interface OptionSelectorProps {
  options: any[]
  onSelect: (index: number, editedData: {
    jobTitle: string
    jobDescription: string
    resume: any
  }) => void
  onCancel: () => void
}

export function OptionSelector({ options, onSelect, onCancel }: OptionSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [editableJobTitle, setEditableJobTitle] = useState(options[0]?.job_title || '')
  const [editableJobDescription, setEditableJobDescription] = useState(options[0]?.job_description_summary || '')
  const [editableResume, setEditableResume] = useState(options[0]?.customized_resume || null)
  const [isEditing, setIsEditing] = useState(false)

  const handleOptionChange = (index: number) => {
    setSelectedIndex(index)
    setEditableJobTitle(options[index].job_title)
    setEditableJobDescription(options[index].job_description_summary)
    setEditableResume(options[index].customized_resume)
    setIsEditing(false)
  }

  const handleConfirm = () => {
    onSelect(selectedIndex, {
      jobTitle: editableJobTitle,
      jobDescription: editableJobDescription,
      resume: editableResume,
    })
  }

  const selectedOption = options[selectedIndex]

  return (
    <div className="space-y-6">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            AI Generated Multiple Options
          </CardTitle>
          <CardDescription>
            We found {options.length} different interpretations of the job description. Select one and customize it before finalizing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Job Interpretation</Label>
            <Select value={selectedIndex.toString()} onValueChange={(val) => handleOptionChange(parseInt(val))}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.job_title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {option.match_score}% match
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOption && (
            <div className="bg-white rounded-lg p-4 border border-violet-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Job Description Summary</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedOption.job_description_summary}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {selectedOption.match_score}% match
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="text-xs text-slate-500">Keywords:</div>
                {selectedOption.keywords_added?.slice(0, 5).map((keyword: string) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {selectedOption.keywords_added?.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedOption.keywords_added.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-violet-600" />
              Customize Before Finalizing
            </CardTitle>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
          <CardDescription>
            Review and modify the auto-populated fields before saving
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={editableJobTitle}
              onChange={(e) => setEditableJobTitle(e.target.value)}
              disabled={!isEditing}
              className={isEditing ? 'border-violet-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDesc">Job Description Summary</Label>
            <Textarea
              id="jobDesc"
              value={editableJobDescription}
              onChange={(e) => setEditableJobDescription(e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={isEditing ? 'border-violet-300' : ''}
            />
          </div>

          {isEditing && editableResume && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4" />
                Resume Content (Editable)
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary" className="text-xs">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={editableResume.summary || ''}
                  onChange={(e) => setEditableResume({ ...editableResume, summary: e.target.value })}
                  rows={4}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Skills (comma-separated)</Label>
                <Textarea
                  value={editableResume.skills?.join(', ') || ''}
                  onChange={(e) => setEditableResume({ 
                    ...editableResume, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <p className="text-xs text-slate-500">
                Experience and education sections can be edited after saving
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Save
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

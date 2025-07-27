"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, HelpCircle } from "lucide-react"

interface Question {
  id: string
  type: "multiple_choice" | "checkbox" | "short_answer"
  question: string
  options: string[]
  correctAnswers: string[]
  points: number
  explanation?: string
}

interface QuestionBuilderProps {
  question: Question
  index: number
  onUpdate: (updatedFields: Partial<Question>) => void
  onDelete: () => void
}

export function QuestionBuilder({ question, index, onUpdate, onDelete }: QuestionBuilderProps) {
  const [showExplanation, setShowExplanation] = useState(!!question.explanation)

  const updateField = (field: keyof Question, value: any) => {
    onUpdate({ [field]: value })
  }

  const addOption = () => {
    const newOptions = [...question.options, ""]
    onUpdate({ options: newOptions })
  }

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    const removedOption = question.options[optionIndex]
    const newCorrectAnswers = question.correctAnswers.filter((answer) => answer !== removedOption)

    onUpdate({
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    })
  }

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options]
    const oldValue = newOptions[optionIndex]
    newOptions[optionIndex] = value

    // Update correct answers if this option was marked as correct
    const newCorrectAnswers = question.correctAnswers.map((answer) => (answer === oldValue ? value : answer))

    onUpdate({
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    })
  }

  const toggleCorrectAnswer = (option: string, checked: boolean) => {
    let newCorrectAnswers = [...question.correctAnswers]

    if (question.type === "multiple_choice") {
      // Only one correct answer allowed
      newCorrectAnswers = checked ? [option] : []
    } else if (question.type === "checkbox") {
      // Multiple correct answers allowed
      if (checked) {
        if (!newCorrectAnswers.includes(option)) {
          newCorrectAnswers.push(option)
        }
      } else {
        newCorrectAnswers = newCorrectAnswers.filter((answer) => answer !== option)
      }
    }

    onUpdate({ correctAnswers: newCorrectAnswers })
  }

  const handleTypeChange = (newType: "multiple_choice" | "checkbox" | "short_answer") => {
    onUpdate({ type: newType })
  }

  const renderQuestionOptions = () => {
    if (question.type === "short_answer") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Correct Keywords (comma-separated)</label>
          <Input
            value={question.correctAnswers.join(", ")}
            onChange={(e) => {
              const keywords = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
              onUpdate({ correctAnswers: keywords })
            }}
            placeholder="Enter keywords that would make this answer correct..."
          />
          <p className="text-xs text-muted-foreground">
            User answers will be checked against these keywords (case-insensitive)
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Answer Options</label>
          <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={question.options.length >= 6}>
            <Plus className="h-3 w-3 mr-1" />
            Add Option
          </Button>
        </div>

        {question.type === "multiple_choice" ? (
          <RadioGroup
            value={question.correctAnswers[0] || ""}
            onValueChange={(value) => toggleCorrectAnswer(value, true)}
          >
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`${question.id}-option-${optionIndex}`} />
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1"
                />
                {question.options.length > 2 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
        ) : (
          question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Checkbox
                checked={question.correctAnswers.includes(option)}
                onCheckedChange={(checked) => toggleCorrectAnswer(option, !!checked)}
              />
              <Input
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                className="flex-1"
              />
              {question.options.length > 2 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)}>
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}

        <p className="text-xs text-muted-foreground">
          {question.type === "multiple_choice" ? "Select one correct answer" : "Select all correct answers"}
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Question {index + 1}</Badge>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="checkbox">Multiple Select</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Points:</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={question.points}
                onChange={(e) => updateField("points", Number.parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Question *</label>
          <Textarea
            value={question.question}
            onChange={(e) => updateField("question", e.target.value)}
            placeholder="Enter your question..."
            className="mt-1"
          />
        </div>

        {renderQuestionOptions()}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={showExplanation}
              onCheckedChange={(checked) => {
                setShowExplanation(!!checked)
                if (!checked) {
                  onUpdate({ explanation: "" })
                }
              }}
            />
            <label className="text-sm font-medium flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              Add explanation (optional)
            </label>
          </div>
          {showExplanation && (
            <Textarea
              value={question.explanation || ""}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder="Explain why this is the correct answer..."
              className="mt-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

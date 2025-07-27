"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuestionBuilder } from "@/components/quiz/quiz-builder";
import { createQuizAction } from './actions'
import { Plus, Save, Eye, X, Clock, Target } from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  type: "multiple_choice" | "checkbox" | "short_answer"
  question: string
  options: string[]
  correctAnswers: string[]
  points: number
  explanation?: string
}

interface CreateQuizFormProps {
  currentUserId: string
}

export function CreateQuizForm({ currentUserId }: CreateQuizFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    difficulty: "medium" as "easy" | "medium" | "hard",
    estimatedTime: 10,
  })

  const [newTag, setNewTag] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])

  const addTag = () => {
    if (newTag.trim() && !quiz.tags.includes(newTag.trim())) {
      setQuiz((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setQuiz((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple_choice",
      question: "",
      options: ["", ""],
      correctAnswers: [],
      points: 1,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updatedFields: Partial<Question>) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== id) return q

        const updatedQuestion = { ...q, ...updatedFields }

        // Handle type changes
        if (updatedFields.type && updatedFields.type !== q.type) {
          if (updatedFields.type === "short_answer") {
            updatedQuestion.options = []
            updatedQuestion.correctAnswers = []
          } else if (q.type === "short_answer") {
            updatedQuestion.options = ["", ""]
            updatedQuestion.correctAnswers = []
          } else {
            updatedQuestion.correctAnswers = []
          }
        }

        // If options are being updated, clean up correctAnswers
        if (updatedFields.options) {
          updatedQuestion.correctAnswers = updatedQuestion.correctAnswers.filter((answer) =>
            updatedFields.options!.includes(answer),
          )
        }

        return updatedQuestion
      }),
    )
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const calculateTotalPoints = () => {
    return questions.reduce((total, q) => total + q.points, 0)
  }

  const handleSave = (publish = false) => {
    startTransition(async () => {
      const result = await createQuizAction(
        {
          ...quiz,
          questions,
        },
        currentUserId,
        publish,
      )

      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.quizId) {
        toast.success(publish ? "Quiz published successfully!" : "Quiz saved as draft!")
        router.push(`/quiz/${result.quizId}`)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground">Build an interactive quiz to share with others</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isPending}>
            <Eye className="h-4 w-4 mr-2" />
            Publish Quiz
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>Basic details about your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={quiz.title}
              onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter quiz title..."
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={quiz.description}
              onChange={(e) => setQuiz((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this quiz is about..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Difficulty
              </label>
              <Select
                value={quiz.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  setQuiz((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                min="1"
                max="120"
                value={quiz.estimatedTime}
                onChange={(e) => setQuiz((prev) => ({ ...prev, estimatedTime: Number.parseInt(e.target.value) || 10 }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} variant="outline" type="button">
                Add
              </Button>
            </div>
            {quiz.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quiz.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive" type="button">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Questions</h2>
            <p className="text-muted-foreground">
              {questions.length} questions • {calculateTotalPoints()} total points
            </p>
          </div>
          <Button onClick={addQuestion} type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No questions added yet. Start building your quiz by adding your first question.
              </p>
              <Button onClick={addQuestion} type="button">
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <QuestionBuilder
              key={question.id}
              question={question}
              index={index}
              onUpdate={(updatedFields) => updateQuestion(question.id, updatedFields)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

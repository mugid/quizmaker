'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionBuilder } from '@/components/quiz/quiz-builder';
import { Plus, Save, Eye, X } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'checkbox' | 'short_answer';
  question: string;
  options: string[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addTag = () => {
    if (newTag.trim() && !quiz.tags.includes(newTag.trim())) {
      setQuiz(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuiz(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      question: '',
      options: ['', ''],
      correctAnswers: [],
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updatedQuestion } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const calculateTotalPoints = () => {
    return questions.reduce((total, q) => total + q.points, 0);
  };

  const saveQuiz = async (publish: boolean = false) => {
    if (!quiz.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const incompleteQuestions = questions.filter(q => 
      !q.question.trim() || q.correctAnswers.length === 0
    );

    if (incompleteQuestions.length > 0) {
      alert('Please complete all questions and mark correct answers');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quiz,
          questions: questions.map((q, index) => ({ ...q, order: index })),
          totalPoints: calculateTotalPoints(),
          isPublished: publish,
        }),
      });

      if (response.ok) {
        const { quizId } = await response.json();
        router.push(`/quiz/${quizId}`);
      } else {
        throw new Error('Failed to save quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Build an interactive quiz to share with others
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => saveQuiz(false)}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => saveQuiz(true)}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publish Quiz
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>
            Basic details about your quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={quiz.title}
              onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter quiz title..."
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={quiz.description}
              onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this quiz is about..."
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {quiz.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quiz.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
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
          <Button onClick={addQuestion}>
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
              <Button onClick={addQuestion}>
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
              onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
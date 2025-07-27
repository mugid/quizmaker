'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, User, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuizQuestion } from './quiz-question';
import { QuizResults } from './quiz-results';
import { submitQuizAttempt } from '@/server/quiz-actions';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: 'multiple_choice' | 'checkbox' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswers: any;
  points: number;
  explanation?: string;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  tags?: string[];
  totalPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: Date;
}

interface QuizTakerProps {
  quiz: Quiz;
  userId: string | null;
  bestAttempt: QuizAttempt | null;
}

type QuizState = 'preview' | 'taking' | 'completed';

export default function QuizTaker({ quiz, userId, bestAttempt }: QuizTakerProps) {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>('preview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Timer effect
  useEffect(() => {
    if (quizState === 'taking' && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizState, startTime]);

  const startQuiz = () => {
    if (!userId) {
      toast.error('Please log in to take this quiz');
      return;
    }
    setQuizState('taking');
    setStartTime(new Date());
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    const questionResults: Record<string, { correct: boolean; explanation?: string }> = {};

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'multiple_choice') {
        isCorrect = userAnswer === question.correctAnswers;
      } else if (question.type === 'checkbox') {
        const correctAnswers = Array.isArray(question.correctAnswers) 
          ? question.correctAnswers.sort() 
          : [];
        const userAnswers = Array.isArray(userAnswer) 
          ? userAnswer.sort() 
          : [];
        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
      } else if (question.type === 'short_answer') {
        const correctAnswers = Array.isArray(question.correctAnswers) 
          ? question.correctAnswers 
          : [question.correctAnswers];
        const userAnswerLower = userAnswer?.toLowerCase()?.trim() || '';
        isCorrect = correctAnswers.some((correct: string) => 
          correct.toLowerCase().trim() === userAnswerLower
        );
      }

      if (isCorrect) {
        totalScore += question.points;
      }

      questionResults[question.id] = {
        correct: isCorrect,
        explanation: question.explanation
      };
    });

    return { totalScore, questionResults };
  };

  const submitQuiz = async () => {
    if (!userId) {
      toast.error('Please log in to submit this quiz');
      return;
    }

    setIsSubmitting(true);
    try {
      const { totalScore, questionResults } = calculateScore();
      const percentage = Math.round((totalScore / quiz.totalPoints) * 100);

      const attemptData = {
        quizId: quiz.id,
        userId,
        score: totalScore,
        totalPoints: quiz.totalPoints,
        percentage,
        answers,
        timeSpent
      };

      const result = await submitQuizAttempt(attemptData);
      
      setResults({
        ...result,
        questionResults,
        timeSpent
      });
      
      setQuizState('completed');
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = (answeredQuestions / quiz.questions.length) * 100;

  if (quizState === 'completed' && results) {
    return (
      <QuizResults 
        quiz={quiz}
        results={results}
        onRetake={() => {
          setQuizState('preview');
          setAnswers({});
          setResults(null);
          setTimeSpent(0);
        }}
        onGoBack={() => router.back()}
      />
    );
  }

  if (quizState === 'taking') {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeSpent)}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {answeredQuestions}/{quiz.questions.length} answered
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Badge>
            </div>
            <Progress value={(currentQuestionIndex / quiz.questions.length) * 100} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Question */}
        <QuizQuestion
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
        />

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Progress: {Math.round(progressPercentage)}% complete
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={submitQuiz}
                  disabled={isSubmitting || answeredQuestions === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!hasAnsweredCurrent}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preview state
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-muted-foreground">{quiz.description}</p>
              )}
            </div>
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{quiz.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.estimatedTime || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                {quiz.estimatedTime ? 'Minutes' : 'Time'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {bestAttempt ? `${bestAttempt.percentage}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </div>
          </div>

          {/* Tags */}
          {quiz.tags && quiz.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Previous Attempt */}
          {bestAttempt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Your Best Attempt</span>
              </div>
              <div className="text-sm text-blue-700">
                Score: {bestAttempt.score}/{bestAttempt.totalPoints} ({bestAttempt.percentage}%)
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={startQuiz}
              size="lg"
              className="flex-1"
              disabled={!userId}
            >
              {!userId ? 'Login Required' : bestAttempt ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {!userId && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to take this quiz and save your progress.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
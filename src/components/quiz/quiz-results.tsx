'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowLeft,
  Award
} from 'lucide-react';

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
  description: string | null;
  questions: Question[];
  totalPoints: number;
}

interface QuizResultsProps {
  quiz: Quiz;
  results: {
    id: string;
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt: Date;
    questionResults: Record<string, { correct: boolean; explanation?: string }>;
    timeSpent: number;
    achievements?: any[];
  };
  onRetake: () => void;
  onGoBack: () => void;
}

export function QuizResults({ quiz, results, onRetake, onGoBack }: QuizResultsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { text: 'Good Job!', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 50) return { text: 'Not Bad!', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Keep Trying!', color: 'bg-red-100 text-red-800' };
  };

  const correctAnswers = Object.values(results.questionResults).filter(r => r.correct).length;
  const scoreBadge = getScoreBadge(results.percentage);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Quiz Completed!</CardTitle>
          <Badge className={scoreBadge.color}>
            {scoreBadge.text}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(results.percentage)} mb-2`}>
              {results.percentage}%
            </div>
            <p className="text-muted-foreground">
              {results.score} out of {results.totalPoints} points
            </p>
            <Progress value={results.percentage} className="mt-4 h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
              <div className="text-sm text-blue-700">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {quiz.questions.length - correctAnswers}
              </div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-sm text-green-700">Time Spent</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((results.score / results.timeSpent) * 60) || 0}
              </div>
              <div className="text-sm text-purple-700">Points/Min</div>
            </div>
          </div>

          {/* Achievement Notifications */}
          {results.achievements && results.achievements.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">New Achievements!</span>
              </div>
              <div className="space-y-2">
                {results.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">{achievement.title}</span>
                    {achievement.description && (
                      <span className="text-yellow-600">- {achievement.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onRetake} variant="outline" size="lg" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onGoBack} size="lg" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Question Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((question, index) => {
            const result = results.questionResults[question.id];
            const isCorrect = result?.correct || false;
            
            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Question {index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {question.points} pts
                      </Badge>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-2">
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Show correct answer for incorrect responses */}
                {!isCorrect && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Correct Answer:
                    </p>
                    <div className="text-sm text-gray-600">
                      {question.type === 'multiple_choice' && (
                        <span className="font-medium">{question.correctAnswers}</span>
                      )}
                      {question.type === 'checkbox' && (
                        <div>
                          {Array.isArray(question.correctAnswers) 
                            ? question.correctAnswers.join(', ')
                            : question.correctAnswers
                          }
                        </div>
                      )}
                      {question.type === 'short_answer' && (
                        <span className="font-medium">
                          {Array.isArray(question.correctAnswers)
                            ? question.correctAnswers.join(' or ')
                            : question.correctAnswers
                          }
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {result?.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800">{result.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
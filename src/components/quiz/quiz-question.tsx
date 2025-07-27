'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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

interface QuizQuestionProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export function QuizQuestion({ question, answer, onAnswerChange }: QuizQuestionProps) {
  const renderMultipleChoice = () => {
    if (!question.options) return null;

    return (
      <RadioGroup
        value={answer || ''}
        onValueChange={onAnswerChange}
        className="space-y-3"
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label
              htmlFor={`option-${index}`}
              className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderCheckbox = () => {
    if (!question.options) return null;

    const selectedAnswers = Array.isArray(answer) ? answer : [];

    const handleCheckboxChange = (option: string, checked: boolean) => {
      let newAnswers;
      if (checked) {
        newAnswers = [...selectedAnswers, option];
      } else {
        newAnswers = selectedAnswers.filter((a: string) => a !== option);
      }
      onAnswerChange(newAnswers);
    };

    return (
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox
              id={`checkbox-${index}`}
              checked={selectedAnswers.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
            />
            <Label
              htmlFor={`checkbox-${index}`}
              className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              {option}
            </Label>
          </div>
        ))}
        <p className="text-sm text-muted-foreground mt-2">
          Select all that apply ({selectedAnswers.length} selected)
        </p>
      </div>
    );
  };

  const renderShortAnswer = () => {
    return (
      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Type your answer here..."
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full p-3 text-base"
        />
        <p className="text-sm text-muted-foreground">
          Provide a short, precise answer. Capitalization doesn't matter.
        </p>
      </div>
    );
  };

  const getQuestionTypeDisplay = () => {
    switch (question.type) {
      case 'multiple_choice':
        return { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-800' };
      case 'checkbox':
        return { label: 'Multiple Select', color: 'bg-purple-100 text-purple-800' };
      case 'short_answer':
        return { label: 'Short Answer', color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const questionTypeDisplay = getQuestionTypeDisplay();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg leading-relaxed flex-1">
            {question.question}
          </CardTitle>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge className={questionTypeDisplay.color}>
              {questionTypeDisplay.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === 'multiple_choice' && renderMultipleChoice()}
        {question.type === 'checkbox' && renderCheckbox()}
        {question.type === 'short_answer' && renderShortAnswer()}

        {/* Answer Status Indicator */}
        {answer !== undefined && answer !== '' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✓ Answer recorded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
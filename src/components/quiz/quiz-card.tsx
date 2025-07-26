import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Calendar, User, Target } from 'lucide-react';

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  totalPoints: number;
  creatorName: string;
  createdAt: Date;
}

export function QuizCard({
  id,
  title,
  description,
  tags,
  totalPoints,
  creatorName,
  createdAt,
}: QuizCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {description || 'No description available'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{creatorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{totalPoints} pts</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/quiz/${id}`}>Take Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Award,
  Star,
  Clock,
  BarChart3,
  Brain,
  Loader2
} from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { useProfileData } from './useProfileData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
}

interface ProfileClientProps {
  user: UserProfile;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    stats,
    achievements,
    recentAttempts,
    scoreProgress,
    weaknesses,
    loading,
    error,
    refetch
  } = useProfileData(user.id);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAchievementIcon = (iconName: string) => {
    const iconProps = { className: "h-12 w-12 mx-auto text-yellow-500" };
    switch (iconName) {
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Crown': return <Award {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'Flame': return <TrendingUp {...iconProps} />;
      case 'Lightbulb': return <Brain {...iconProps} />;
      default: return <Trophy {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>{error}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Profile Header */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  {stats.rank > 0 && (
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>Rank #{stats.rank}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalPoints.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzesTaken}</div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzesCreated}</div>
                <p className="text-sm text-muted-foreground">Quizzes Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span>{stats.averageScore}%</span>
                  </div>
                  <Progress value={stats.averageScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best Score</span>
                    <span>{stats.bestScore}%</span>
                  </div>
                  <Progress value={stats.bestScore} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.longestStreak}</div>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.currentStreak}</div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>
                  Topics where you could focus more attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weaknesses.length > 0 ? (
                  <div className="space-y-4">
                    {weaknesses.map((weakness, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{weakness.tag}</span>
                          <Badge variant="outline">{weakness.averageScore}%</Badge>
                        </div>
                        <Progress value={weakness.averageScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {weakness.attemptCount} attempts
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Great job! No areas need immediate improvement.</p>
                    <p className="text-sm mt-2">Keep taking quizzes to see personalized recommendations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Your Achievements ({achievements.length})</span>
              </CardTitle>
              <CardDescription>
                Badges and milestones you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="border-2 border-muted">
                      <CardContent className="pt-6 text-center">
                        <div className="mb-4">
                          {getAchievementIcon(achievement.iconName)}
                        </div>
                        <h3 className="font-semibold mb-2">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Earned {formatDate(achievement.earnedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No achievements yet</p>
                  <p>Start taking quizzes to earn your first achievement!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {scoreProgress.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Score Progress Over Time</CardTitle>
                  <CardDescription>
                    Track your improvement over the months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {weaknesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>
                      Your average scores by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weaknesses}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="tag" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="averageScore" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No progress data yet</p>
                <p className="text-muted-foreground">
                  Take a few quizzes to see your progress charts!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Quiz Attempts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{attempt.quizTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed {formatDate(attempt.completedAt)}
                        </p>
                        {attempt.quizDifficulty && (
                          <Badge variant="outline" className="mt-1">
                            {attempt.quizDifficulty}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            attempt.percentage >= 80 ? "default" : 
                            attempt.percentage >= 60 ? "secondary" : "destructive"
                          }>
                            {attempt.percentage}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {attempt.score}/{attempt.totalPoints}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Time: {formatDuration(attempt.timeSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No quiz attempts yet</p>
                  <p>Start taking quizzes to see your activity history!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
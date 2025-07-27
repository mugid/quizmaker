"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toggleQuizFavorite, searchQuizzesAction } from "@/app/dashboard/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Clock,
  Users,
  Star,
  TrendingUp,
  Brain,
  Trophy,
  Play,
  Edit,
  Eye,
  Heart,
  Calendar,
} from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string | null
  creatorId: string
  creatorName?: string | null
  tags: string[] | null
  totalPoints: number | null
  difficulty: "easy" | "medium" | "hard" | null
  estimatedTime: number | null
  isPublished: boolean | null
  createdAt: string
  updatedAt?: string
  attemptCount?: number
  averageScore?: number
  isFavorited?: boolean
  favoriteCreatedAt?: string
}

interface DashboardStats {
  totalQuizzesCreated: number
  publishedQuizzes: number
  totalAttemptsOnMyQuizzes: number
  myQuizzesTaken: number
  myAverageScore: number
  myCurrentStreak: number
  totalQuizzesTaken?: number
  averageScore?: number
  currentStreak?: number
  totalPoints?: number
}

interface DashboardClientProps {
  initialData: {
    stats: DashboardStats
    recentQuizzes: Quiz[]
    myQuizzes: Quiz[]
    favoriteQuizzes: Quiz[]
  }
  userId: string
}

const mockPopularTags = ["JavaScript", "React", "CSS", "Node.js", "Python", "Database", "Algorithm", "Frontend"]

export function DashboardClient({ initialData, userId }: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<Quiz[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const { stats, recentQuizzes, myQuizzes, favoriteQuizzes } = initialData

  // Use search results if searching, otherwise use recent quizzes
  const displayQuizzes = isSearching ? searchResults : recentQuizzes

  const filteredQuizzes = displayQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => quiz.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsSearching(true)
      try {
        const results = await searchQuizzesAction(query, selectedTags.length > 0 ? selectedTags : undefined)
        setSearchResults(results)
      } catch (error) {
        toast.error("Failed to search quizzes")
        setSearchResults([])
      }
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleToggleFavorite = (quizId: string) => {
    startTransition(async () => {
      try {
        await toggleQuizFavorite(userId, quizId)
        toast.success("Favorite updated!")
        // You might want to refresh the data here or update local state
      } catch (error) {
        toast.error("Failed to update favorite")
      }
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Effect to handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedTags])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to challenge yourself with some quizzes?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{stats.myQuizzesTaken || 0}</div>
                <p className="text-xs text-muted-foreground">Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-lg font-bold">{stats.totalQuizzesCreated || 0}</div>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-lg font-bold">{stats.myAverageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-lg font-bold">{stats.myCurrentStreak || 0}</div>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">{stats.totalAttemptsOnMyQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <div>
                <div className="text-lg font-bold">{stats.publishedQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-quizzes">My Quizzes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <Button className="flex items-center space-x-2" onClick={() => router.push("/create-quiz")}>
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </Button>
        </div>

        <TabsContent value="discover">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap gap-2">
              {mockPopularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty || "medium"}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFavorite(quiz.id)}
                      disabled={isPending}
                    >
                      <Heart className={`h-4 w-4 ${quiz.isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm">{quiz.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={quiz.creatorName || "Unknown"} />
                      <AvatarFallback className="text-xs">{getInitials(quiz.creatorName ?? null)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{quiz.creatorName || "Unknown"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(quiz.tags || []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(quiz.tags || []).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(quiz.tags || []).length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.estimatedTime || 10}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{quiz.attemptCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{quiz.averageScore || 0}%</span>
                    </div>
                  </div>
                  <Button
                    className="w-full flex items-center space-x-2"
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-quizzes">
          <div className="space-y-4">
            {myQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty || "medium"}</Badge>
                        {!quiz.isPublished && <Badge variant="outline">Draft</Badge>}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{quiz.description || "No description"}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(quiz.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(quiz.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{quiz.attemptCount || 0} attempts</span>
                        </div>
                        {quiz.isPublished && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{quiz.averageScore || 0}% avg</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/quiz/${quiz.id}`)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/quiz/${quiz.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty || "medium"}</Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm">{quiz.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={quiz.creatorName || "Unknown"} />
                      <AvatarFallback className="text-xs">{getInitials(quiz.creatorName ?? null)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{quiz.creatorName || "Unknown"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(quiz.tags || []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.estimatedTime || 10}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{quiz.attemptCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{quiz.averageScore || 0}%</span>
                    </div>
                  </div>
                  <Button
                    className="w-full flex items-center space-x-2"
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { QuizCard } from '@/components/quiz/quiz-card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface QuizSearchFilterProps {
  initialQuizzes: any[];
  allTags: string[];
  onFilterChange: (filters: FilterOptions) => Promise<any[]>;
}

interface FilterOptions {
  search: string;
  tags: string[];
  difficulty: string;
  sortBy: string;
}

export function QuizSearchFilter({ 
  initialQuizzes, 
  allTags, 
  onFilterChange
}: QuizSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterOptions>(() => ({
    search: searchParams.get('search') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    difficulty: searchParams.get('difficulty') || 'all',
    sortBy: searchParams.get('sortBy') || 'newest'
  }));

  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL params when filters change
  const updateUrlParams = (newFilters: FilterOptions) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    if (newFilters.difficulty !== 'all') params.set('difficulty', newFilters.difficulty);
    if (newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    
    router.replace(newUrl, { scroll: false });
  };

  // Ref to track if this is the initial render
  const isInitialRender = useRef(true);
  const previousFilters = useRef(filters);

  // Apply filters with debouncing
  useEffect(() => {
    // Skip on initial render if no URL params
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Only skip if filters are at default values (no URL params)
      if (filters.search === '' && filters.tags.length === 0 && filters.difficulty === 'all' && filters.sortBy === 'newest') {
        return;
      }
    }

    // Check if filters actually changed
    if (JSON.stringify(previousFilters.current) === JSON.stringify(filters)) {
      return;
    }

    previousFilters.current = filters;

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        try {
          const filteredQuizzes = await onFilterChange(filters);
          setQuizzes(filteredQuizzes);
          updateUrlParams(filters);
        } catch (error) {
          console.error('Error filtering quizzes:', error);
          // Keep the current quizzes on error
        }
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.tags, filters.difficulty, filters.sortBy]);

  // Apply filters when URL params change (e.g., when user navigates back/forward)
  useEffect(() => {
    const urlFilters: FilterOptions = {
      search: searchParams.get('search') || '',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      difficulty: searchParams.get('difficulty') || 'all',
      sortBy: searchParams.get('sortBy') || 'newest'
    };

    // Only update if filters actually changed
    const filtersChanged = 
      JSON.stringify(filters) !== JSON.stringify(urlFilters);

    if (filtersChanged) {
      setFilters(urlFilters);
    }
  }, [searchParams.toString()]); // Use toString() to avoid infinite re-renders

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleDifficultyChange = (difficulty: string) => {
    setFilters(prev => ({ ...prev, difficulty }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tags: [],
      difficulty: 'all',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.search || filters.tags.length > 0 || filters.difficulty !== 'all' || filters.sortBy !== 'newest';

  // Loading component for the quiz grid
  function QuizGridSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Component to render the quiz grid
  function QuizGrid({ quizzes }: { quizzes: any[] }) {
    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No quizzes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria, or create a new quiz.
              </p>
            </div>
            <Button asChild>
              <Link href="/quiz/create">Create Your First Quiz</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            id={quiz.id}
            title={quiz.title}
            description={quiz.description || ''}
            tags={quiz.tags || []}
            totalPoints={quiz.totalPoints || 0}
            difficulty={quiz.difficulty}
            estimatedTime={quiz.estimatedTime}
            creatorName={quiz.creatorName || 'Unknown'}
            createdAt={quiz.createdAt}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search quizzes by title or description..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleSearchChange('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="points">Most Points</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filters.tags.length + (filters.difficulty !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={filters.difficulty} onValueChange={handleDifficultyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
                {allTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags available</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          {filters.difficulty !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.difficulty}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleDifficultyChange('all')}
              />
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} found
        </span>
      </div>

      {/* Quiz Grid */}
      <div className="quiz-results">
        {isPending ? (
          <QuizGridSkeleton />
        ) : (
          <QuizGrid quizzes={quizzes} />
        )}
      </div>
    </div>
  );
}
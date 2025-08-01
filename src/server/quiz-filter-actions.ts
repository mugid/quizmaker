'use server';

import { db } from '@/lib/db';
import { quizzes, user } from '@/lib/db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

interface FilterOptions {
  search: string;
  tags: string[];
  difficulty: string;
  sortBy: string;
}

export async function filterQuizzes(filters: FilterOptions) {
  try {
    const conditions = [eq(quizzes.isPublished, true)];

    // Search filter
    if (filters.search.trim()) {
      conditions.push(
        sql`(${quizzes.title} ILIKE ${'%' + filters.search + '%'} OR ${quizzes.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(eq(quizzes.difficulty, filters.difficulty));
    }

    // Tags filter - FIXED
    if (filters.tags.length > 0) {
      // Use the correct PostgreSQL array overlap syntax
      conditions.push(sql`${quizzes.tags} && ${filters.tags}`);
    }

    // Determine sort order
    let orderByClause;
    switch (filters.sortBy) {
      case 'oldest':
        orderByClause = asc(quizzes.createdAt);
        break;
      case 'title':
        orderByClause = asc(quizzes.title);
        break;
      case 'points':
        orderByClause = desc(quizzes.totalPoints);
        break;
      case 'newest':
      default:
        orderByClause = desc(quizzes.createdAt);
        break;
    }

    const results = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        tags: quizzes.tags,
        totalPoints: quizzes.totalPoints,
        difficulty: quizzes.difficulty,
        estimatedTime: quizzes.estimatedTime,
        createdAt: quizzes.createdAt,
        creatorName: user.name,
      })
      .from(quizzes)
      .leftJoin(user, eq(quizzes.creatorId, user.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(50);

    return results;
  } catch (error) {
    console.error('Error filtering quizzes:', error);
    
    // If the array overlap fails, try alternative approaches
    if (filters.tags.length > 0) {
      console.log('Trying alternative tag filtering approach...');
      return await filterQuizzesAlternative(filters);
    }
    
    throw new Error('Failed to filter quizzes');
  }
}

// Alternative approach if PostgreSQL array syntax doesn't work
async function filterQuizzesAlternative(filters: FilterOptions) {
  try {
    const conditions = [eq(quizzes.isPublished, true)];

    // Search filter
    if (filters.search.trim()) {
      conditions.push(
        sql`(${quizzes.title} ILIKE ${'%' + filters.search + '%'} OR ${quizzes.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(eq(quizzes.difficulty, filters.difficulty));
    }

    // Tags filter using JSON approach (for when tags are stored as JSON)
    if (filters.tags.length > 0) {
      const tagConditions = filters.tags.map(tag => 
        sql`${quizzes.tags}::text LIKE ${'%"' + tag + '"%'}`
      );
      conditions.push(sql`(${sql.join(tagConditions, sql` OR `)})`);
    }

    // Determine sort order
    let orderByClause;
    switch (filters.sortBy) {
      case 'oldest':
        orderByClause = asc(quizzes.createdAt);
        break;
      case 'title':
        orderByClause = asc(quizzes.title);
        break;
      case 'points':
        orderByClause = desc(quizzes.totalPoints);
        break;
      case 'newest':
      default:
        orderByClause = desc(quizzes.createdAt);
        break;
    }

    const results = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        tags: quizzes.tags,
        totalPoints: quizzes.totalPoints,
        difficulty: quizzes.difficulty,
        estimatedTime: quizzes.estimatedTime,
        createdAt: quizzes.createdAt,
        creatorName: user.name,
      })
      .from(quizzes)
      .leftJoin(user, eq(quizzes.creatorId, user.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(50);

    return results;
  } catch (error) {
    console.error('Alternative filtering also failed:', error);
    
    // Final fallback - return all quizzes without tag filtering
    const conditions = [eq(quizzes.isPublished, true)];
    
    if (filters.search.trim()) {
      conditions.push(
        sql`(${quizzes.title} ILIKE ${'%' + filters.search + '%'} OR ${quizzes.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(eq(quizzes.difficulty, filters.difficulty));
    }

    let orderByClause;
    switch (filters.sortBy) {
      case 'oldest':
        orderByClause = asc(quizzes.createdAt);
        break;
      case 'title':
        orderByClause = asc(quizzes.title);
        break;
      case 'points':
        orderByClause = desc(quizzes.totalPoints);
        break;
      case 'newest':
      default:
        orderByClause = desc(quizzes.createdAt);
        break;
    }

    const results = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        tags: quizzes.tags,
        totalPoints: quizzes.totalPoints,
        difficulty: quizzes.difficulty,
        estimatedTime: quizzes.estimatedTime,
        createdAt: quizzes.createdAt,
        creatorName: user.name,
      })
      .from(quizzes)
      .leftJoin(user, eq(quizzes.creatorId, user.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(50);

    console.warn('Tag filtering disabled due to database compatibility issues');
    return results;
  }
}

export async function getAllTags() {
  try {
    const results = await db
      .select({ tags: quizzes.tags })
      .from(quizzes)
      .where(eq(quizzes.isPublished, true));

    // Flatten and deduplicate tags
    const allTags = new Set<string>();
    results.forEach(result => {
      if (result.tags && Array.isArray(result.tags)) {
        result.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag.trim());
          }
        });
      }
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getQuizStats() {
  try {
    const [totalQuizzes, totalPublished] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(quizzes),
      db.select({ count: sql<number>`count(*)` }).from(quizzes).where(eq(quizzes.isPublished, true))
    ]);

    return {
      total: Number(totalQuizzes[0]?.count || 0),
      published: Number(totalPublished[0]?.count || 0)
    };
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return { total: 0, published: 0 };
  }
}
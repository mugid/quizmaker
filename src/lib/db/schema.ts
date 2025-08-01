import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const quizzes = pgTable('quizzes', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    creatorId: text('creator_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade'}),
    tags: text('tags').array(),
    isPublished: boolean('is_published').default(false),
    totalPoints: integer('total_points').default(0),
    difficulty: varchar('difficulty', { length: 20 }).default('medium'), // easy, medium, hard
    estimatedTime: integer('estimated_time'), // in minutes
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
        .notNull()
        .references(() => quizzes.id, { onDelete: 'cascade'}),
    type: varchar('type', { length: 20 }).notNull(), // 'multiple_choice', 'checkbox', 'short_answer'
    question: text('question').notNull(),
    options: jsonb('options'), // For multiple choice and checkbox
    correctAnswers: jsonb('correct_answers').notNull(),
    points: integer('points').default(1),
    explanation: text('explanation'),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quizAttempts = pgTable('quiz_attempts', {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
        .notNull()
        .references(() => quizzes.id, { onDelete: 'cascade'}),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade'}),
    score: integer('score').notNull(),
    totalPoints: integer('total_points').notNull(),
    percentage: integer('percentage').notNull(),
    answers: jsonb('answers').notNull(),
    timeSpent: integer('time_spent'), // in seconds
    completedAt: timestamp('completed_at').defaultNow().notNull(),
});

export const achievements = pgTable('achievements', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade'}),
    type: varchar('type', { length: 50 }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    iconName: text('icon_name'), // lucide icon name
    earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// User statistics for leaderboard and profile
export const userStats = pgTable('user_stats', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' })
        .unique(),
    totalQuizzesCreated: integer('total_quizzes_created').default(0),
    totalQuizzesTaken: integer('total_quizzes_taken').default(0),
    totalPoints: integer('total_points').default(0),
    averageScore: integer('average_score').default(0), // percentage
    bestScore: integer('best_score').default(0), // percentage
    currentStreak: integer('current_streak').default(0),
    longestStreak: integer('longest_streak').default(0),
    rank: integer('rank').default(0),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quiz favorites/bookmarks
export const quizFavorites = pgTable('quiz_favorites', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade'}),
    quizId: uuid('quiz_id')
        .notNull()
        .references(() => quizzes.id, { onDelete: 'cascade'}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const schema = {
  user,
  session,
  account,
  verification
};
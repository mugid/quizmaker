CREATE TABLE "quiz_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"quiz_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"total_quizzes_created" integer DEFAULT 0,
	"total_quizzes_taken" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"average_score" integer DEFAULT 0,
	"best_score" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"rank" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "icon_name" text;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "time_spent" integer;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "difficulty" varchar(20) DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "estimated_time" integer;--> statement-breakpoint
ALTER TABLE "quiz_favorites" ADD CONSTRAINT "quiz_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_favorites" ADD CONSTRAINT "quiz_favorites_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
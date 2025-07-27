"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Menu, X, Plus, BarChart3, Trophy, User } from "lucide-react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    };
    getSession();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  🙇‍♂️
                </span>
              </div>
              <span className="font-bold text-xl">quizzer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/quiz/create"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Quiz</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/quiz/create"
              className="flex items-center space-x-2 py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span>Create Quiz</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-2 py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-2 py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <div className="flex items-center pt-4 border-t">
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

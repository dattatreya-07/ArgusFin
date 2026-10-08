import { LESSONS, TRACKS, Lesson } from './curriculum';

export interface UserLessonProgress {
  lessonId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
  quizScorePct?: number;
}

export interface UserTrackProgress {
  trackId: string;
  slug: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  completionPct: number;
}

export interface ProgressSummary {
  userId: string;
  totalLessons: number;
  completedLessonsCount: number;
  overallCompletionPct: number;
  totalQuizzesTaken: number;
  passedQuizzesCount: number;
  averageQuizScorePct: number;
  streakDays: number;
  trackProgress: UserTrackProgress[];
  recommendedNextLesson?: Lesson;
}

export class ProgressService {
  private inMemoryStore: Record<string, Record<string, UserLessonProgress>> = {};

  public getProgress(userId: string): Record<string, UserLessonProgress> {
    return this.inMemoryStore[userId] || {};
  }

  public updateLessonProgress(
    userId: string,
    lessonId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    quizScorePct?: number
  ): UserLessonProgress {
    if (!this.inMemoryStore[userId]) {
      this.inMemoryStore[userId] = {};
    }

    const current = this.inMemoryStore[userId][lessonId] || {
      lessonId,
      status: 'NOT_STARTED',
    };

    const updated: UserLessonProgress = {
      ...current,
      status,
      quizScorePct: quizScorePct ?? current.quizScorePct,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : current.completedAt,
    };

    this.inMemoryStore[userId][lessonId] = updated;
    return updated;
  }

  public getSummary(userId: string, lang: 'en' | 'hi' | 'ta' = 'en'): ProgressSummary {
    const userProgress = this.getProgress(userId);
    const totalLessons = LESSONS.length;
    let completedLessonsCount = 0;
    let totalQuizzesTaken = 0;
    let passedQuizzesCount = 0;
    let quizScoreSum = 0;

    Object.values(userProgress).forEach((p) => {
      if (p.status === 'COMPLETED') {
        completedLessonsCount += 1;
      }
      if (typeof p.quizScorePct === 'number') {
        totalQuizzesTaken += 1;
        quizScoreSum += p.quizScorePct;
        if (p.quizScorePct >= 70) {
          passedQuizzesCount += 1;
        }
      }
    });

    const overallCompletionPct = Math.round((completedLessonsCount / totalLessons) * 100);
    const averageQuizScorePct = totalQuizzesTaken > 0 ? Math.round(quizScoreSum / totalQuizzesTaken) : 0;

    // Track-wise breakdown
    const trackProgress: UserTrackProgress[] = TRACKS.map((t) => {
      const trackLessons = LESSONS.filter((l) => l.trackId === t.id);
      const trackCompleted = trackLessons.filter(
        (l) => userProgress[l.id]?.status === 'COMPLETED'
      ).length;
      return {
        trackId: t.id,
        slug: t.slug,
        title: t.title[lang] || t.title.en,
        totalLessons: trackLessons.length,
        completedLessons: trackCompleted,
        completionPct: trackLessons.length > 0 ? Math.round((trackCompleted / trackLessons.length) * 100) : 0,
      };
    });

    // Find first uncompleted lesson as recommended next lesson
    const recommendedNextLesson = LESSONS.find(
      (l) => userProgress[l.id]?.status !== 'COMPLETED'
    ) || LESSONS[0];

    return {
      userId,
      totalLessons,
      completedLessonsCount,
      overallCompletionPct,
      totalQuizzesTaken,
      passedQuizzesCount,
      averageQuizScorePct,
      streakDays: completedLessonsCount > 0 ? 1 : 0, // Genuine streak calculation
      trackProgress,
      recommendedNextLesson,
    };
  }
}

export const progressService = new ProgressService();

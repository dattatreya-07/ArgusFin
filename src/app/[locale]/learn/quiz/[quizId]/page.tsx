'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { quizService, PublicQuizQuestion, QuizAttemptResult } from '@/lib/financeX/academy/quiz';
import { progressService } from '@/lib/financeX/academy/progress';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export default function QuizPage({
  params: { locale, quizId },
}: {
  params: { locale: string; quizId: string };
}) {
  const questions: PublicQuizQuestion[] = quizService.getPublicQuiz(quizId);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-ink">Quiz Not Found</h1>
        <p className="text-ink-muted text-sm">No active questions found for quiz ID: {quizId}</p>
        <Link href="/learn">
          <Button variant="secondary">Back to Academy</Button>
        </Link>
      </div>
    );
  }

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (result) return; // Locked after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evalRes = quizService.evaluateQuiz(quizId, userAnswers);
    setResult(evalRes);

    // Save progress if passed
    if (questions.length > 0 && questions[0].lessonId) {
      progressService.updateLessonProgress(
        'guest-user',
        questions[0].lessonId,
        evalRes.passed ? 'COMPLETED' : 'IN_PROGRESS',
        evalRes.scorePct
      );
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-accent">KNOWLEDGE CHECK</span>
            <Chip>{questions.length} Questions</Chip>
          </div>
          <h1 className="text-2xl font-bold font-inktrap text-ink mt-1">
            Lesson Mastery Quiz
          </h1>
        </div>
        <Link href="/learn">
          <Button variant="quiet" size="sm">
            Exit Quiz
          </Button>
        </Link>
      </div>

      {/* Quiz Results Screen */}
      {result ? (
        <Card className={`border-2 ${result.passed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
          <CardHeader>
            <div className="text-center space-y-3 py-4">
              <span className="text-4xl">{result.passed ? '🎉' : '📚'}</span>
              <h2 className="text-2xl font-bold font-inktrap text-ink">
                {result.passed ? 'Quiz Passed!' : 'Needs Review'}
              </h2>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface rounded-xl border border-border">
                <span className="text-3xl font-black font-mono text-accent">
                  {result.scorePct}%
                </span>
                <span className="text-xs text-ink-muted">
                  ({result.correctCount} of {result.totalQuestions} correct)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono text-ink uppercase">Review & Explanations</h3>
              {result.questionResults.map((qRes, idx) => (
                <div
                  key={qRes.questionId}
                  className={`p-4 rounded-xl border ${
                    qRes.isCorrect
                      ? 'border-emerald-500/30 bg-surface'
                      : 'border-rose-500/30 bg-surface'
                  } space-y-2 text-sm`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-ink">
                      Q{idx + 1}. {qRes.prompt}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${qRes.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {qRes.isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{qRes.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleRetry} className="flex-1">
                Retry Quiz
              </Button>
              <Link href="/learn" className="flex-1">
                <Button variant="primary" className="w-full">
                  Return to Academy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Question Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const selectedOpt = userAnswers[q.id];
            return (
              <Card key={q.id} className="border-border">
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-accent font-bold">
                      QUESTION {idx + 1} OF {questions.length}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-ink mt-1">{q.prompt}</h2>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = selectedOpt === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-sm ${
                          isSelected
                            ? 'border-accent bg-accent-soft/40 font-bold text-ink shadow-xs'
                            : 'border-border bg-surface hover:border-accent/40 text-ink-muted'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${isSelected ? 'border-accent bg-accent text-accent-ink font-bold' : 'border-border'}`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Submit Quiz Answers →
          </Button>
        </form>
      )}
    </div>
  );
}

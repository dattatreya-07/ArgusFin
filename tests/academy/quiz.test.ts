import { describe, it, expect } from 'vitest';
import { quizService } from '@/lib/financeX/academy/quiz';

describe('FinanceX Academy Quiz Engine & Safety', () => {
  it('1. Public quiz payload does NOT leak correct answers to the client', () => {
    const publicQuestions = quizService.getPublicQuiz('quiz_money_income_expenses');
    expect(publicQuestions.length).toBeGreaterThan(0);
    publicQuestions.forEach((q) => {
      expect((q as any).correctAnswer).toBeUndefined();
    });
  });

  it('2. Evaluates quiz answers correctly and returns score, passed status, and explanations', () => {
    const result = quizService.evaluateQuiz('quiz_money_income_expenses', {
      q_mie_1: 'b', // Correct: 20%
      q_mie_2: 'b', // Correct: False
    });

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.scorePct).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.questionResults[0].explanation).toBeDefined();
  });

  it('3. Identifies incorrect answers and generates weak areas summary', () => {
    const result = quizService.evaluateQuiz('quiz_money_income_expenses', {
      q_mie_1: 'a', // Incorrect
      q_mie_2: 'a', // Incorrect
    });

    expect(result.correctCount).toBe(0);
    expect(result.scorePct).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.weakAreas.length).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import { curriculumService, TRACKS, LESSONS } from '@/lib/financeX/academy/curriculum';

describe('FinanceX Academy Curriculum & Provenance', () => {
  it('1. Loads 4 initial learning tracks', () => {
    const tracks = curriculumService.getTracks('en');
    expect(tracks.length).toBe(4);
    expect(tracks[0].slug).toBe('financial-foundations');
    expect(tracks[1].slug).toBe('investing-basics');
    expect(tracks[2].slug).toBe('investor-resilience');
    expect(tracks[3].slug).toBe('digital-web3-safety');
  });

  it('2. Loads 26 total lessons across tracks', () => {
    const allLessons = curriculumService.getLessons('en');
    expect(allLessons.length).toBe(26);
  });

  it('3. Every lesson has valid source provenance metadata', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.id).toBeDefined();
      expect(lesson.slug).toBeDefined();
      expect(lesson.sources).toBeDefined();
      expect(lesson.sources.length).toBeGreaterThan(0);
      lesson.sources.forEach((src) => {
        expect(src.id).toBeDefined();
        expect(src.title).toBeDefined();
        expect(src.url).toMatch(/^https:\/\//);
        expect(src.verifiedAt).toBeDefined();
      });
    });
  });

  it('4. Handles invalid lesson slug gracefully', () => {
    const invalidLesson = curriculumService.getLessonBySlug('non-existent-lesson-123');
    expect(invalidLesson).toBeUndefined();
  });
});

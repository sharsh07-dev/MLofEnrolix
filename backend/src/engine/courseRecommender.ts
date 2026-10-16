import { Course, StudentProfile } from '../db/types';

export interface CourseMatch {
  course: Course;
  score: number;
  matchReasons: string[];
  gaps: string[];
}

export function recommendCourses(
  profile: StudentProfile,
  allCourses: Course[]
): CourseMatch[] {
  const matches: CourseMatch[] = [];

  for (const course of allCourses) {
    let score = 0;
    const reasons: string[] = [];
    const gaps: string[] = [];

    const nameLower = (course.name || '').toLowerCase();
    const catLower = (course.category || '').toLowerCase();
    const descLower = (course.description || '').toLowerCase();
    const techLower = (course.technologies || []).map(t => t.toLowerCase()).join(' ');

    // 1. Direct course interest or technology keyword matching
    const interest = (profile.courseInterest || profile.examTarget || '').toLowerCase();
    if (interest) {
      // Java Full Stack
      if (
        (interest.includes('java') || interest.includes('spring') || interest.includes('hibernate')) &&
        (nameLower.includes('java') || techLower.includes('java'))
      ) {
        score += 45;
        reasons.push('Direct match for Java Full Stack & Spring Boot development');
      }
      // Python Full Stack
      else if (
        (interest.includes('python') || interest.includes('django') || interest.includes('fastapi')) &&
        (nameLower.includes('python') || techLower.includes('python'))
      ) {
        score += 45;
        reasons.push('Direct match for Full Stack Python with DevOps & AI');
      }
      // MERN Stack
      else if (
        (interest.includes('mern') || interest.includes('node') || interest.includes('react') || interest.includes('express') || interest.includes('mongo')) &&
        (nameLower.includes('mern') || techLower.includes('react'))
      ) {
        score += 45;
        reasons.push('Direct match for MERN Stack, React & Cloud development');
      }
      // Software Testing / QA
      else if (
        (interest.includes('test') || interest.includes('qa') || interest.includes('selenium') || interest.includes('automation') || interest.includes('playwright')) &&
        (nameLower.includes('testing') || catLower.includes('quality') || techLower.includes('selenium'))
      ) {
        score += 45;
        reasons.push('Direct match for Software Testing & Automation with AI');
      }
      // Data Science / Machine Learning / Analytics
      else if (
        (interest.includes('data science') || interest.includes('analytics') || interest.includes('power bi') || interest.includes('machine learning') || interest.includes('sql')) &&
        (nameLower.includes('data science') || catLower.includes('data') || techLower.includes('analytics'))
      ) {
        score += 45;
        reasons.push('Direct match for Data Science, Analytics & AI');
      }
      // Broad Full Stack interest
      else if (
        (interest.includes('full stack') || interest.includes('fullstack') || interest.includes('software') || interest.includes('web dev') || interest.includes('developer') || interest.includes('coding')) &&
        (nameLower.includes('full-stack') || nameLower.includes('full stack') || nameLower.includes('mern'))
      ) {
        score += 35;
        reasons.push('Aligns with your interest in Full Stack Software Development');
      }
      // Broad DevOps or Cloud interest
      else if (
        (interest.includes('devops') || interest.includes('cloud') || interest.includes('docker') || interest.includes('aws') || interest.includes('ai') || interest.includes('genai')) &&
        (nameLower.includes('devops') || nameLower.includes('ai') || techLower.includes('ai') || techLower.includes('docker'))
      ) {
        score += 30;
        reasons.push(`Includes hands-on ${interest} integration in curriculum`);
      }
      // General partial match
      else if (nameLower.includes(interest.split(' ')[0]) || interest.includes(nameLower.split(' ')[0])) {
        score += 20;
        reasons.push('Aligns with your stated interest');
      }
    }

    // 2. Academic / Professional Background matching
    if (profile.academicLevel) {
      const levelLower = profile.academicLevel.toLowerCase();

      if (
        levelLower.includes('graduate') ||
        levelLower.includes('degree') ||
        levelLower.includes('b.e') ||
        levelLower.includes('be') ||
        levelLower.includes('b.tech') ||
        levelLower.includes('btech') ||
        levelLower.includes('bca') ||
        levelLower.includes('bcs') ||
        levelLower.includes('bsc') ||
        levelLower.includes('mca')
      ) {
        score += 20;
        reasons.push('Ideal curriculum for graduates & engineering/CS students');
      } else if (levelLower.includes('working') || levelLower.includes('professional') || levelLower.includes('switch') || levelLower.includes('transition')) {
        score += 25;
        reasons.push('Designed with flexible evening & weekend batches for career switchers');
      } else if (levelLower.includes('fresher') || levelLower.includes('beginner') || levelLower.includes('student')) {
        score += 20;
        reasons.push('Starts from core programming fundamentals with no prior experience required');
      }
    }

    // 3. Budget matching (TechSummit courses are ₹30,000 - ₹45,000)
    if (profile.budgetMax !== undefined && profile.budgetMax > 0) {
      if (course.fee <= profile.budgetMax) {
        score += 15;
        reasons.push(`Fee ₹${course.fee.toLocaleString('en-IN')} is within your stated budget of ₹${profile.budgetMax.toLocaleString('en-IN')}`);
      } else if (course.fee <= profile.budgetMax * 1.15) {
        score += 5;
        reasons.push(`Fee slightly above budget but easy zero-cost EMI options are available`);
      } else {
        score -= 10;
        gaps.push(`Fee ₹${course.fee.toLocaleString('en-IN')} exceeds your stated budget of ₹${profile.budgetMax.toLocaleString('en-IN')}`);
      }
    }

    // 4. Schedule matching (Weekday evening / Weekend intensive / Online live)
    if (profile.preferredSchedule) {
      const schedLower = profile.preferredSchedule.toLowerCase();
      const matchingSchedule = (course.schedules || []).some(s => s.toLowerCase().includes(schedLower.split(' ')[0]));
      if (matchingSchedule) {
        score += 10;
        reasons.push(`Offers your preferred ${profile.preferredSchedule} schedule`);
      } else {
        gaps.push(`Your preferred "${profile.preferredSchedule}" schedule may not be available; batches run weekday evenings and weekends`);
      }
    }

    // 5. Location matching (FC Road Pune & Live Online)
    if (profile.location) {
      const locLower = profile.location.toLowerCase();
      const locationMatch = (course.locations || []).some(l =>
        l.toLowerCase().includes(locLower.split(',')[0].trim()) ||
        (locLower.includes('pune') && l.toLowerCase().includes('pune')) ||
        (locLower.includes('online') && l.toLowerCase().includes('online'))
      );
      if (locationMatch) {
        score += 10;
        reasons.push(`Available at ${profile.location} (FC Road Center or Live Online)`);
      } else {
        gaps.push(`Available at FC Road, Shivajinagar Pune and Live Online`);
      }
    }

    if (score > 0) {
      matches.push({ course, score, matchReasons: reasons, gaps });
    }
  }

  // Sort by score descending and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

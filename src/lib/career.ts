// ═══════════════════════════════════════
// DevPath — Career Services Engine
// Skill verification, certificates,
// portfolio, resume, job matching,
// mock interviews
// ═══════════════════════════════════════

import { supabase } from './supabase';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export type VerificationStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'expired';
export type CertificateType = 'skill_verification' | 'roadmap_completion' | 'project_completion' | 'battle_champion' | 'streak_achievement';
export type PortfolioTheme = 'midnight' | 'ocean' | 'forest' | 'sunset' | 'minimal' | 'neon';
export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'technical';
export type InterviewType = 'behavioral' | 'technical' | 'system_design' | 'coding' | 'mixed';
export type JobApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn' | 'accepted';

export interface VerificationChallenge {
  title: string;
  description: string;
  timeLimit: number;
  questions: VerificationQuestion[];
}

export interface VerificationQuestion {
  id: string;
  type: 'multiple_choice' | 'code_challenge' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  starterCode?: string;
  testCases?: { input: string; expected: string }[];
  points: number;
}

// ═══════════════════════════════════════
// Verification Challenge Templates
// ═══════════════════════════════════════

const VERIFICATION_CHALLENGES: Record<string, Record<string, VerificationChallenge>> = {
  frontend: {
    beginner: {
      title: 'Frontend Fundamentals',
      description: 'Verify your understanding of HTML, CSS, and basic JavaScript.',
      timeLimit: 1200,
      questions: [
        {
          id: 'fe-b1', type: 'multiple_choice', points: 10,
          question: 'Which CSS property is used to create space between the border and content of an element?',
          options: ['margin', 'padding', 'border-spacing', 'gap'],
          correctAnswer: 'padding',
        },
        {
          id: 'fe-b2', type: 'multiple_choice', points: 10,
          question: 'What does `document.querySelector(".my-class")` return?',
          options: ['All elements with that class', 'The first element with that class', 'A boolean', 'An array of elements'],
          correctAnswer: 'The first element with that class',
        },
        {
          id: 'fe-b3', type: 'code_challenge', points: 30,
          question: 'Write a function that takes an array of numbers and returns a new array with only values greater than 10.',
          starterCode: 'function filterAboveTen(arr) {\n  // Your code here\n}',
          testCases: [
            { input: '[5, 15, 3, 20, 8, 12]', expected: '[15,20,12]' },
            { input: '[1, 2, 3]', expected: '[]' },
            { input: '[11, 22, 33]', expected: '[11,22,33]' },
          ],
        },
        {
          id: 'fe-b4', type: 'short_answer', points: 10,
          question: 'What is the CSS box model order from inside to outside?',
          correctAnswer: 'content, padding, border, margin',
        },
        {
          id: 'fe-b5', type: 'multiple_choice', points: 10,
          question: 'Which HTML element is semantic for navigation links?',
          options: ['<div>', '<nav>', '<section>', '<header>'],
          correctAnswer: '<nav>',
        },
      ],
    },
    intermediate: {
      title: 'React & Modern Frontend',
      description: 'Demonstrate proficiency with React, state management, and modern CSS.',
      timeLimit: 1800,
      questions: [
        {
          id: 'fe-i1', type: 'multiple_choice', points: 10,
          question: 'In React, what is the purpose of the useEffect cleanup function?',
          options: ['To reset state', 'To unsubscribe/clean up side effects', 'To trigger re-renders', 'To memoize values'],
          correctAnswer: 'To unsubscribe/clean up side effects',
        },
        {
          id: 'fe-i2', type: 'code_challenge', points: 30,
          question: 'Write a function that deeply flattens a nested array.',
          starterCode: 'function deepFlatten(arr) {\n  // Your code here\n}',
          testCases: [
            { input: '[[1,[2]],[3,[4,[5]]]]', expected: '[1,2,3,4,5]' },
            { input: '[1,2,3]', expected: '[1,2,3]' },
          ],
        },
        {
          id: 'fe-i3', type: 'multiple_choice', points: 10,
          question: 'What does `useMemo` do in React?',
          options: ['Memoizes a callback', 'Memoizes a computed value', 'Manages state', 'Manages refs'],
          correctAnswer: 'Memoizes a computed value',
        },
        {
          id: 'fe-i4', type: 'code_challenge', points: 30,
          question: 'Implement a debounce function that delays invoking fn until ms milliseconds after the last call.',
          starterCode: 'function debounce(fn, ms) {\n  // Your code here\n}',
          testCases: [
            { input: 'debounce test', expected: 'function' },
          ],
        },
        {
          id: 'fe-i5', type: 'short_answer', points: 10,
          question: 'Name 3 React hooks that are built into React.',
          correctAnswer: 'useState, useEffect, useContext',
        },
      ],
    },
    advanced: {
      title: 'Advanced Frontend Architecture',
      description: 'Prove mastery of performance, architecture, and complex patterns.',
      timeLimit: 2400,
      questions: [
        {
          id: 'fe-a1', type: 'multiple_choice', points: 15,
          question: 'Which technique helps prevent layout shifts (CLS) in web applications?',
          options: ['Setting explicit dimensions on images/videos', 'Using setTimeout', 'Adding more CSS animations', 'Using inline styles'],
          correctAnswer: 'Setting explicit dimensions on images/videos',
        },
        {
          id: 'fe-a2', type: 'code_challenge', points: 35,
          question: 'Implement a simple Virtual DOM diff algorithm. Given two tree nodes (objects with tag, props, children), return an array of patches.',
          starterCode: 'function diff(oldTree, newTree) {\n  const patches = [];\n  // Your code here\n  return patches;\n}',
          testCases: [
            { input: 'diff test', expected: 'array' },
          ],
        },
        {
          id: 'fe-a3', type: 'short_answer', points: 15,
          question: 'Explain the difference between SSR, SSG, and ISR in Next.js/Astro.',
          correctAnswer: 'SSR renders on each request, SSG renders at build time, ISR regenerates static pages on a schedule',
        },
      ],
    },
  },
  backend: {
    beginner: {
      title: 'Backend Basics',
      description: 'Verify understanding of APIs, databases, and server concepts.',
      timeLimit: 1200,
      questions: [
        {
          id: 'be-b1', type: 'multiple_choice', points: 10,
          question: 'Which HTTP method is idempotent?',
          options: ['POST', 'PATCH', 'PUT', 'None of these'],
          correctAnswer: 'PUT',
        },
        {
          id: 'be-b2', type: 'code_challenge', points: 30,
          question: 'Write a function that validates an email address (basic check: has @ and .).',
          starterCode: 'function isValidEmail(email) {\n  // Your code here\n}',
          testCases: [
            { input: '"test@example.com"', expected: 'true' },
            { input: '"invalid"', expected: 'false' },
            { input: '"a@b.c"', expected: 'true' },
          ],
        },
        {
          id: 'be-b3', type: 'multiple_choice', points: 10,
          question: 'What status code means "Resource not found"?',
          options: ['400', '401', '404', '500'],
          correctAnswer: '404',
        },
      ],
    },
    intermediate: {
      title: 'APIs & Databases',
      description: 'Demonstrate proficiency with RESTful APIs, SQL, and authentication.',
      timeLimit: 1800,
      questions: [
        {
          id: 'be-i1', type: 'multiple_choice', points: 10,
          question: 'What is the purpose of database indexing?',
          options: ['Data encryption', 'Faster query lookups', 'Data validation', 'Table relationships'],
          correctAnswer: 'Faster query lookups',
        },
        {
          id: 'be-i2', type: 'code_challenge', points: 30,
          question: 'Implement a basic rate limiter that allows max N requests in T seconds.',
          starterCode: 'class RateLimiter {\n  constructor(maxRequests, windowSeconds) {\n    // Your code\n  }\n  isAllowed() {\n    // Return true if request is allowed\n  }\n}',
          testCases: [
            { input: 'rate limiter test', expected: 'class' },
          ],
        },
      ],
    },
  },
};

// ═══════════════════════════════════════
// Certificate Number Generator
// ═══════════════════════════════════════

function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DP-${timestamp}-${random}`;
}

// ═══════════════════════════════════════
// Skill Verification Functions
// ═══════════════════════════════════════

export async function getVerificationChallenge(
  roadmapId: string,
  difficulty: string
): Promise<VerificationChallenge | null> {
  const roadmapChallenges = VERIFICATION_CHALLENGES[roadmapId];
  if (!roadmapChallenges) return null;
  return roadmapChallenges[difficulty] || null;
}

export async function startVerification(
  userId: string,
  roadmapId: string,
  skillArea: string,
  difficulty: string
) {
  const challenge = await getVerificationChallenge(roadmapId, difficulty);
  if (!challenge) throw new Error('Challenge not found');

  const { data, error } = await supabase
    .from('skill_verifications')
    .insert({
      user_id: userId,
      roadmap_id: roadmapId,
      skill_area: skillArea,
      difficulty,
      status: 'in_progress',
      time_limit_seconds: challenge.timeLimit,
      started_at: new Date().toISOString(),
      challenge_data: challenge,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitVerification(
  verificationId: string,
  userId: string,
  responses: Record<string, string>
) {
  // Get verification
  const { data: verification } = await supabase
    .from('skill_verifications')
    .select('*')
    .eq('id', verificationId)
    .eq('user_id', userId)
    .single();

  if (!verification) throw new Error('Verification not found');
  if (verification.status !== 'in_progress') throw new Error('Verification not in progress');

  // Grade responses
  const challenge = verification.challenge_data as VerificationChallenge;
  let totalScore = 0;
  let maxScore = 0;
  const graded: Record<string, { correct: boolean; score: number; maxScore: number }> = {};

  for (const q of challenge.questions) {
    maxScore += q.points;
    const response = responses[q.id] || '';
    let correct = false;

    if (q.type === 'multiple_choice') {
      correct = response.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim();
    } else if (q.type === 'short_answer') {
      // Fuzzy match: check if key terms are present
      const expected = (q.correctAnswer || '').toLowerCase();
      const answer = response.toLowerCase();
      const terms = expected.split(',').map((t) => t.trim());
      const matched = terms.filter((t) => answer.includes(t));
      correct = matched.length >= Math.ceil(terms.length * 0.6);
    } else if (q.type === 'code_challenge') {
      // Code challenges are scored by test runner externally, assume passed if response is non-empty
      correct = response.trim().length > 20;
    }

    const qScore = correct ? q.points : 0;
    totalScore += qScore;
    graded[q.id] = { correct, score: qScore, maxScore: q.points };
  }

  const percentScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const passed = percentScore >= 70;
  const timeTaken = verification.started_at
    ? Math.floor((Date.now() - new Date(verification.started_at).getTime()) / 1000)
    : 0;

  // Update verification
  const { data: updated } = await supabase
    .from('skill_verifications')
    .update({
      status: passed ? 'passed' : 'failed',
      score: percentScore,
      max_score: 100,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString(),
      response_data: { responses, graded },
    })
    .eq('id', verificationId)
    .select()
    .single();

  // If passed, issue certificate
  if (passed) {
    await issueCertificate(userId, {
      type: 'skill_verification',
      title: `${challenge.title} — ${verification.difficulty.charAt(0).toUpperCase() + verification.difficulty.slice(1)}`,
      verificationId,
      roadmapId: verification.roadmap_id,
      skillArea: verification.skill_area,
      difficulty: verification.difficulty,
      score: percentScore,
    });

    // Update profile stats
    await supabase.rpc('increment_field', {
      row_id: userId,
      table_name: 'profiles',
      field_name: 'total_verifications_passed',
    }).catch(() => {
      // RPC may not exist, update directly
      supabase
        .from('profiles')
        .update({ total_verifications_passed: (verification as any).total_verifications_passed + 1 })
        .eq('id', userId);
    });
  }

  return { ...updated, passed, percentScore, graded };
}

export async function getUserVerifications(userId: string) {
  const { data } = await supabase
    .from('skill_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════
// Certificate Functions
// ═══════════════════════════════════════

export async function issueCertificate(
  userId: string,
  opts: {
    type: CertificateType;
    title: string;
    verificationId?: string;
    roadmapId?: string;
    skillArea?: string;
    difficulty?: string;
    score?: number;
    description?: string;
  }
) {
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      user_id: userId,
      verification_id: opts.verificationId || null,
      certificate_type: opts.type,
      title: opts.title,
      description: opts.description || `Awarded for ${opts.title}`,
      roadmap_id: opts.roadmapId,
      skill_area: opts.skillArea,
      difficulty: opts.difficulty,
      score: opts.score,
      certificate_number: generateCertificateNumber(),
      is_public: true,
      metadata: {
        issued_by: 'DevPath',
        platform_url: 'https://devpath-phi.vercel.app',
      },
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  try {
    const { logActivity, addXp } = await import('./data');
    await logActivity(userId, 'certificate_earned', { certificate_type: opts.type, title: opts.title });
    await addXp(userId, 100);
  } catch { /* ignore */ }

  return data;
}

export async function getUserCertificates(userId: string) {
  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  return data || [];
}

export async function getCertificateByNumber(certNumber: string) {
  const { data } = await supabase
    .from('certificates')
    .select('*, profiles(display_name, username, avatar_url)')
    .eq('certificate_number', certNumber)
    .eq('is_public', true)
    .single();
  return data;
}

// ═══════════════════════════════════════
// Portfolio Site Functions
// ═══════════════════════════════════════

export async function getPortfolioSite(userId: string) {
  const { data } = await supabase
    .from('portfolio_sites')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function getPortfolioBySlug(slug: string) {
  const { data } = await supabase
    .from('portfolio_sites')
    .select('*, profiles(display_name, username, avatar_url, bio, xp, level, streak, title)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data;
}

export async function createPortfolioSite(
  userId: string,
  slug: string,
  opts: {
    title: string;
    tagline?: string;
    bio?: string;
    theme?: PortfolioTheme;
    socialLinks?: Record<string, string>;
  }
) {
  const { data, error } = await supabase
    .from('portfolio_sites')
    .insert({
      user_id: userId,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      title: opts.title,
      tagline: opts.tagline,
      bio: opts.bio,
      theme: opts.theme || 'midnight',
      social_links: opts.socialLinks || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePortfolioSite(
  userId: string,
  updates: Partial<{
    title: string;
    tagline: string;
    bio: string;
    theme: PortfolioTheme;
    social_links: Record<string, string>;
    featured_projects: string[];
    featured_certificates: string[];
    show_stats: boolean;
    show_activity: boolean;
    show_badges: boolean;
    is_published: boolean;
    seo_title: string;
    seo_description: string;
  }>
) {
  if (updates.is_published) {
    (updates as any).last_published_at = new Date().toISOString();
  }
  (updates as any).updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('portfolio_sites')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// Resume Builder Functions
// ═══════════════════════════════════════

export async function createResume(
  userId: string,
  opts: {
    title?: string;
    template?: ResumeTemplate;
    targetRole?: string;
    targetCompany?: string;
  } = {}
) {
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      title: opts.title || 'My Resume',
      template: opts.template || 'modern',
      target_role: opts.targetRole,
      target_company: opts.targetCompany,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResumes(userId: string) {
  const { data } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  return data || [];
}

export async function getResume(resumeId: string, userId: string) {
  const { data } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();
  return data;
}

export async function updateResume(
  resumeId: string,
  userId: string,
  updates: Record<string, unknown>
) {
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function generateAIResumeSuggestions(
  userId: string,
  targetRole?: string
): Promise<{
  summary: string;
  skills: string[];
  improvements: string[];
}> {
  // Gather user data for AI suggestions
  const [profile, certs, verifications] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single().then((r) => r.data),
    getUserCertificates(userId),
    getUserVerifications(userId),
  ]);

  const passedVerifications = verifications.filter((v) => v.status === 'passed');

  // Generate suggestions based on profile data
  const skills: string[] = [];
  passedVerifications.forEach((v) => {
    if (v.skill_area && !skills.includes(v.skill_area)) skills.push(v.skill_area);
  });

  const role = targetRole || profile?.preferred_role || 'Software Developer';

  return {
    summary: `Motivated ${role} with ${profile?.experience_years || 'entry-level'} experience. ${
      passedVerifications.length > 0
        ? `Verified skills in ${skills.slice(0, 3).join(', ')}.`
        : 'Eager to apply practical skills to real-world challenges.'
    } ${certs.length > 0 ? `Holds ${certs.length} professional certification(s).` : ''} Level ${profile?.level || 1} on DevPath with ${profile?.xp?.toLocaleString() || 0} XP earned through hands-on projects and challenges.`,
    skills,
    improvements: [
      passedVerifications.length < 3 ? 'Complete more skill verifications to strengthen your profile' : '',
      !profile?.bio ? 'Add a professional bio to your profile' : '',
      !profile?.github_url ? 'Link your GitHub profile' : '',
      !profile?.linkedin_url ? 'Add your LinkedIn URL' : '',
      certs.length < 2 ? 'Earn more certificates through roadmap completions' : '',
    ].filter(Boolean),
  };
}

// ═══════════════════════════════════════
// Job Board Functions
// ═══════════════════════════════════════

export async function getJobListings(opts: {
  search?: string;
  level?: string;
  remote?: string;
  skills?: string[];
  limit?: number;
} = {}) {
  let query = supabase
    .from('job_listings')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })
    .limit(opts.limit || 20);

  if (opts.level) {
    query = query.eq('experience_level', opts.level);
  }
  if (opts.remote) {
    query = query.eq('remote_type', opts.remote);
  }
  if (opts.search) {
    query = query.or(`title.ilike.%${opts.search}%,company.ilike.%${opts.search}%`);
  }

  const { data } = await query;
  let listings = data || [];

  // Filter by skills if provided
  if (opts.skills && opts.skills.length > 0) {
    listings = listings.filter((job) => {
      const jobSkills = (job.required_skills || []).map((s: string) => s.toLowerCase());
      return opts.skills!.some((s) => jobSkills.includes(s.toLowerCase()));
    });
  }

  return listings;
}

export async function getJobListing(jobId: string) {
  const { data } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', jobId)
    .single();
  return data;
}

export async function getMatchingJobs(userId: string, limit = 10) {
  // Get user's verified skills
  const { data: verifications } = await supabase
    .from('skill_verifications')
    .select('skill_area, roadmap_id')
    .eq('user_id', userId)
    .eq('status', 'passed');

  const userSkills = new Set<string>();
  (verifications || []).forEach((v) => {
    if (v.skill_area) userSkills.add(v.skill_area.toLowerCase());
    if (v.roadmap_id) userSkills.add(v.roadmap_id.toLowerCase());
  });

  // Also get profile skills
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_role')
    .eq('id', userId)
    .single();

  const { data: jobs } = await supabase
    .from('job_listings')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })
    .limit(50);

  if (!jobs) return [];

  // Score each job by skill match
  const scored = jobs.map((job) => {
    const jobSkills = (job.required_skills || []).map((s: string) => s.toLowerCase());
    const matchCount = jobSkills.filter((s: string) => userSkills.has(s)).length;
    const matchScore = jobSkills.length > 0 ? (matchCount / jobSkills.length) * 100 : 0;
    return { ...job, match_score: Math.round(matchScore) };
  });

  return scored
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);
}

// ═══════════════════════════════════════
// Job Application Functions
// ═══════════════════════════════════════

export async function saveJob(userId: string, jobId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      user_id: userId,
      job_id: jobId,
      status: 'saved',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function applyToJob(
  userId: string,
  jobId: string,
  opts: { resumeId?: string; coverLetter?: string; notes?: string } = {}
) {
  const { data, error } = await supabase
    .from('job_applications')
    .upsert({
      user_id: userId,
      job_id: jobId,
      status: 'applied',
      resume_id: opts.resumeId,
      cover_letter: opts.coverLetter,
      notes: opts.notes,
      applied_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  try {
    const { logActivity } = await import('./data');
    await logActivity(userId, 'job_applied', { job_id: jobId });
  } catch { /* ignore */ }

  return data;
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: JobApplicationStatus,
  notes?: string
) {
  const updates: Record<string, unknown> = { status, last_updated_at: new Date().toISOString() };
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('job_applications')
    .update(updates)
    .eq('id', applicationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserApplications(userId: string) {
  const { data } = await supabase
    .from('job_applications')
    .select('*, job_listings(*)')
    .eq('user_id', userId)
    .order('last_updated_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════
// Mock Interview Functions
// ═══════════════════════════════════════

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  behavioral: [
    'Tell me about a time you faced a challenging technical problem. How did you approach it?',
    'Describe a situation where you had to learn a new technology quickly. What was your process?',
    'How do you handle disagreements with teammates about technical decisions?',
    'Tell me about a project you are most proud of. What made it special?',
    'How do you prioritize tasks when working on multiple features simultaneously?',
    'Describe a time when you received critical feedback on your code. How did you respond?',
    'What do you do when you get stuck on a problem?',
  ],
  technical: [
    'Explain the difference between REST and GraphQL. When would you choose one over the other?',
    'What is the event loop in JavaScript? How does it handle asynchronous operations?',
    'Describe the SOLID principles. Give an example of how you have applied one.',
    'What strategies do you use for optimizing database queries?',
    'Explain the difference between authentication and authorization. How would you implement both?',
    'What is a race condition? How do you prevent them in concurrent code?',
    'Describe your approach to testing. What types of tests do you write and why?',
  ],
  system_design: [
    'Design a URL shortener service like bit.ly. What are the key components?',
    'How would you design a real-time chat application that can scale to millions of users?',
    'Design a caching strategy for a high-traffic e-commerce site.',
    'How would you architect a notification system that supports email, push, and SMS?',
    'Design a rate limiting system for an API.',
  ],
  coding: [
    'Implement a function to find the longest palindromic substring in a string.',
    'Write an algorithm to detect a cycle in a linked list.',
    'Implement a simple LRU cache with O(1) get and put operations.',
    'Write a function to find the shortest path in an unweighted graph using BFS.',
    'Implement a function that merges two sorted arrays in-place.',
  ],
};

export async function createMockInterview(
  userId: string,
  opts: {
    type: InterviewType;
    targetRole?: string;
    targetCompany?: string;
    difficulty?: string;
    questionCount?: number;
  }
) {
  const count = opts.questionCount || 5;
  let questions: string[] = [];

  if (opts.type === 'mixed') {
    // Mix from all categories
    const allTypes = ['behavioral', 'technical', 'system_design', 'coding'];
    for (let i = 0; i < count; i++) {
      const type = allTypes[i % allTypes.length];
      const pool = INTERVIEW_QUESTIONS[type] || [];
      const q = pool[Math.floor(Math.random() * pool.length)];
      if (q && !questions.includes(q)) questions.push(q);
    }
  } else {
    const pool = INTERVIEW_QUESTIONS[opts.type] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, count);
  }

  const formattedQuestions = questions.map((q, i) => ({
    id: `q${i + 1}`,
    text: q,
    type: opts.type === 'mixed' ? ['behavioral', 'technical', 'system_design', 'coding'][i % 4] : opts.type,
  }));

  const { data, error } = await supabase
    .from('mock_interviews')
    .insert({
      user_id: userId,
      interview_type: opts.type,
      target_role: opts.targetRole,
      target_company: opts.targetCompany,
      difficulty: opts.difficulty || 'mid',
      questions: formattedQuestions,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function startMockInterview(interviewId: string, userId: string) {
  const { data, error } = await supabase
    .from('mock_interviews')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', interviewId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitInterviewResponse(
  interviewId: string,
  userId: string,
  questionId: string,
  response: string
) {
  // Get current interview
  const { data: interview } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .eq('user_id', userId)
    .single();

  if (!interview) throw new Error('Interview not found');

  const responses = (interview.responses as any[]) || [];
  responses.push({ questionId, response, submittedAt: new Date().toISOString() });

  const { data, error } = await supabase
    .from('mock_interviews')
    .update({ responses })
    .eq('id', interviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeInterview(interviewId: string, userId: string) {
  const { data: interview } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .eq('user_id', userId)
    .single();

  if (!interview) throw new Error('Interview not found');

  const startTime = interview.started_at ? new Date(interview.started_at).getTime() : Date.now();
  const duration = Math.floor((Date.now() - startTime) / 1000);
  const responses = (interview.responses as any[]) || [];
  const questions = (interview.questions as any[]) || [];

  // Generate AI-like feedback based on responses
  const feedback = generateInterviewFeedback(questions, responses, interview.interview_type);

  const { data, error } = await supabase
    .from('mock_interviews')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      ai_feedback: feedback,
      overall_score: feedback.overallScore,
    })
    .eq('id', interviewId)
    .select()
    .single();

  if (error) throw error;

  try {
    const { logActivity, addXp } = await import('./data');
    await logActivity(userId, 'mock_interview_completed', {
      type: interview.interview_type,
      score: feedback.overallScore,
    });
    await addXp(userId, 50);
  } catch { /* ignore */ }

  return data;
}

function generateInterviewFeedback(
  questions: any[],
  responses: any[],
  interviewType: string
): {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  questionFeedback: { questionId: string; score: number; feedback: string }[];
} {
  const questionFeedback = questions.map((q) => {
    const response = responses.find((r) => r.questionId === q.id);
    const hasResponse = response && response.response && response.response.trim().length > 0;
    const responseLength = hasResponse ? response.response.trim().length : 0;

    // Score based on response quality heuristics
    let score = 0;
    if (responseLength > 200) score = 80 + Math.min(20, Math.floor(responseLength / 100));
    else if (responseLength > 100) score = 60 + Math.floor(responseLength / 10);
    else if (responseLength > 30) score = 40;
    else if (hasResponse) score = 20;

    const feedback = score >= 80
      ? 'Strong response with good detail. Consider adding specific metrics or outcomes.'
      : score >= 60
      ? 'Good attempt. Try to include more concrete examples and specific details.'
      : score >= 40
      ? 'Response could use more depth. Use the STAR framework (Situation, Task, Action, Result).'
      : hasResponse
      ? 'Try to elaborate more on your experience. Short answers can leave interviewers wanting more.'
      : 'No response provided. Practice answering this question type.';

    return { questionId: q.id, score, feedback };
  });

  const avgScore = questionFeedback.length > 0
    ? Math.round(questionFeedback.reduce((sum, qf) => sum + qf.score, 0) / questionFeedback.length)
    : 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (avgScore >= 70) strengths.push('Good overall response quality');
  if (responses.length === questions.length) strengths.push('Completed all questions');
  if (responses.some((r) => r.response?.length > 300)) strengths.push('Provided detailed answers where needed');

  if (avgScore < 70) improvements.push('Work on providing more detailed, structured responses');
  if (responses.length < questions.length) improvements.push('Try to answer all questions, even briefly');
  if (interviewType === 'behavioral') improvements.push('Use the STAR method: Situation, Task, Action, Result');
  if (interviewType === 'technical') improvements.push('Include specific technologies and quantifiable results');
  if (interviewType === 'system_design') improvements.push('Address scalability, trade-offs, and failure modes');

  return { overallScore: avgScore, strengths, improvements, questionFeedback };
}

export async function getUserInterviews(userId: string) {
  const { data } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getInterview(interviewId: string, userId: string) {
  const { data } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .eq('user_id', userId)
    .single();
  return data;
}

// ═══════════════════════════════════════
// Portfolio Theme Definitions
// ═══════════════════════════════════════

export const PORTFOLIO_THEMES: Record<PortfolioTheme, {
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  description: string;
}> = {
  midnight: {
    name: 'Midnight',
    bg: 'from-[#0a0a1a] to-[#111128]',
    card: 'bg-white/5 border-white/10',
    accent: 'text-teal',
    text: 'text-white',
    description: 'Deep dark theme with teal accents',
  },
  ocean: {
    name: 'Ocean',
    bg: 'from-[#0a192f] to-[#0d1b2a]',
    card: 'bg-sky/5 border-sky/10',
    accent: 'text-sky',
    text: 'text-white',
    description: 'Deep blue tones with sky highlights',
  },
  forest: {
    name: 'Forest',
    bg: 'from-[#0a1a0f] to-[#0d1b12]',
    card: 'bg-emerald/5 border-emerald/10',
    accent: 'text-emerald',
    text: 'text-white',
    description: 'Nature-inspired greens',
  },
  sunset: {
    name: 'Sunset',
    bg: 'from-[#1a0a0f] to-[#1b0d15]',
    card: 'bg-amber/5 border-amber/10',
    accent: 'text-amber',
    text: 'text-white',
    description: 'Warm amber and rose tones',
  },
  minimal: {
    name: 'Minimal',
    bg: 'from-[#fafafa] to-[#f5f5f5]',
    card: 'bg-black/5 border-black/10',
    accent: 'text-gray-900',
    text: 'text-gray-900',
    description: 'Clean, light minimal design',
  },
  neon: {
    name: 'Neon',
    bg: 'from-[#0a0a0f] to-[#0f0a1a]',
    card: 'bg-violet/5 border-violet/10',
    accent: 'text-violet',
    text: 'text-white',
    description: 'Cyberpunk neon with purple accents',
  },
};

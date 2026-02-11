// ═══════════════════════════════════════
// SkillRoute — Job Board Component
// Search, filter, match, apply to jobs
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  Zap,
  Loader2,
  Target,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import {
  getJobListings,
  getMatchingJobs,
  saveJob,
  applyToJob,
  getUserApplications,
} from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  userId: string;
}

type TabView = 'browse' | 'matches' | 'applied';

const LEVELS = ['junior', 'mid', 'senior', 'lead', 'principal'];
const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'];

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function JobBoard({ userId }: Props) {
  const [tab, setTab] = useState<TabView>('browse');
  const [jobs, setJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [remote, setRemote] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    loadJobs();
  }, [search, level, remote]);

  async function loadData() {
    setLoading(true);
    try {
      const [jobList, matchList, appList] = await Promise.all([
        getJobListings({ limit: 30 }),
        getMatchingJobs(userId, 10),
        getUserApplications(userId),
      ]);
      setJobs(jobList);
      setMatches(matchList);
      setApplications(appList);

      const savedIds = new Set<string>();
      const appliedIds = new Set<string>();
      appList.forEach((app: any) => {
        if (app.status === 'saved') savedIds.add(app.job_id);
        if (app.status !== 'saved') appliedIds.add(app.job_id);
      });
      setSavedJobIds(savedIds);
      setAppliedJobIds(appliedIds);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs() {
    const data = await getJobListings({ search, level, remote: remote, limit: 30 });
    setJobs(data);
  }

  async function handleSave(jobId: string) {
    try {
      await saveJob(userId, jobId);
      setSavedJobIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  async function handleApply(jobId: string) {
    try {
      await applyToJob(userId, jobId);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      console.error('Failed to apply:', err);
    }
  }

  // ─── Job Card ───
  const JobCard = ({ job, showMatch = false }: { job: any; showMatch?: boolean }) => {
    const isSaved = savedJobIds.has(job.id);
    const isApplied = appliedJobIds.has(job.id);

    return (
      <motion.div
        layout
        whileHover={{ scale: 1.01 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors cursor-pointer"
        onClick={() => setSelectedJob(job)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold">{job.title}</h3>
              {showMatch && job.match_score > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  job.match_score >= 70 ? 'bg-green-500/10 text-green-400' :
                  job.match_score >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {job.match_score}% match
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.experience_level && (
                <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs rounded-full capitalize">
                  {job.experience_level}
                </span>
              )}
              {job.remote_type && (
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full capitalize">
                  {job.remote_type}
                </span>
              )}
              {(job.required_skills || []).slice(0, 4).map((skill: string) => (
                <span key={skill} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {(job.required_skills || []).length > 4 && (
                <span className="px-2 py-0.5 text-gray-500 text-xs">
                  +{job.required_skills.length - 4} more
                </span>
              )}
            </div>

            {/* Salary & Time */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {job.salary_min && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatSalary(job.salary_min)} — {formatSalary(job.salary_max)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(job.posted_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleSave(job.id)}
              disabled={isSaved}
              className={`p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-teal/10 text-teal'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── Job Detail Modal ───
  const JobDetail = () => {
    if (!selectedJob) return null;
    const job = selectedJob;
    const isApplied = appliedJobIds.has(job.id);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedJob(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0f0f14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">{job.title}</h2>
            <div className="flex items-center gap-3 text-gray-400 mt-2">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
              {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {job.experience_level && (
              <span className="px-3 py-1 bg-teal/10 text-teal text-sm rounded-full capitalize">{job.experience_level}</span>
            )}
            {job.remote_type && (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full capitalize">{job.remote_type}</span>
            )}
            {job.salary_min && (
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full">
                {formatSalary(job.salary_min)} — {formatSalary(job.salary_max)}
              </span>
            )}
          </div>

          {/* Skills */}
          {job.required_skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill: string) => (
                  <span key={skill} className="px-2.5 py-1 bg-white/5 text-gray-300 text-sm rounded-lg border border-white/10">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Match Score */}
          {job.match_score != null && (
            <div className={`mb-6 p-4 rounded-xl border ${
              job.match_score >= 70 ? 'bg-green-500/5 border-green-500/20' :
              job.match_score >= 40 ? 'bg-yellow-500/5 border-yellow-500/20' :
              'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-teal" />
                <span className="text-white font-semibold">Skill Match: {job.match_score}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    job.match_score >= 70 ? 'bg-green-400' : job.match_score >= 40 ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}
                  style={{ width: `${job.match_score}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> View Original
              </a>
            )}
            <button
              onClick={() => handleApply(job.id)}
              disabled={isApplied}
              className={`flex-1 px-5 py-2.5 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                isApplied
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-teal text-[#0a0a0f] hover:bg-teal/90'
              }`}
            >
              {isApplied ? <><BookmarkCheck className="w-4 h-4" /> Applied</> : <><Briefcase className="w-4 h-4" /> Quick Apply</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ─── Tabs ───
  const TABS: { id: TabView; label: string; icon: typeof Briefcase; count?: number }[] = [
    { id: 'browse', label: 'Browse Jobs', icon: Search, count: jobs.length },
    { id: 'matches', label: 'Your Matches', icon: Zap, count: matches.length },
    { id: 'applied', label: 'Applications', icon: Briefcase, count: applications.length },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-teal" />
          Job Board
        </h2>
        <p className="text-gray-400 mt-1">Find roles that match your verified skills</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-teal text-[#0a0a0f]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-[#0a0a0f]/20' : 'bg-white/10'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters (Browse tab) */}
      {tab === 'browse' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title or company..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg text-sm flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-teal/10 border-teal/30 text-teal' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Experience Level</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setLevel('')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!level ? 'bg-teal text-[#0a0a0f] font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        All
                      </button>
                      {LEVELS.map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l)}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${level === l ? 'bg-teal text-[#0a0a0f] font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Work Type</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setRemote('')}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!remote ? 'bg-teal text-[#0a0a0f] font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        All
                      </button>
                      {REMOTE_TYPES.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRemote(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${remote === r ? 'bg-teal text-[#0a0a0f] font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Content */}
      {tab === 'browse' && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No jobs found matching your criteria.</p>
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal/10 to-emerald-500/10 border border-teal/20 rounded-xl p-5 flex items-center gap-3">
            <Target className="w-6 h-6 text-teal" />
            <div>
              <p className="text-white font-semibold">AI-Powered Matching</p>
              <p className="text-gray-400 text-sm">Jobs ranked by how well they match your verified skills</p>
            </div>
          </div>
          {matches.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Complete skill verifications to get personalized job matches!</p>
            </div>
          ) : (
            matches.map((job) => <JobCard key={job.id} job={job} showMatch />)
          )}
        </div>
      )}

      {tab === 'applied' && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No applications yet. Browse jobs to get started!</p>
            </div>
          ) : (
            applications.map((app: any) => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{app.job_listings?.title || 'Unknown Position'}</h3>
                    <p className="text-gray-400 text-sm">{app.job_listings?.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    app.status === 'applied' ? 'bg-blue-500/10 text-blue-400' :
                    app.status === 'interviewing' ? 'bg-violet-500/10 text-violet-400' :
                    app.status === 'offered' ? 'bg-green-500/10 text-green-400' :
                    app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    app.status === 'accepted' ? 'bg-teal/10 text-teal' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {app.applied_at ? `Applied ${timeAgo(app.applied_at)}` : `Saved ${timeAgo(app.created_at)}`}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && <JobDetail />}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

function formatSalary(amount: number): string {
  if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
  return `$${amount}`;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

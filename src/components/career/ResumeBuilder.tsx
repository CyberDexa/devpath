// ═══════════════════════════════════════
// DevPath — Resume Builder Component
// Build, edit, and export resumes
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  Trash2,
  Sparkles,
  Download,
  Edit3,
  Briefcase,
  GraduationCap,
  Code2,
  Wrench,
  Globe,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  generateAIResumeSuggestions,
  type ResumeTemplate,
} from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  userId: string;
}

interface ResumeSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'custom';
  title: string;
  items: any[];
  collapsed: boolean;
}

const TEMPLATES: { id: ResumeTemplate; name: string; desc: string; accent: string }[] = [
  { id: 'modern', name: 'Modern', desc: 'Clean lines, sidebar layout', accent: 'border-teal/40 bg-teal/5' },
  { id: 'classic', name: 'Classic', desc: 'Traditional professional', accent: 'border-blue-500/40 bg-blue-500/5' },
  { id: 'minimal', name: 'Minimal', desc: 'Whitespace-focused', accent: 'border-gray-400/40 bg-gray-400/5' },
  { id: 'creative', name: 'Creative', desc: 'Bold with color accents', accent: 'border-violet-500/40 bg-violet-500/5' },
  { id: 'technical', name: 'Technical', desc: 'Optimized for engineers', accent: 'border-emerald-500/40 bg-emerald-500/5' },
];

const DEFAULT_SECTIONS: ResumeSection[] = [
  { id: 'exp', type: 'experience', title: 'Work Experience', items: [], collapsed: false },
  { id: 'edu', type: 'education', title: 'Education', items: [], collapsed: false },
  { id: 'skills', type: 'skills', title: 'Skills', items: [], collapsed: false },
  { id: 'projects', type: 'projects', title: 'Projects', items: [], collapsed: false },
  { id: 'certs', type: 'certifications', title: 'Certifications', items: [], collapsed: false },
];

const SECTION_ICONS: Record<string, typeof Briefcase> = {
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: Code2,
  certifications: FileText,
  languages: Globe,
  custom: Edit3,
};

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function ResumeBuilder({ userId }: Props) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [template, setTemplate] = useState<ResumeTemplate>('modern');
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  });
  const [sections, setSections] = useState<ResumeSection[]>(DEFAULT_SECTIONS);
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [userId]);

  async function loadResumes() {
    setLoading(true);
    const data = await getResumes(userId);
    setResumes(data);
    if (data.length > 0) {
      await loadResume(data[0].id);
    }
    setLoading(false);
  }

  async function loadResume(id: string) {
    const data = await getResume(id, userId);
    if (data) {
      setActiveResume(data);
      setTemplate(data.template || 'modern');
      setPersonalInfo(data.personal_info || personalInfo);
      setSections(data.skills || DEFAULT_SECTIONS);
      setTargetRole(data.target_role || '');
      setTargetCompany(data.target_company || '');
    }
  }

  async function handleNew() {
    setSaving(true);
    try {
      const created = await createResume(userId, {
        title: `Resume ${resumes.length + 1}`,
        template: 'modern',
        targetRole,
        targetCompany,
      });
      setResumes((prev) => [created, ...prev]);
      setActiveResume(created);
      setTemplate('modern');
      setPersonalInfo({ name: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', summary: '' });
      setSections(DEFAULT_SECTIONS);
    } catch (err) {
      console.error('Failed to create resume:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!activeResume) return;
    setSaving(true);
    try {
      await updateResume(activeResume.id, userId, {
        template,
        personal_info: personalInfo,
        skills: sections,
        target_role: targetRole,
        target_company: targetCompany,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAISuggestions() {
    setLoadingSuggestions(true);
    try {
      const suggestions = await generateAIResumeSuggestions(userId, targetRole);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('AI suggestions failed:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function toggleSection(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s))
    );
  }

  function addSectionItem(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newItem = getEmptyItem(s.type);
        return { ...s, items: [...s.items, newItem], collapsed: false };
      })
    );
  }

  function updateSectionItem(sectionId: string, itemIndex: number, field: string, value: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items];
        items[itemIndex] = { ...items[itemIndex], [field]: value };
        return { ...s, items };
      })
    );
  }

  function removeSectionItem(sectionId: string, itemIndex: number) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, items: s.items.filter((_, i) => i !== itemIndex) };
      })
    );
  }

  function getEmptyItem(type: string) {
    switch (type) {
      case 'experience':
        return { company: '', role: '', location: '', startDate: '', endDate: '', description: '' };
      case 'education':
        return { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' };
      case 'skills':
        return { category: '', items: '' };
      case 'projects':
        return { name: '', url: '', tech: '', description: '' };
      case 'certifications':
        return { name: '', issuer: '', date: '', id: '' };
      default:
        return { content: '' };
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-teal" />
            Resume Builder
          </h2>
          <p className="text-gray-400 mt-1">Craft the perfect resume with AI-powered suggestions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !activeResume}
            className="px-5 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Resume switcher */}
      {resumes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => loadResume(r.id)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeResume?.id === r.id
                  ? 'bg-teal/10 border border-teal/30 text-teal'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}

      {!activeResume && resumes.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No resumes yet.</p>
          <button
            onClick={handleNew}
            className="mt-4 px-6 py-2.5 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors"
          >
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Template Picker */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Template</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all text-sm ${
                    template === t.id ? t.accent + ' ring-1 ring-teal/30' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-white font-medium">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-r from-violet-500/10 to-teal/10 border border-violet-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">AI Resume Assistant</h3>
              </div>
              <button
                onClick={handleAISuggestions}
                disabled={loadingSuggestions}
                className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Suggestions
              </button>
            </div>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target role (e.g., Senior Frontend Developer)"
                className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Target company"
                className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
            </div>
            {aiSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Suggested Summary</p>
                  <p className="text-gray-300 text-sm">{aiSuggestions.summary}</p>
                  <button
                    onClick={() => setPersonalInfo((p) => ({ ...p, summary: aiSuggestions.summary }))}
                    className="mt-2 text-xs text-teal hover:underline"
                  >
                    Use this summary
                  </button>
                </div>
                {aiSuggestions.improvements.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Suggestions to Improve</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {aiSuggestions.improvements.map((imp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5">•</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Personal Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'email', label: 'Email', placeholder: 'john@example.com' },
                { key: 'phone', label: 'Phone', placeholder: '+1 234 567 8901' },
                { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
                { key: 'website', label: 'Website', placeholder: 'https://your-site.com' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
                { key: 'github', label: 'GitHub', placeholder: 'github.com/username' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-gray-400 block mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={(personalInfo as any)[field.key]}
                    onChange={(e) => setPersonalInfo((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Professional Summary</label>
              <textarea
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Brief professional summary..."
                rows={3}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
              />
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.type] || Edit3;
            return (
              <div key={section.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-white font-semibold">{section.title}</h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {section.items.length}
                    </span>
                  </div>
                  {section.collapsed ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                </button>

                <AnimatePresence>
                  {!section.collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 space-y-4">
                        {section.items.map((item, idx) => (
                          <div key={idx} className="bg-[#0a0a0f] border border-white/10 rounded-lg p-4 space-y-3 relative">
                            <button
                              onClick={() => removeSectionItem(section.id, idx)}
                              className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Dynamic fields based on type */}
                            {section.type === 'experience' && (
                              <div className="grid sm:grid-cols-2 gap-3">
                                <input value={item.company || ''} onChange={(e) => updateSectionItem(section.id, idx, 'company', e.target.value)} placeholder="Company" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.role || ''} onChange={(e) => updateSectionItem(section.id, idx, 'role', e.target.value)} placeholder="Role/Title" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.startDate || ''} onChange={(e) => updateSectionItem(section.id, idx, 'startDate', e.target.value)} placeholder="Start Date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.endDate || ''} onChange={(e) => updateSectionItem(section.id, idx, 'endDate', e.target.value)} placeholder="End Date (or Present)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <textarea value={item.description || ''} onChange={(e) => updateSectionItem(section.id, idx, 'description', e.target.value)} placeholder="Description of responsibilities and achievements..." rows={2} className="sm:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50" />
                              </div>
                            )}
                            {section.type === 'education' && (
                              <div className="grid sm:grid-cols-2 gap-3">
                                <input value={item.school || ''} onChange={(e) => updateSectionItem(section.id, idx, 'school', e.target.value)} placeholder="School/University" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.degree || ''} onChange={(e) => updateSectionItem(section.id, idx, 'degree', e.target.value)} placeholder="Degree" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.field || ''} onChange={(e) => updateSectionItem(section.id, idx, 'field', e.target.value)} placeholder="Field of Study" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.startDate || ''} onChange={(e) => updateSectionItem(section.id, idx, 'startDate', e.target.value)} placeholder="Year" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                              </div>
                            )}
                            {section.type === 'skills' && (
                              <div className="grid sm:grid-cols-2 gap-3">
                                <input value={item.category || ''} onChange={(e) => updateSectionItem(section.id, idx, 'category', e.target.value)} placeholder="Category (e.g., Languages)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.items || ''} onChange={(e) => updateSectionItem(section.id, idx, 'items', e.target.value)} placeholder="Skills (comma separated)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                              </div>
                            )}
                            {section.type === 'projects' && (
                              <div className="grid sm:grid-cols-2 gap-3">
                                <input value={item.name || ''} onChange={(e) => updateSectionItem(section.id, idx, 'name', e.target.value)} placeholder="Project Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.url || ''} onChange={(e) => updateSectionItem(section.id, idx, 'url', e.target.value)} placeholder="URL" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.tech || ''} onChange={(e) => updateSectionItem(section.id, idx, 'tech', e.target.value)} placeholder="Technologies" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <textarea value={item.description || ''} onChange={(e) => updateSectionItem(section.id, idx, 'description', e.target.value)} placeholder="Description..." rows={2} className="sm:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50" />
                              </div>
                            )}
                            {section.type === 'certifications' && (
                              <div className="grid sm:grid-cols-2 gap-3">
                                <input value={item.name || ''} onChange={(e) => updateSectionItem(section.id, idx, 'name', e.target.value)} placeholder="Certification Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.issuer || ''} onChange={(e) => updateSectionItem(section.id, idx, 'issuer', e.target.value)} placeholder="Issuer" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                                <input value={item.date || ''} onChange={(e) => updateSectionItem(section.id, idx, 'date', e.target.value)} placeholder="Date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50" />
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addSectionItem(section.id)}
                          className="w-full py-2.5 border border-dashed border-white/10 rounded-lg text-gray-400 hover:text-teal hover:border-teal/30 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add {section.title.replace(/s$/, '')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

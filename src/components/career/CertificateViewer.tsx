// ═══════════════════════════════════════
// DevPath — Certificate Viewer Component
// View, share, verify certificates
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Shield,
  ExternalLink,
  Copy,
  CheckCircle2,
  Calendar,
  Hash,
  Trophy,
  Star,
  Flame,
  Zap,
  Share2,
} from 'lucide-react';
import { getUserCertificates, getCertificateByNumber, type CertificateType } from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  userId?: string;
  certificateNumber?: string;
}

const CERT_ICONS: Record<CertificateType, typeof Award> = {
  skill_verification: Shield,
  roadmap_completion: Trophy,
  project_completion: Star,
  battle_champion: Zap,
  streak_achievement: Flame,
};

const CERT_COLORS: Record<CertificateType, string> = {
  skill_verification: 'from-teal/20 to-cyan-500/20 border-teal/40',
  roadmap_completion: 'from-violet-500/20 to-purple-500/20 border-violet-500/40',
  project_completion: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40',
  battle_champion: 'from-rose-500/20 to-pink-500/20 border-rose-500/40',
  streak_achievement: 'from-orange-500/20 to-red-500/20 border-orange-500/40',
};

const CERT_LABEL: Record<CertificateType, string> = {
  skill_verification: 'Skill Verification',
  roadmap_completion: 'Roadmap Completion',
  project_completion: 'Project Completion',
  battle_champion: 'Battle Champion',
  streak_achievement: 'Streak Achievement',
};

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function CertificateViewer({ userId, certificateNumber }: Props) {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [verifyMode, setVerifyMode] = useState(false);
  const [verifyInput, setVerifyInput] = useState(certificateNumber || '');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate(certificateNumber);
    } else if (userId) {
      loadCertificates();
    } else {
      setLoading(false);
    }
  }, [userId, certificateNumber]);

  async function loadCertificates() {
    setLoading(true);
    const data = await getUserCertificates(userId!);
    setCertificates(data);
    setLoading(false);
  }

  async function verifyCertificate(num: string) {
    setLoading(true);
    const data = await getCertificateByNumber(num);
    setVerifyResult(data);
    setSelectedCert(data);
    setVerifyMode(true);
    setLoading(false);
  }

  function copyLink(certNum: string) {
    navigator.clipboard.writeText(`https://devpath-phi.vercel.app/certificates?verify=${certNum}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Certificate Card ───
  const CertCard = ({ cert, onClick }: { cert: any; onClick: () => void }) => {
    const type = cert.certificate_type as CertificateType;
    const Icon = CERT_ICONS[type] || Award;
    const colors = CERT_COLORS[type] || CERT_COLORS.skill_verification;

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full text-left p-6 rounded-xl border bg-gradient-to-br ${colors} transition-shadow hover:shadow-lg hover:shadow-teal/5`}
      >
        <div className="flex items-start justify-between">
          <Icon className="w-8 h-8 text-teal" />
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/10 text-gray-300">
            {CERT_LABEL[type]}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mt-4">{cert.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{cert.description}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(cert.issued_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Hash className="w-3.5 h-3.5" />
            {cert.certificate_number}
          </span>
        </div>
      </motion.button>
    );
  };

  // ─── Full Certificate View ───
  const CertDetail = ({ cert }: { cert: any }) => {
    const type = cert.certificate_type as CertificateType;
    const Icon = CERT_ICONS[type] || Award;
    const colors = CERT_COLORS[type] || CERT_COLORS.skill_verification;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back button */}
        <button
          onClick={() => { setSelectedCert(null); setVerifyResult(null); }}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Back to certificates
        </button>

        {/* Certificate Display */}
        <div className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${colors} p-px`}>
          <div className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-2xl p-10">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-teal/30 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-teal/30 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-teal/30 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-teal/30 rounded-br-2xl" />

            <div className="text-center relative">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-teal" />
                </div>
              </div>

              <p className="text-teal/60 uppercase tracking-[0.3em] text-xs font-medium mb-2">DevPath Certificate of</p>
              <h1 className="text-3xl font-bold text-white mb-1">{CERT_LABEL[type]}</h1>
              <p className="text-gray-400 text-sm mb-8">This certifies that</p>

              {/* Recipient */}
              <p className="text-2xl font-bold text-white mb-8">
                {cert.profiles?.display_name || cert.profiles?.username || 'DevPath User'}
              </p>

              {/* Title */}
              <p className="text-gray-300 mb-2">has successfully demonstrated proficiency in</p>
              <h2 className="text-xl font-semibold text-teal mb-8">{cert.title}</h2>

              {/* Score */}
              {cert.score != null && (
                <p className="text-gray-400 text-sm mb-6">
                  Score: <span className="text-white font-mono">{Math.round(cert.score)}%</span>
                  {cert.difficulty && <> · Difficulty: <span className="text-white capitalize">{cert.difficulty}</span></>}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex items-center justify-center gap-8 text-xs text-gray-500 border-t border-white/10 pt-6">
                <div>
                  <p className="text-gray-600 mb-0.5">Issued On</p>
                  <p className="text-gray-300 font-medium">{new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-0.5">Certificate ID</p>
                  <p className="text-gray-300 font-mono font-medium">{cert.certificate_number}</p>
                </div>
                {cert.expires_at && (
                  <div>
                    <p className="text-gray-600 mb-0.5">Expires</p>
                    <p className="text-gray-300 font-medium">{new Date(cert.expires_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => copyLink(cert.certificate_number)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just earned my "${cert.title}" certificate on DevPath! 🎉\n\nVerify: https://devpath-phi.vercel.app/certificates?verify=${cert.certificate_number}`)}`,
                  '_blank'
                );
              }
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── Verify Modal ───
  const VerifySection = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5 text-teal" />
        Verify a Certificate
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={verifyInput}
          onChange={(e) => setVerifyInput(e.target.value)}
          placeholder="Enter certificate number (e.g., DP-XXXXXX-XXXXXX)"
          className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 font-mono focus:outline-none focus:ring-1 focus:ring-teal/50"
        />
        <button
          onClick={() => verifyCertificate(verifyInput)}
          disabled={!verifyInput.trim()}
          className="px-5 py-2.5 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors text-sm disabled:opacity-40"
        >
          Verify
        </button>
      </div>
      {verifyResult === null && verifyMode && !loading && (
        <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> Certificate not found or not public.
        </p>
      )}
    </div>
  );

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Selected Certificate Detail ───
  if (selectedCert) {
    return <CertDetail cert={selectedCert} />;
  }

  // ─── Certificate List View ───
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-teal" />
            My Certificates
          </h2>
          <p className="text-gray-400 mt-1">Your verified achievements and credentials</p>
        </div>
        <a
          href="/verify"
          className="px-4 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors text-sm flex items-center gap-2"
        >
          <Shield className="w-4 h-4" /> Earn More
        </a>
      </div>

      {/* Verify */}
      <VerifySection />

      {/* Certificate Grid */}
      {certificates.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No certificates yet.</p>
          <p className="text-sm mt-1">Complete skill verifications to earn your first certificate!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertCard key={cert.id} cert={cert} onClick={() => setSelectedCert(cert)} />
          ))}
        </div>
      )}
    </div>
  );
}

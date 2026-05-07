import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Clock, CheckCircle, XCircle, Award, Loader2, TrendingUp } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CelebrationEffect } from '../components/CelebrationEffect';

interface Publication {
  pubId: string;
  title: string;
  journal: string;
  year: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  doi?: string;
  authors?: string[];
  citations?: number;
  indexing?: string;
}

interface Metrics {
  hIndex: number;
  totalCitations: number;
  totalPublications: number;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

async function getToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? '';
}

const ResearchPage: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [doi, setDoi] = useState('');
  const [looking, setLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ hIndex: 0, totalCitations: 0, totalPublications: 0 });
  const [error, setError] = useState<string | null>(null);

  // ── Load publications on mount ──
  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/research`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setPublications(data.publications ?? []);
      setMetrics(data.metrics ?? { hIndex: 0, totalCitations: 0, totalPublications: 0 });
    } catch (e: any) {
      console.error('Failed to load publications:', e);
      setError('Could not load publications. Check your connection.');
    } finally {
      setLoadingData(false);
    }
  };

  // ── DOI Lookup (public — no auth needed) ──
  const handleLookup = async () => {
    if (!doi.trim()) return;
    setLooking(true);
    setPreview(null);
    try {
      const res = await fetch(`${BASE_URL}/research/lookup?doi=${encodeURIComponent(doi.trim())}`);
      if (!res.ok) throw new Error('DOI not found');
      const data = await res.json();
      setPreview(data);
    } catch {
      setError('DOI not found or CrossRef is unavailable. Please verify the DOI.');
    } finally {
      setLooking(false);
    }
  };

  // ── Submit Publication ──
  const handleSubmit = async () => {
    if (!preview) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/research`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      });
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      setPreview(null);
      setDoi('');
      setShowCelebration(true);
      loadPublications(); // Refresh list + metrics
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Research & Innovation</h1>
          <p className="text-gray-500 mt-1">Manage your publications, projects, and scholarly impact.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">H-Index</p>
            {loadingData ? (
              <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-black text-primary">{metrics.hIndex}</p>
            )}
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Citations</p>
            {loadingData ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-black text-primary">{metrics.totalCitations}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center justify-between">
          <p className="text-red-600 font-medium text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Publications', val: loadingData ? '—' : String(metrics.totalPublications), icon: <BookOpen className="text-blue-500" />, sub: `${publications.filter(p => p.status === 'APPROVED').length} approved` },
          { label: 'Pending Approval', val: loadingData ? '—' : String(publications.filter(p => p.status === 'PENDING').length), icon: <Clock className="text-amber-500" />, sub: 'Awaiting HoD review' },
          { label: 'Total Citations', val: loadingData ? '—' : String(metrics.totalCitations), icon: <TrendingUp className="text-emerald-500" />, sub: `H-Index: ${metrics.hIndex}` },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">Live</span>
            </div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h4>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {loadingData ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" /> : stat.val}
            </div>
            <p className="text-xs text-emerald-500 font-bold italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* DOI Search */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Publication via DOI
        </h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter DOI (e.g., 10.1038/s41598-024-12345-x)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={looking || !doi.trim()}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {looking ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            {looking ? 'Fetching...' : 'Lookup'}
          </button>
        </div>

        {preview && (
          <div className="mt-6 p-6 bg-secondary/30 rounded-xl border border-secondary border-dashed">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary">{preview.title}</h3>
                <p className="text-gray-600 italic">{preview.journal} • {preview.year}</p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {preview.indexing}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Authors: {Array.isArray(preview.authors) ? preview.authors.join(', ') : preview.authors}</p>
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-500 hover:text-gray-700 font-medium px-6 py-2 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Publications List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            My Publications
          </h2>
        </div>

        {loadingData ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading publications…</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="p-20 text-center">
            <BookOpen className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No publications yet. Add your first via DOI above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {publications.map((pub) => (
              <div key={pub.pubId} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-text">{pub.title}</h4>
                  <p className="text-sm text-gray-500">{pub.journal} • {pub.year}{pub.citations ? ` • ${pub.citations} citations` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  {pub.status === 'PENDING' && (
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending Approval
                    </span>
                  )}
                  {pub.status === 'APPROVED' && (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  )}
                  {pub.status === 'REJECTED' && (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CelebrationEffect
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default ResearchPage;

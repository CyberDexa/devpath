// ═══════════════════════════════════════
// DevPath — Version History Service
// Code snapshots with diff view
// ═══════════════════════════════════════

export interface CodeVersion {
  id: string;
  timestamp: Date;
  label: string;
  code: string;
  language: string;
  autoSave: boolean;
}

/**
 * Compute a simple line-based diff between two strings
 */
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const result: DiffLine[] = [];

  // LCS-based diff (simplified Myers)
  const m = oldLines.length;
  const n = newLines.length;
  
  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const diffLines: DiffLine[] = [];
  let i = m, j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diffLines.unshift({
        type: 'unchanged',
        content: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffLines.unshift({
        type: 'added',
        content: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else {
      diffLines.unshift({
        type: 'removed',
        content: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return diffLines;
}

/**
 * Diff statistics
 */
export function getDiffStats(diff: DiffLine[]): { added: number; removed: number; unchanged: number } {
  return {
    added: diff.filter((d) => d.type === 'added').length,
    removed: diff.filter((d) => d.type === 'removed').length,
    unchanged: diff.filter((d) => d.type === 'unchanged').length,
  };
}

// ═══════════════════════════════════════
// Local Version Store (localStorage)
// ═══════════════════════════════════════

const STORAGE_KEY = 'devpath_code_versions';

function getStorageKey(projectId: string): string {
  return `${STORAGE_KEY}_${projectId}`;
}

export function getVersions(projectId: string): CodeVersion[] {
  try {
    const raw = localStorage.getItem(getStorageKey(projectId));
    if (!raw) return [];
    const versions = JSON.parse(raw);
    return versions.map((v: any) => ({
      ...v,
      timestamp: new Date(v.timestamp),
    }));
  } catch {
    return [];
  }
}

export function saveVersion(
  projectId: string,
  code: string,
  language: string,
  label?: string,
  autoSave = false
): CodeVersion {
  const versions = getVersions(projectId);
  
  // Don't save if identical to last version
  if (versions.length > 0 && versions[versions.length - 1].code === code) {
    return versions[versions.length - 1];
  }

  const version: CodeVersion = {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
    label: label || (autoSave ? 'Auto-save' : `Snapshot ${versions.length + 1}`),
    code,
    language,
    autoSave,
  };

  // Keep max 50 versions, prune old auto-saves first
  const maxVersions = 50;
  let updated = [...versions, version];
  if (updated.length > maxVersions) {
    // Remove oldest auto-saves first
    const autoSaves = updated.filter((v) => v.autoSave);
    const manual = updated.filter((v) => !v.autoSave);
    while (updated.length > maxVersions && autoSaves.length > 5) {
      autoSaves.shift();
      updated = [...autoSaves, ...manual].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    }
    // If still too many, remove from start
    updated = updated.slice(-maxVersions);
  }

  localStorage.setItem(getStorageKey(projectId), JSON.stringify(updated));
  return version;
}

export function restoreVersion(projectId: string, versionId: string): string | null {
  const versions = getVersions(projectId);
  const version = versions.find((v) => v.id === versionId);
  return version?.code ?? null;
}

export function deleteVersion(projectId: string, versionId: string): void {
  const versions = getVersions(projectId);
  const updated = versions.filter((v) => v.id !== versionId);
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(updated));
}

export function clearVersions(projectId: string): void {
  localStorage.removeItem(getStorageKey(projectId));
}

/**
 * Format a timestamp relative to now
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

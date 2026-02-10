// ═══════════════════════════════════════
// DevPath — useRoadmapProgress Hook
// Loads & persists roadmap progress via Supabase
// Falls back to localStorage when not authenticated
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NodeStatus } from '../data/types';
import { supabase } from '../lib/supabase';
import {
  getUserRoadmapProgress,
  upsertRoadmapProgress,
  logActivity,
} from '../lib/data';

const LOCAL_STORAGE_KEY = 'devpath_roadmap_progress';

function getLocalProgress(roadmapId: string): Record<string, NodeStatus> {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${roadmapId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalProgress(
  roadmapId: string,
  statuses: Record<string, NodeStatus>,
) {
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY}_${roadmapId}`,
      JSON.stringify(statuses),
    );
  } catch {
    // localStorage might be full or disabled
  }
}

export function useRoadmapProgress(roadmapId: string, totalNodes: number) {
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>(
    {},
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Detect auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load progress
  useEffect(() => {
    async function load() {
      if (userId) {
        try {
          const rows = await getUserRoadmapProgress(userId);
          const roadmapRows = rows.filter(
            (r: any) => r.roadmap_id === roadmapId,
          );
          const statuses: Record<string, NodeStatus> = {};
          for (const row of roadmapRows) {
            statuses[row.node_id] = row.status as NodeStatus;
          }
          setNodeStatuses(statuses);
        } catch {
          // Fall back to local
          setNodeStatuses(getLocalProgress(roadmapId));
        }
      } else {
        setNodeStatuses(getLocalProgress(roadmapId));
      }
      setLoaded(true);
    }
    load();
  }, [userId, roadmapId]);

  // Persist changes (debounced)
  const persist = useCallback(
    (newStatuses: Record<string, NodeStatus>) => {
      // Always save to localStorage as backup
      setLocalProgress(roadmapId, newStatuses);

      if (!userId) return;

      // Debounce Supabase writes
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          const completedCount = Object.values(newStatuses).filter(
            (s) => s === 'completed',
          ).length;
          const pct =
            totalNodes > 0
              ? Math.round((completedCount / totalNodes) * 100)
              : 0;

          // Write each changed node status
          for (const [nodeId, status] of Object.entries(newStatuses)) {
            await upsertRoadmapProgress(userId, roadmapId, nodeId, status);
          }

          // Log activity for completed nodes
          if (completedCount > 0) {
            await logActivity(
              userId,
              'roadmap_progress',
              `Progress on ${roadmapId}: ${pct}%`,
              { roadmap_id: roadmapId, progress: pct },
            ).catch(() => {});
          }
        } catch (err) {
          console.error('Failed to persist roadmap progress:', err);
        }
      }, 1000);
    },
    [userId, roadmapId, totalNodes],
  );

  const updateNodeStatus = useCallback(
    (nodeId: string, status: NodeStatus) => {
      setNodeStatuses((prev) => {
        const next = { ...prev, [nodeId]: status };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const toggleNodeStatus = useCallback(
    (nodeId: string) => {
      setNodeStatuses((prev) => {
        const current = prev[nodeId] || 'not-started';
        const next: NodeStatus =
          current === 'not-started'
            ? 'learning'
            : current === 'learning'
              ? 'completed'
              : 'not-started';
        const newStatuses = { ...prev, [nodeId]: next };
        persist(newStatuses);
        return newStatuses;
      });
    },
    [persist],
  );

  return {
    nodeStatuses,
    updateNodeStatus,
    toggleNodeStatus,
    loaded,
    isAuthenticated: !!userId,
  };
}

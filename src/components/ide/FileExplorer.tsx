// ═══════════════════════════════════════
// SkillRoute — File Explorer & Tab System
// Multi-file project management with
// tree view, tabs, and file operations
// ═══════════════════════════════════════

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  File,
  FileCode2,
  FileJson,
  FileText,
  FilePlus,
  FolderPlus,
  Folder,
  FolderOpen,
  X,
  Pencil,
  Trash2,
  MoreVertical,
  FileType,
} from 'lucide-react';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  isEntryPoint?: boolean;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  language?: string;
  isEntryPoint?: boolean;
}

interface FileExplorerProps {
  files: ProjectFile[];
  activeFile: string;
  onFileSelect: (path: string) => void;
  onFileCreate: (path: string, language: string) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

const languageFromExt: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'sql',
  sh: 'shell',
  env: 'plaintext',
  txt: 'plaintext',
};

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return languageFromExt[ext] || 'plaintext';
}

function getFileIcon(path: string, isEntryPoint?: boolean) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const iconClass = isEntryPoint ? 'text-teal' : 'text-dim';

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode2 size={14} className="text-sky" />;
    case 'js':
    case 'jsx':
      return <FileCode2 size={14} className="text-amber" />;
    case 'py':
      return <FileCode2 size={14} className="text-[#3776ab]" />;
    case 'json':
      return <FileJson size={14} className="text-amber/70" />;
    case 'html':
      return <FileCode2 size={14} className="text-rose" />;
    case 'css':
      return <FileCode2 size={14} className="text-sky/80" />;
    case 'md':
      return <FileText size={14} className="text-dim" />;
    default:
      return <File size={14} className={iconClass} />;
  }
}

function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      const existing = currentLevel.find((n) => n.name === part);

      if (existing) {
        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      } else {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          ...(isFile
            ? { language: file.language, isEntryPoint: file.isEntryPoint }
            : { children: [] }),
        };
        currentLevel.push(node);
        if (!isFile && node.children) {
          currentLevel = node.children;
        }
      }
    }
  }

  // Sort: folders first, then files, alphabetically
  const sortTree = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => n.children && sortTree(n.children));
  };
  sortTree(root);

  return root;
}

// ═══════════════════════════════════════
// Tree Node Component
// ═══════════════════════════════════════

function TreeNode({
  node,
  depth,
  activePath,
  expandedFolders,
  toggleFolder,
  onSelect,
  onDelete,
}: {
  node: FileTreeNode;
  depth: number;
  activePath: string;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  onSelect: (path: string) => void;
  onDelete: (path: string) => void;
}) {
  const isActive = node.path === activePath;
  const isExpanded = expandedFolders.has(node.path);
  const isFolder = node.type === 'folder';
  const [showContextMenu, setShowContextMenu] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.path);
          } else {
            onSelect(node.path);
          }
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-[5px] text-left text-xs transition-all group ${
          isActive
            ? 'bg-teal/10 text-teal'
            : 'text-dim hover:bg-white/5 hover:text-text'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {/* Expand icon for folders */}
        {isFolder ? (
          <span className="flex-shrink-0 w-3.5">
            {isExpanded ? (
              <ChevronDown size={12} className="text-muted" />
            ) : (
              <ChevronRight size={12} className="text-muted" />
            )}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        {/* Icon */}
        <span className="flex-shrink-0">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={14} className="text-teal/60" />
            ) : (
              <Folder size={14} className="text-dim" />
            )
          ) : (
            getFileIcon(node.path, node.isEntryPoint)
          )}
        </span>

        {/* Name */}
        <span className="truncate flex-1 font-mono">{node.name}</span>

        {/* Entry point indicator */}
        {node.isEntryPoint && (
          <span className="text-[9px] px-1 py-0.5 bg-teal/10 text-teal rounded font-sans flex-shrink-0">
            entry
          </span>
        )}

        {/* Delete button on hover */}
        {!isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.path);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose/10 rounded transition-all flex-shrink-0"
          >
            <X size={10} className="text-rose/60" />
          </button>
        )}
      </button>

      {/* Folder children */}
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// File Tab Bar
// ═══════════════════════════════════════

export function FileTabBar({
  openFiles,
  activeFile,
  onSelect,
  onClose,
  modifiedFiles,
}: {
  openFiles: string[];
  activeFile: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  modifiedFiles?: Set<string>;
}) {
  return (
    <div className="flex items-center bg-surface/30 border-b border-white/5 overflow-x-auto scrollbar-hide">
      {openFiles.map((filePath) => {
        const name = filePath.split('/').pop() || filePath;
        const isActive = filePath === activeFile;
        const isModified = modifiedFiles?.has(filePath);

        return (
          <div
            key={filePath}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-white/5 cursor-pointer transition-all min-w-0 flex-shrink-0 group ${
              isActive
                ? 'bg-abyss text-teal border-b-2 border-b-teal'
                : 'text-dim hover:text-text hover:bg-white/3'
            }`}
            onClick={() => onSelect(filePath)}
          >
            {getFileIcon(filePath)}
            <span className="font-mono truncate max-w-[120px]">{name}</span>
            {isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(filePath);
              }}
              className={`p-0.5 rounded hover:bg-white/10 transition-all flex-shrink-0 ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// File Explorer Component
// ═══════════════════════════════════════

export default function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['src', 'src/components'])
  );
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const tree = buildFileTree(files);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const lang = getLanguageFromPath(newFileName.trim());
    onFileCreate(newFileName.trim(), lang);
    setNewFileName('');
    setShowNewFile(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFile(true)}
            className="p-1 rounded hover:bg-white/5 text-dim hover:text-teal transition-all"
            title="New file"
          >
            <FilePlus size={13} />
          </button>
        </div>
      </div>

      {/* New file input */}
      <AnimatePresence>
        {showNewFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="flex items-center gap-1.5 px-3 py-2">
              <FileType size={12} className="text-teal flex-shrink-0" />
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                  if (e.key === 'Escape') {
                    setShowNewFile(false);
                    setNewFileName('');
                  }
                }}
                placeholder="filename.ts"
                className="flex-1 bg-transparent text-xs text-text placeholder:text-muted outline-none font-mono"
                autoFocus
              />
              <button
                onClick={handleCreateFile}
                className="text-[10px] px-1.5 py-0.5 bg-teal/10 text-teal rounded hover:bg-teal/15"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewFile(false);
                  setNewFileName('');
                }}
                className="p-0.5 text-dim hover:text-text"
              >
                <X size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            activePath={activeFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            onSelect={onFileSelect}
            onDelete={onFileDelete}
          />
        ))}
        {tree.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted">No files yet</p>
            <button
              onClick={() => setShowNewFile(true)}
              className="mt-2 text-xs text-teal hover:underline"
            >
              Create a file
            </button>
          </div>
        )}
      </div>

      {/* File count */}
      <div className="px-3 py-1.5 border-t border-white/5 text-[10px] text-muted">
        {files.length} file{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

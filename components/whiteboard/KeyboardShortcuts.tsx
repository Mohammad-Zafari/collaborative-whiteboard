'use client';

import { useState, useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Tools',
      items: [
        { keys: ['V'], description: 'Select tool' },
        { keys: ['H'], description: 'Hand/Pan tool' },
        { keys: ['P'], description: 'Pen tool' },
        { keys: ['E'], description: 'Eraser tool' },
        { keys: ['R'], description: 'Rectangle tool' },
        { keys: ['C'], description: 'Circle tool' },
        { keys: ['L'], description: 'Line tool' },
        { keys: ['A'], description: 'Arrow tool' },
        { keys: ['T'], description: 'Text tool' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo' },
        { keys: ['Del'], description: 'Delete selected' },
      ],
    },
    {
      category: 'View',
      items: [
        { keys: ['Ctrl', '+'], description: 'Zoom in' },
        { keys: ['Ctrl', '-'], description: 'Zoom out' },
        { keys: ['Ctrl', '0'], description: 'Reset zoom' },
        { keys: ['Space'], description: 'Pan (hold & drag)' },
      ],
    },
    {
      category: 'General',
      items: [
        { keys: ['?'], description: 'Show shortcuts' },
        { keys: ['Esc'], description: 'Close dialogs' },
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Speed up your workflow with these shortcuts
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 glass border-t border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Press <kbd className="px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded">?</kbd> anytime to view shortcuts
              </p>
              <button
                onClick={onClose}
                className="btn btn-primary px-4 py-2 text-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


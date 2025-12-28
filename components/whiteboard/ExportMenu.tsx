'use client';

import { useState, useRef, useEffect } from 'react';
import { exportCanvasAsPNG, exportCanvasAsJPEG, copyCanvasToClipboard } from '@/lib/canvas/export';

interface ExportMenuProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomSlug: string;
}

export default function ExportMenu({ canvasRef, roomSlug }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    const filename = `whiteboard-${roomSlug}-${Date.now()}.png`;
    exportCanvasAsPNG(canvasRef.current, filename);
    setIsOpen(false);
  };

  const handleExportJPEG = () => {
    if (!canvasRef.current) return;
    const filename = `whiteboard-${roomSlug}-${Date.now()}.jpg`;
    exportCanvasAsJPEG(canvasRef.current, filename);
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    
    try {
      await copyCanvasToClipboard(canvasRef.current);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (error) {
      alert('Failed to copy to clipboard. Please try downloading instead.');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
        title="Export Canvas"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 z-50">
          <div className="py-2">
            <button
              onClick={handleExportPNG}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium">Download as PNG</div>
                <div className="text-xs text-gray-500">Lossless quality</div>
              </div>
            </button>

            <button
              onClick={handleExportJPEG}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium">Download as JPEG</div>
                <div className="text-xs text-gray-500">Smaller file size</div>
              </div>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={handleCopyToClipboard}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center gap-3"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="font-medium text-green-600">Copied!</div>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium">Copy to Clipboard</div>
                    <div className="text-xs text-gray-500">Paste in other apps</div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

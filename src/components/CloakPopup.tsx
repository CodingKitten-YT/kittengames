import React, { useState, useEffect } from 'react';
import { X, Globe, Type, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface CloakSettings {
  iconUrl: string;
  pageTitle: string;
}

interface CloakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CloakSettings;
  onUpdateCloak: (settings: Partial<CloakSettings>) => void;
  onRemoveCloak: () => void;
}

export function CloakPopup({
  isOpen,
  onClose,
  settings,
  onUpdateCloak,
  onRemoveCloak,
}: CloakPopupProps) {
  const [iconUrlInput, setIconUrlInput] = useState('');
  const [iconUrlPreview, setIconUrlPreview] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize state with the provided settings when the popup is opened
    setIconUrlInput(settings.iconUrl);
    setIconUrlPreview(settings.iconUrl);
    setPageTitle(settings.pageTitle);
    setError('');
  }, [settings]);

  const generateFaviconUrl = (domain: string) => {
    if (!domain) return '';
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  };

  const handleIconChange = (input: string) => {
    setIconUrlInput(input);
    setError('');

    if (!input) {
      setIconUrlPreview('');
      return;
    }

    const isFullUrl = input.startsWith('http://') || input.startsWith('https://');
    const previewUrl = isFullUrl ? input : generateFaviconUrl(input);

    setIconUrlPreview(previewUrl);
    setIsLoading(true);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setError('');
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load icon');
      setIsLoading(false);
    };
  };

  const handleSave = () => {
    if (error) return;

    // Update the tab's favicon and title
    const faviconElement = document.querySelector("link[rel='icon']") as HTMLLinkElement || document.createElement('link');
    faviconElement.rel = 'icon';
    faviconElement.href = iconUrlPreview || '/favicon.ico';

    if (!faviconElement.parentNode) {
      document.head.appendChild(faviconElement);
    }

    document.title = pageTitle || 'KittenGames';

    // Save the settings using the raw input
    onUpdateCloak({ iconUrl: iconUrlInput, pageTitle });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-6 text-white">Tab Cloaking</h2>

          {/* Preview Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Preview</h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-900 rounded border border-gray-700">
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  <img
                    src={iconUrlPreview || '/icon.svg'}
                    alt="Tab Icon"
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-sm truncate text-gray-300">
                  {pageTitle || 'KittenGames'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Icon URL Input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-blue-500" />
                <label className="text-sm font-medium text-gray-300">Icon URL</label>
              </div>
              <input
                type="text"
                className={`w-full bg-gray-800 text-gray-300 px-4 py-3 rounded-lg border 
                ${error ? 'border-red-500' : 'border-gray-700 focus:ring-blue-500'}`}
                value={iconUrlInput}
                onChange={(e) => handleIconChange(e.target.value)}
                placeholder="Enter domain (e.g., som.today)"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Page Title Input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type size={16} className="text-blue-500" />
                <label className="text-sm font-medium text-gray-300">Page Title</label>
              </div>
              <input
                type="text"
                className="w-full bg-gray-800 text-gray-300 px-4 py-3 rounded-lg border border-gray-700 focus:ring-blue-500"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={!!error}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all 
                ${error ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <Eye size={18} />
                Apply Cloak
              </button>
              <button
                onClick={onRemoveCloak}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all"
              >
                <EyeOff size={18} />
                Remove Cloak
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

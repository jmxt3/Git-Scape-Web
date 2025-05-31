
import React, { useState, useEffect } from 'react';
import { GEMINI_API_KEY_DOCS_URL } from '../constants';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (apiKey: string) => void;
  onClearKey: () => void;
  currentKey: string;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  onClearKey,
  currentKey,
}) => {
  const [inputValue, setInputValue] = useState(currentKey);

  useEffect(() => {
    setInputValue(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSaveKey(inputValue);
  };
  
  const handleClear = () => {
    setInputValue(''); 
    onClearKey();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-key-modal-title"
      onClick={onClose} 
    >
      <div
        className="bg-slate-800/95 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg border border-slate-700"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="gemini-key-modal-title" className="text-xl font-semibold text-slate-100">
            Your Gemini API Key
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Provide your personal Gemini API key to use AI features like repository chat. 
          This allows you to use the service at your own cost.
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Your API key will be securely stored locally in your browser storage. It will only be used to interact with the Gemini API.
        </p>

        <div className="mb-6">
          <label htmlFor="gemini-api-key-input" className="block text-sm font-medium text-slate-200 mb-1">
            Gemini API Key
          </label>
          <input
            type="password" 
            id="gemini-api-key-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full px-4 py-2 border border-slate-600 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-slate-700 text-slate-100 placeholder-slate-400"
            aria-describedby="gemini-key-description"
          />
          <p id="gemini-key-description" className="mt-2 text-xs text-slate-400">
            <a
              href={GEMINI_API_KEY_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Get your Gemini API key here
            </a> (opens in new tab).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500 transition-colors"
          >
            Cancel
          </button>
          {currentKey && (
             <button
                onClick={handleClear}
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors"
             >
                Clear Key
             </button>
          )}
          <button
            onClick={handleSave}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500 transition-colors"
            disabled={inputValue === currentKey && !!inputValue} 
          >
            { currentKey ? 'Update Key' : 'Save Key Locally'}
          </button>
        </div>
      </div>
    </div>
  );
};
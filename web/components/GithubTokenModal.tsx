
import React, { useState, useEffect } from 'react';

interface GithubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToken: (token: string) => void;
  onClearToken: () => void;
  currentToken: string;
}

export const GithubTokenModal: React.FC<GithubTokenModalProps> = ({
  isOpen,
  onClose,
  onSaveToken,
  onClearToken,
  currentToken,
}) => {
  const [inputValue, setInputValue] = useState(currentToken);

  useEffect(() => {
    setInputValue(currentToken);
  }, [currentToken, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSaveToken(inputValue);
  };
  
  const handleClear = () => {
    setInputValue('');
    onClearToken();
  };

  const PAT_DOCS_URL = "https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI";

  return (
    <div
      className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-token-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-slate-800/95 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="github-token-modal-title" className="text-xl font-semibold text-slate-100">
            GitHub Personal Access Token (PAT)
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
          To access private repositories and increase API rate limits, provide a GitHub Personal Access Token.
          It's recommended to create a token with the <code className="bg-slate-700 text-slate-300 px-1 py-0.5 rounded text-xs">'repo'</code> scope.
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Your TOKEN will be securely stored locally in your browser storage. It will only be used to interact with the GitHub API.
        </p>

        <div className="mb-6">
          <label htmlFor="github-token-input" className="block text-sm font-medium text-slate-200 mb-1">
            Personal Access Token
          </label>
          <input
            type="password"
            id="github-token-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-4 py-2 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-100 placeholder-slate-400"
            aria-describedby="token-description"
          />
          <p id="token-description" className="mt-2 text-xs text-slate-400">
            <a
              href={PAT_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Create a new token on GitHub
            </a> (opens in new tab).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-colors"
          >
            Cancel
          </button>
          {currentToken && (
             <button
                onClick={handleClear}
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors"
             >
                Clear Token
             </button>
          )}
          <button
            onClick={handleSave}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-colors"
            disabled={inputValue === currentToken && !!inputValue}
          >
            { currentToken ? 'Update Token' : 'Save Token'}
          </button>
        </div>
      </div>
    </div>
  );
};
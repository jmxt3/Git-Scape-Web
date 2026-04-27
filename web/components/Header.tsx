import React from 'react';
import GitHubButton from 'react-github-btn'

interface HeaderProps {
  onToggleTokenModal: () => void;
  hasToken: boolean;
  onToggleGeminiApiModal: () => void;
  hasUserGeminiApiKey: boolean;
}




export const Header: React.FC<HeaderProps> = ({
  onToggleTokenModal,
  hasToken,
  onToggleGeminiApiModal,
  hasUserGeminiApiKey
}) => {
  const buttonBaseClasses = "flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors duration-150 ease-in-out shadow-sm";

  const handleToggleGeminiModal = () => {
    onToggleGeminiApiModal();
  };

  const handleToggleTokenModal = () => {
    onToggleTokenModal();
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-lg border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-3xl font-bold tracking-tight tracking-tighter text-slate-100">
            Git Scape<span className="text-red-500"> AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* GitHub Star Button */}
          <div className="hidden sm:block">
            <GitHubButton
              href="https://github.com/jmxt3/Git-Scape-Web"
              data-color-scheme="no-preference: dark; light: dark; dark: dark;"
              data-size="large"
              data-show-count="true"
              aria-label="Star jmxt3/Git-Scape-Web on GitHub"
            >
              Stars
            </GitHubButton>
          </div>
          <button
            onClick={handleToggleGeminiModal}
            title={hasUserGeminiApiKey ? "Update or Clear Your Gemini API Key" : "API Key"}
            className={`${buttonBaseClasses} ${
              hasUserGeminiApiKey
                ? 'bg-violet-600 hover:bg-violet-700 text-white focus:ring-violet-500'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 focus:ring-violet-500'
            }`}
            aria-label={hasUserGeminiApiKey ? "Gemini API Key is set. Click to manage." : "Set your Gemini API Key"}
          >
            {hasUserGeminiApiKey ? 'Gemini Key Set' : 'API Key'}
          </button>

          <button
            onClick={handleToggleTokenModal}
            title={hasToken ? "Update GitHub Token" : "Private Repos"}
            className={`${buttonBaseClasses} ${
              hasToken
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 focus:ring-emerald-500'
            }`}
            aria-label={hasToken ? "GitHub token is set. Click to manage." : "Set GitHub Personal Access Token"}
          >
            {hasToken ? 'GitHub Token Set' : 'Private Repos'}
          </button>
        </div>
      </div>
    </header>
  );
};
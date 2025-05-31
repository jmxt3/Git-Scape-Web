
import React from 'react';
// Removed: import { usePostHog } from 'posthog-js/react';

interface HeaderProps {
  onToggleTokenModal: () => void;
  hasToken: boolean;
  onToggleGeminiApiModal: () => void;
  hasUserGeminiApiKey: boolean;
}

const KeyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const GemIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9.75 0l-3.75-7.5L3 21m10.5-9.75L15 3l4.5 8.25m-9.75 0L6.75 3 3 11.25m6.75 6.75L12 12.75l2.25 2.25M12 12.75l-2.25 2.25M12 3.75l-2.25 2.25M12 3.75l2.25 2.25" />
  </svg>
);


export const Header: React.FC<HeaderProps> = ({ 
  onToggleTokenModal, 
  hasToken, 
  onToggleGeminiApiModal,
  hasUserGeminiApiKey 
}) => {
  // Removed: const posthog = usePostHog();
  const buttonBaseClasses = "flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors duration-150 ease-in-out shadow-sm";

  const handleToggleGeminiModal = () => {
    window.posthog?.capture('gemini_api_key_modal_opened');
    onToggleGeminiApiModal();
  };

  const handleToggleTokenModal = () => {
    window.posthog?.capture('github_token_modal_opened');
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
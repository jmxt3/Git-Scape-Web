import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ChatMessage, Candidate } from '../types';
import { API_KEY_ERROR_MESSAGE, MAX_CHAT_DIGEST_LENGTH } from '../constants';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

interface RepoChatProps {
  digest: string;
  repoName: string;
  userProvidedGeminiApiKey: string | null;
}

const UserIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
  </svg>
);

const AiIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.378 1.602a.75.75 0 00-.756 0L3.031 6.256v4.847a.75.75 0 00.429.678l8.25 4.125a.75.75 0 00.582 0l8.25-4.125a.75.75 0 00.429-.678V6.256L12.378 1.602zM12 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.75 9.75a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM11.25 12.375a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.25-2.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15 9.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 21.143c.986 0 1.917-.248 2.728-.69a.75.75 0 00-.308-1.41A7.484 7.484 0 0112 19.5a7.484 7.484 0 01-2.421-.578.75.75 0 00-.307 1.41c.81.442 1.742.69 2.728.69z" />
  </svg>
);

const GREETING_MESSAGES = [
  "Hey! Code tricky? Project puzzling? I'm your AI for that! Let's chat and crack it.",
  "Psst! Need a hand with code or the 'big picture' of your project? I'm your AI. What's on your mind?",
  "Code stuck? Project unclear? Your AI helper here! Ping me – let's sort it out.",
  "Need to build code and get the 'why'? I'm your AI. Let's talk!",
  "Code stumpers? Project fog? I'm your AI for those 'Aha!' moments. Let's chat and clear things up!",
];

const FILENAME_REGEX = /(\b[a-zA-Z0-9._/-]+?\.(?:[a-zA-Z0-9_]+)\b|\b(?:Dockerfile|Makefile|README|LICENSE|Jenkinsfile|Vagrantfile|requirements\.txt|setup\.py|pyproject\.toml|pom\.xml|build\.gradle|settings\.gradle|webpack\.config\.js|babel\.config\.js|tsconfig\.json|package\.json|yarn\.lock|composer\.json|Gemfile|Rakefile|Pipfile|Procfile)\b)/g;

const ParagraphWithHighlightedFilenames: React.FC<any> = ({ node, children, className }) => {
  const processChildrenRecursive = (childNodes: React.ReactNode): React.ReactNode[] => {
    return React.Children.toArray(childNodes).flatMap((child: React.ReactNode, index: number) => {
      if (typeof child === 'string') {
        const parts = child.split(FILENAME_REGEX);
        return parts.map((part, i) =>
          FILENAME_REGEX.test(part) ? (
            <span key={`${index}-${i}`} className="text-rose-400 font-medium">
              {part}
            </span>
          ) : (
            part
          )
        );
      }
      if (React.isValidElement(child) && (child.props as any).children) {
        // Recursively process children of nested elements
        return React.cloneElement(child, {
          ...(child.props as any),
          children: processChildrenRecursive((child.props as any).children),
          key: index
        });
      }
      return child;
    });
  };

  // HAST `node` prop from ReactMarkdown has `tagName` for elements.
  // If it's not a standard element node we expect (e.g. just text, or root doc),
  // render children, wrapped in a span if className is provided.
  if (!node || typeof node.tagName !== 'string' || !node.tagName) {
    const processed = processChildrenRecursive(children);
    return className ? <span className={className}>{processed}</span> : <>{processed}</>;
  }

  // For valid HTML tags like 'p', 'li'
  const Tag = node.tagName as keyof JSX.IntrinsicElements;
  const tagProps: { className?: string } = {};
  if (className) {
    tagProps.className = className;
  }

  return React.createElement(Tag, tagProps, processChildrenRecursive(children));
};


export const RepoChat: React.FC<RepoChatProps> = ({ digest, repoName, userProvidedGeminiApiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRepoNameRef = useRef<string | null>(null);
  const [systemInstruction, setSystemInstruction] = useState<string>('');


  // Set up system instruction and greeting when digest/repoName/API key changes
  useEffect(() => {
    if (!userProvidedGeminiApiKey) {
      setError(API_KEY_ERROR_MESSAGE);
      setMessages([]);
      setSystemInstruction('');
      return;
    }
    setError(null);
    if (digest && repoName) {
      if (repoName !== currentRepoNameRef.current) {
        currentRepoNameRef.current = repoName;
        let truncatedDigest = digest;
        if (digest.length > MAX_CHAT_DIGEST_LENGTH) {
          truncatedDigest = digest.substring(0, MAX_CHAT_DIGEST_LENGTH);
        }
        const sysInstruction = `You are a senior software engineering specialized in analyzing and discussing the content of the GitHub repository named "${repoName}". The following is a text digest of this repository's codebase. Use this digest as your primary source of information to answer questions. If a question is outside the scope of this digest, politely state that. Do not make up information not present in the digest. Ensure all code blocks in your responses are formatted with Markdown language specifiers (e.g., \`\`\`javascript ... \`\`\`).\n\nRepository Digest for ${repoName}:\n---\n${truncatedDigest}\n---\n`;
        setSystemInstruction(sysInstruction);
        const randomGreeting = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
        const initialAiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          text: randomGreeting,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages([initialAiMessage]);
      }
    } else {
      setMessages([]);
      setSystemInstruction('');
      currentRepoNameRef.current = null;
    }
  }, [userProvidedGeminiApiKey, digest, repoName]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  // Helper to format history for API (exclude greeting AI message)
  const getHistoryForApi = () => {
    // Exclude the first AI greeting message
    return messages.filter((m, idx) => idx !== 0).map(m => ({ sender: m.sender, text: m.text }));
  };


  // Helper to get API base URL
  const API_BASE_URL = "https://api.gitscape.ai";


  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    if (!userProvidedGeminiApiKey) {
      setError("Please provide your Gemini API Key to use the chat.");
      return;
    }

    if (!systemInstruction) {
      setError("System instruction not set. Try regenerating the digest.");
      return;
    }
    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    window.posthog?.capture('chat_message_sent_by_user', {
      repo_name: repoName,
      message_length: userInput.length,
    });
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        api_key: userProvidedGeminiApiKey,
        system_instruction: systemInstruction,
        history: getHistoryForApi(),
        user_message: newUserMessage.text,
      };
      // Use absolute API URL if VITE_API_BASE_URL is set, else fallback to relative
      const apiUrl = `${API_BASE_URL}/chat/gemini`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} ${errText}`);
      }
      const data = await response.json();
      const aiResponseText = data.text;
      if (typeof aiResponseText !== 'string') {
        throw new Error("Received unexpected response format from AI.");
      }
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        candidates: data.raw?.candidates as Candidate[] | undefined,
      };
      setMessages(prev => [...prev, aiMessage]);
      window.posthog?.capture('chat_ai_response_received', {
        repo_name: repoName,
        response_length: aiResponseText.length,
      });
    } catch (e: any) {
      console.error('Error sending message:', e);
      const errorMessageText = e.message || 'Could not get a response from the AI.';
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: `Error: ${errorMessageText}`,
        sender: 'ai',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(errorMessageText);
      window.posthog?.capture('chat_ai_response_failed', {
        repo_name: repoName,
        error_message: errorMessageText,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, userProvidedGeminiApiKey, repoName, systemInstruction, messages]);


  if (!userProvidedGeminiApiKey) {
    return (
      <div className="mt-6 p-4 bg-slate-900/80 border border-slate-700 rounded-md text-center">
        <p className="text-sm text-sky-300">{API_KEY_ERROR_MESSAGE}</p>
        <p className="text-xs text-slate-400 mt-1">
          Click the "API Key" button in the header to set your Gemini API Key.
        </p>
      </div>
    );
  }

  if (!digest || !repoName) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Code digest must be generated first to enable the AI Assistant.
      </div>
    );
  }

  const placeholderText = !userProvidedGeminiApiKey ? "Set API Key to chat" : "Ask about the repository content...";

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-lg font-medium text-sky-400 mb-3">Chat with Repository: <span className="font-normal text-slate-300">{repoName}</span></h3>
      <div className="flex flex-col h-[70vh] max-h-[600px] bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const baseBubbleClasses = "px-4 py-2.5 rounded-lg shadow-md w-auto";
            let senderSpecificClasses = "";

            if (msg.sender === 'user') {
              senderSpecificClasses = 'bg-sky-600 text-white rounded-br-none max-w-xs md:max-w-md lg:max-w-lg ml-auto mr-1.5';
            } else {
              if (msg.error) {
                senderSpecificClasses = 'bg-red-900/30 text-slate-100 rounded-bl-none max-w-[90%] border border-red-700';
              } else {
                senderSpecificClasses = 'text-slate-100 rounded-bl-none max-w-[90%]';
              }
            }
            const finalBubbleClasses = `${baseBubbleClasses} ${senderSpecificClasses}`;

            return (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start w-full ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender === 'ai' && (
                    <div className={`p-2.5 mx-1.5 rounded-full self-start mt-1.5 shrink-0 shadow-md bg-slate-600 text-slate-100`}>
                      <AiIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className={finalBubbleClasses}>
                    {msg.sender === 'ai' ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            p: ParagraphWithHighlightedFilenames,
                            li: ParagraphWithHighlightedFilenames,
                            pre: ({ node, ...props }) => <pre className="bg-slate-900/95 p-3 rounded-md my-2 text-xs" {...props} />,
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }: {
                              node?: any;
                              inline?: boolean;
                              className?: string;
                              children?: React.ReactNode;
                            } & React.HTMLAttributes<HTMLElement>) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <code className={`${className} text-xs`} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className={`px-1.5 py-0.5 rounded text-xs ${
                                    inline ? 'bg-slate-600/80' : ''
                                  }`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            a: ({node, ...props}) => <a className="text-sky-400 hover:text-sky-300 underline" {...props} />
                          }}
                        >{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                    {msg.sender === 'ai' && msg.candidates && msg.candidates.length > 0 && msg.candidates[0].groundingMetadata?.groundingChunks && (
                      <div className="mt-2 pt-2 border-t border-slate-600">
                        <p className="text-xs font-semibold text-slate-400 mb-1">Sources:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {msg.candidates[0].groundingMetadata.groundingChunks.filter(chunk => chunk.web).map((chunk, idx) => (
                            <li key={idx} className="text-xs">
                              <a
                                href={chunk.web!.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={chunk.web!.title}
                                className="text-sky-400 hover:text-sky-300 underline truncate block"
                              >
                                {chunk.web!.title || chunk.web!.uri}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {error && !isLoading && !messages.some(m => m.error && m.text.includes(error)) && (
            <p className="p-4 text-sm text-red-400 border-t border-slate-700">{error}</p>
        )}

        <div className="p-4 border-t border-slate-700">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2 mb-0">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={placeholderText}
              disabled={isLoading || !userProvidedGeminiApiKey}
              className="flex-grow px-4 py-2 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-slate-800/80 text-slate-100 placeholder-sky-400/80 disabled:opacity-70"
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim() || !userProvidedGeminiApiKey }
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
              aria-label="Send chat message"
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5" /> : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 transform rotate-90">
                  <path d="M10.293 15.707a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L11 12.586V3a1 1 0 10-2 0v9.586L3.707 8.293A1 1 0 002.293 9.707l6 6z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

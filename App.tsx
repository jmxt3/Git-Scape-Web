import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Header } from "./components/Header";
import { RepoInput } from "./components/RepoInput";
import { GithubTokenModal } from "./components/GithubTokenModal";
import { GeminiApiKeyModal } from "./components/GeminiApiKeyModal";
import { GithubService, GithubFile } from "./services/githubService";
import { OutputTabs } from "./components/OutputTabs";
import { transformGithubTreeToD3Hierarchy } from "./components/diagramUtils";
import { DiagramFullscreenModal } from "./components/DiagramFullscreenModal";
import {
  GITHUB_TOKEN_LOCAL_STORAGE_KEY,
  REPO_URL_LOCAL_STORAGE_KEY,
  GEMINI_API_KEY_LOCAL_STORAGE_KEY,
  CACHED_OUTPUT_PREFIX,
} from "./constants";
import { RawDiagramNode, CachedRepoOutput } from "./types";

// Helper to safely get items from localStorage
const getFromLocalStorage = (key: string, defaultValue: string): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`Failed to read '${key}' from localStorage:`, e);
    return defaultValue;
  }
};

// Helper to safely set or remove items in localStorage
const storeInLocalStorage = (key: string, value: string | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`Failed to write '${key}' to localStorage:`, e);
  }
};

const MAX_TOTAL_WEBSOCKET_ATTEMPTS = 2; // Initial attempt + 1 retry

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>(() =>
    getFromLocalStorage(REPO_URL_LOCAL_STORAGE_KEY, "")
  );
  const [digest, setDigest] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);

  const [userProvidedGeminiApiKey, setUserProvidedGeminiApiKey] = useState<
    string | null
  >(null);
  const [showGeminiApiModal, setShowGeminiApiModal] = useState<boolean>(false);

  const [processedRepoName, setProcessedRepoName] = useState<
    string | undefined
  >(undefined);
  const [repoNameForFilename, setRepoNameForFilename] = useState<string | null>(
    null
  );
  const [currentDefaultBranch, setCurrentDefaultBranch] = useState<
    string | null
  >(null);
  const [filesToRenderInDiagram, setFilesToRenderInDiagram] = useState<
    GithubFile[]
  >([]);

  const [showDiagramFullscreenModal, setShowDiagramFullscreenModal] =
    useState<boolean>(false);
  const [diagramDataForModal, setDiagramDataForModal] =
    useState<RawDiagramNode | null>(null);
  const [repoNameForModal, setRepoNameForModal] = useState<string | undefined>(
    undefined
  );
  const [defaultBranchForModal, setDefaultBranchForModal] = useState<
    string | null
  >(null);

  const websocketRef = useRef<WebSocket | null>(null);
  const wsConnectionAttemptNumberRef = useRef<number>(0);
  const currentRepoInfoRef = useRef<{ owner: string; repo: string } | null>(
    null
  );
  const currentDefaultBranchForRequestRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(GITHUB_TOKEN_LOCAL_STORAGE_KEY);
      if (storedToken) {
        setGithubToken(storedToken);
      }
    } catch (e) {
      console.warn("Failed to read GitHub token from localStorage:", e);
    }
    try {
      const storedGeminiKey = localStorage.getItem(
        GEMINI_API_KEY_LOCAL_STORAGE_KEY
      );
      if (storedGeminiKey) {
        setUserProvidedGeminiApiKey(storedGeminiKey);
      }
    } catch (e) {
      console.warn("Failed to read Gemini API key from localStorage:", e);
    }

    if (repoUrl && !isLoading && !digest && !error) {
      const cacheKey = `${CACHED_OUTPUT_PREFIX}${repoUrl}`;
      const cachedDataJSON = localStorage.getItem(cacheKey);
      if (cachedDataJSON) {
        try {
          const cachedData: CachedRepoOutput = JSON.parse(cachedDataJSON);

          setDigest(cachedData.digest);
          setProcessedRepoName(cachedData.processedRepoName);
          setRepoNameForFilename(cachedData.repoNameForFilename);
          setCurrentDefaultBranch(cachedData.defaultBranch);
          setFilesToRenderInDiagram(cachedData.filesToRenderInDiagram || []);
        } catch (e) {
          console.warn(`Failed to parse or use cached data for ${repoUrl}:`, e);
          localStorage.removeItem(cacheKey);
        }
      }
    }
  }, []);

  useEffect(() => {
    storeInLocalStorage(REPO_URL_LOCAL_STORAGE_KEY, repoUrl || null);
  }, [repoUrl]);

  const githubService = useMemo(() => {
    return new GithubService(githubToken || undefined);
  }, [githubToken]);

  const handleSaveToken = (newToken: string) => {
    const trimmedToken = newToken.trim();
    if (trimmedToken) {
      storeInLocalStorage(GITHUB_TOKEN_LOCAL_STORAGE_KEY, trimmedToken);
      setGithubToken(trimmedToken);
    } else {
      storeInLocalStorage(GITHUB_TOKEN_LOCAL_STORAGE_KEY, null);
      setGithubToken(null);
    }
    setShowTokenModal(false);
  };

  const handleClearToken = () => {
    storeInLocalStorage(GITHUB_TOKEN_LOCAL_STORAGE_KEY, null);
    setGithubToken(null);
    setShowTokenModal(false);
  };

  const handleSaveUserGeminiApiKey = (apiKey: string) => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      storeInLocalStorage(GEMINI_API_KEY_LOCAL_STORAGE_KEY, trimmedKey);
      setUserProvidedGeminiApiKey(trimmedKey);
    } else {
      storeInLocalStorage(GEMINI_API_KEY_LOCAL_STORAGE_KEY, null);
      setUserProvidedGeminiApiKey(null);
    }
    setShowGeminiApiModal(false);
  };

  const handleClearUserGeminiApiKey = () => {
    storeInLocalStorage(GEMINI_API_KEY_LOCAL_STORAGE_KEY, null);
    setUserProvidedGeminiApiKey(null);
    setShowGeminiApiModal(false);
  };

  const processSuccessfulDigestData = useCallback(
    async (
      markdownDigest: string,
      owner: string,
      repo: string,
      defaultBranchFromFetch: string | null,
      digestFilesCount: number | null
    ) => {
      setDigest(markdownDigest);
      const branchToUse = defaultBranchFromFetch;
      setProgressMessage("Preparing for visualization...");
      setProgressPercent(100);

      let diagramFiles: GithubFile[] = [];
      let finalAnalyzedCountForStateAndCache = digestFilesCount;

      if (branchToUse && githubService) {
        try {
          diagramFiles = await githubService.getRepoFileTree(
            owner,
            repo,
            branchToUse
          );
          setFilesToRenderInDiagram(diagramFiles);
          const blobFiles = diagramFiles.filter((file) => file.type === "blob");
          finalAnalyzedCountForStateAndCache = blobFiles.length;
          setProgressMessage("Digest and visualization data ready!");
          setIsLoading(false);
        } catch (diagramErr: any) {
          console.error(
            `Error fetching repository structure for diagram:`,
            diagramErr
          );
        }
      } else {
        setProgressMessage(
          "Digest ready but visualization data unavailable (missing branch info)."
        );
      }

      setCurrentDefaultBranch(branchToUse);

      const repoDataToCache: CachedRepoOutput = {
        digest: markdownDigest,
        processedRepoName: `${owner}/${repo}`,
        repoNameForFilename: repo,
        defaultBranch: branchToUse,
        filesAnalyzedCount: finalAnalyzedCountForStateAndCache,
        filesToRenderInDiagram: diagramFiles,
        timestamp: Date.now(),
      };

      const cacheKey = `${CACHED_OUTPUT_PREFIX}${repoUrl}`;
      try {
        storeInLocalStorage(cacheKey, JSON.stringify(repoDataToCache));
      } catch (e) {
        // storeInLocalStorage already logs a warning
      }
    },
    [
      githubService,
      repoUrl,
      setDigest,
      setCurrentDefaultBranch,
      setFilesToRenderInDiagram,
      setProgressMessage,
      setIsLoading,
      setProgressPercent,
    ]
  );

  const handleGenerateDigest = useCallback(async () => {
    if (!repoUrl) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    storeInLocalStorage("gitScapeDigestContent", null);

    setIsLoading(true);
    setError(null);
    setDigest("");
    setProgressMessage("Initializing...");
    setProgressPercent(0);

    setProcessedRepoName(undefined);
    setRepoNameForFilename(null);
    setCurrentDefaultBranch(null);
    setFilesToRenderInDiagram([]);
    currentRepoInfoRef.current = null;
    currentDefaultBranchForRequestRef.current = null;
    wsConnectionAttemptNumberRef.current = 0;

    if (
      websocketRef.current &&
      websocketRef.current.readyState !== WebSocket.CLOSED
    ) {
      websocketRef.current.onclose = null;
      websocketRef.current.close(1000, "New request initiated");
      console.log("Previous WebSocket connection closed due to new request.");
    }

    if (!githubService) {
      setError("GitHub service is not available. Please refresh.");
      setIsLoading(false);
      setProgressMessage("");
      return;
    }

    const parsedUrl = githubService.parseGitHubUrl(repoUrl);
    if (!parsedUrl) {
      setError(
        "Invalid GitHub URL format. Example: https://github.com/owner/repo"
      );
      setIsLoading(false);
      setProgressMessage("");
      return;
    }

    const { owner, repo } = parsedUrl;
    currentRepoInfoRef.current = { owner, repo };
    const currentRepoName = `${owner}/${repo}`;
    setProcessedRepoName(currentRepoName);
    setRepoNameForFilename(repo);

    let defaultBranchForThisRequest: string | null = null;
    try {
      setProgressMessage("Fetching repository details...");
      setProgressPercent(2);
      defaultBranchForThisRequest = await githubService.getDefaultBranch(
        owner,
        repo
      );
      currentDefaultBranchForRequestRef.current = defaultBranchForThisRequest;
      setProgressMessage("Repository details fetched. Connecting to server...");
    } catch (branchError: any) {
      console.error("Failed to fetch default branch:", branchError);
      setError(
        `Failed to fetch repository details (branch): ${branchError.message}. Please ensure the repository is public or a valid GitHub token is provided for private repositories.`
      );
      setIsLoading(false);
      setProgressMessage("Error fetching branch.");
      setProgressPercent(0);
      return;
    }

    const initiateWebSocketConnection = () => {
      wsConnectionAttemptNumberRef.current += 1;
      const attemptNumber = wsConnectionAttemptNumberRef.current;

      if (attemptNumber > 1) {
        setProgressMessage(
          `Connection attempt ${
            attemptNumber - 1
          } failed. Retrying connection (attempt ${attemptNumber})...`
        );
      } else {
        setProgressMessage("Connecting to server for processing...");
      }

      const wsHost = "api.gitscape.ai";
      let wsScheme: string;
      if (wsHost === "api.gitscape.ai") {
        wsScheme = "wss";
      } else {
        wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      }

      const wsUrl = new URL(`${wsScheme}://${wsHost}/ws/converter`);
      wsUrl.searchParams.append("repo_url", encodeURIComponent(repoUrl));
      if (githubToken) {
        wsUrl.searchParams.append(
          "github_token",
          encodeURIComponent(githubToken)
        );
      }

      try {
        const ws = new WebSocket(wsUrl.toString());
        websocketRef.current = ws;

        ws.onopen = () => {
          setProgressMessage(`Starting repository processing...`);
          setProgressPercent(5);
        };

        ws.onmessage = async (event) => {
          // ... (onmessage logic remains largely the same)
          const rawEventData = event.data;
          let parsedMessageData: any;

          if (typeof rawEventData !== "string") {
            console.error(
              "Received non-string WebSocket message:",
              rawEventData
            );
            setError("Received unexpected binary data from server.");
            setIsLoading(false);
            websocketRef.current?.close(1003, "Unsupported data type");
            return;
          }

          try {
            parsedMessageData = JSON.parse(rawEventData);
          } catch (jsonError) {
            console.error(
              "Received non-JSON string from WebSocket:",
              rawEventData,
              jsonError
            );
            setError(
              `Received unparseable/non-JSON message from server: ${String(
                rawEventData
              ).substring(0, 100)}...`
            );
            setIsLoading(false);
            websocketRef.current?.close(
              1011,
              "Unexpected non-JSON message from server"
            );
            return;
          }

          try {
            if (
              !parsedMessageData ||
              typeof parsedMessageData.type !== "string"
            ) {
              throw new Error(
                "Parsed WebSocket JSON message lacks a 'type' string field."
              );
            }

            switch (parsedMessageData.type) {
              case "progress":
                setProgressMessage(
                  parsedMessageData.message || "Processing..."
                );
                if (typeof parsedMessageData.percentage === "number") {
                  setProgressPercent((prev) =>
                    Math.max(prev, Number(parsedMessageData.percentage))
                  );
                } else {
                  console.warn(
                    "Progress JSON message received without a 'percentage' number:",
                    parsedMessageData
                  );
                }
                break;
              case "final_digest":
              case "digest_complete":
                const markdownDigest = parsedMessageData.digest;
                if (
                  typeof markdownDigest !== "string" ||
                  markdownDigest.trim() === ""
                ) {
                  throw new Error(
                    `WebSocket '${parsedMessageData.type}' message returned an empty or invalid digest.`
                  );
                }

                const branchFromMessage = parsedMessageData.default_branch;
                const branchForProcessing =
                  branchFromMessage ||
                  currentDefaultBranchForRequestRef.current;
                const digestFilesCount =
                  parsedMessageData.files_analyzed_count !== undefined
                    ? Number(parsedMessageData.files_analyzed_count)
                    : null;

                if (!currentRepoInfoRef.current) {
                  throw new Error(
                    "Repository owner/name info missing for final processing."
                  );
                }
                const { owner: currentOwner, repo: currentRepo } =
                  currentRepoInfoRef.current;

                await processSuccessfulDigestData(
                  markdownDigest,
                  currentOwner,
                  currentRepo,
                  branchForProcessing,
                  digestFilesCount
                );

                websocketRef.current?.close(
                  1000,
                  `Process completed successfully (${parsedMessageData.type})`
                );
                break;
              case "error":
                const errorMessage =
                  parsedMessageData.message ||
                  "An error occurred during processing on the server.";
                console.error(
                  "Error message from server (via WebSocket JSON):",
                  errorMessage
                );
                setError(errorMessage);
                setProgressMessage("Server error occurred.");
                setIsLoading(false);
                setProgressPercent(0);
                websocketRef.current?.close(
                  1000,
                  "Server error indicated in JSON message"
                );
                break;
              default:
                console.warn(
                  "Received WebSocket JSON message with unhandled type:",
                  parsedMessageData
                );
                setProgressMessage(
                  `Unhandled server update type: ${parsedMessageData.type}`
                );
            }
          } catch (processingError: any) {
            console.error(
              "Error processing parsed WebSocket JSON:",
              processingError,
              "Data:",
              parsedMessageData,
              "Original:",
              rawEventData
            );
            setError(
              `Client-side error processing server JSON: ${
                processingError.message
              }. Raw: ${String(rawEventData).substring(0, 100)}...`
            );
            setProgressMessage("Error processing server update.");
            setIsLoading(false);
            websocketRef.current?.close(
              4001,
              "Client-side processing error of server JSON"
            );
          }
        };

        const handleFailedConnectionAttempt = (
          errorType: string,
          eventDetails: any
        ) => {
          console.error(
            `WebSocket connection attempt ${attemptNumber} ${errorType}:`,
            eventDetails
          );
          if (!digest) {
            // Only retry if no digest has been successfully processed
            if (attemptNumber < MAX_TOTAL_WEBSOCKET_ATTEMPTS) {
              initiateWebSocketConnection(); // Retry
            } else {
              setError(
                "We couldn't fetch the repository. Please add a GitHub Personal Access Token (PAT) and try again."
              );
              setProgressMessage("Connection failed after multiple attempts.");
              setIsLoading(false);
              setProgressPercent(0);
            }
          }
        };

        ws.onerror = (event) => {
          handleFailedConnectionAttempt("error", event);
        };

        ws.onclose = (event) => {
          console.log(
            `WebSocket connection attempt ${attemptNumber} closed:`,
            event.code,
            event.reason,
            "wasClean:",
            event.wasClean
          );
          websocketRef.current = null;

          if (!event.wasClean && !digest && isLoading) {
            // Check isLoading to ensure this is for current request
            handleFailedConnectionAttempt("closed uncleanly", event);
          } else if (isLoading && !digest && !error) {
            // If it closed cleanly but we are still loading and have no digest/error, something is wrong.
            // This might happen if server closes connection prematurely without error/success.
            if (attemptNumber >= MAX_TOTAL_WEBSOCKET_ATTEMPTS) {
              setError(
                "We couldn't fetch the repository. Please add a GitHub Personal Access Token (PAT) and try again."
              );
              setProgressMessage(
                "Connection closed unexpectedly after all attempts."
              );
              setIsLoading(false);
              setProgressPercent(0);
            } else {
              // Treat as a failed attempt and retry if not max attempts.
              handleFailedConnectionAttempt("closed unexpectedly", event);
            }
          } else if (isLoading && !digest && error) {
            // If there's already an error set by onmessage, no need to overwrite with generic PAT message.
            // Just ensure loading state is false if not already.
            setIsLoading(false);
          }
        };
      } catch (err: any) {
        console.error(
          `Error setting up WebSocket (attempt ${attemptNumber}):`,
          err
        );
        if (attemptNumber < MAX_TOTAL_WEBSOCKET_ATTEMPTS) {
          initiateWebSocketConnection(); // Retry
        } else {
          setError(
            err.message ||
              "We couldn't fetch the repository. Please add a GitHub Personal Access Token (PAT) and try again."
          );
          setProgressMessage("Initialization error after multiple attempts.");
          setIsLoading(false);
          setProgressPercent(0);
        }
      }
    };

    initiateWebSocketConnection(); // Start the first attempt
  }, [
    repoUrl,
    githubToken,
    githubService,
    isLoading,
    error,
    digest,
    progressPercent,
    processSuccessfulDigestData,
    setProcessedRepoName,
    setRepoNameForFilename,
    setCurrentDefaultBranch,
    setFilesToRenderInDiagram,
    setDigest,
    setError,
    setIsLoading,
    setProgressMessage,
    setProgressPercent,
  ]);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        console.log("App component unmounting. Closing WebSocket.");
        websocketRef.current.onclose = null;
        websocketRef.current.onerror = null;
        websocketRef.current.onmessage = null;
        websocketRef.current.onopen = null;
        if (
          websocketRef.current.readyState === WebSocket.OPEN ||
          websocketRef.current.readyState === WebSocket.CONNECTING
        ) {
          websocketRef.current.close(1000, "Component unmounting");
        }
        websocketRef.current = null;
      }
    };
  }, []);

  const diagramData: RawDiagramNode | null = useMemo(() => {
    if (processedRepoName && filesToRenderInDiagram.length > 0) {
      return transformGithubTreeToD3Hierarchy(
        filesToRenderInDiagram,
        processedRepoName
      );
    }
    return null;
  }, [filesToRenderInDiagram, processedRepoName]);

  useEffect(() => {
    if (githubService && digest && !processedRepoName && repoUrl) {
      const parsed = githubService.parseGitHubUrl(repoUrl);
      if (parsed) {
        setProcessedRepoName(`${parsed.owner}/${parsed.repo}`);
        if (!repoNameForFilename) {
          setRepoNameForFilename(parsed.repo);
        }
      }
    }
  }, [digest, processedRepoName, repoUrl, githubService, repoNameForFilename]);

  const handleOpenDiagramFullscreenModal = useCallback(
    (data: RawDiagramNode, repoNameModal: string, branch: string | null) => {
      setDiagramDataForModal(data);
      setRepoNameForModal(repoNameModal);
      setDefaultBranchForModal(branch);
      setShowDiagramFullscreenModal(true);
      document.body.style.overflow = "hidden";
    },
    []
  );

  const handleCloseDiagramFullscreenModal = useCallback(() => {
    setShowDiagramFullscreenModal(false);
    setDiagramDataForModal(null);
    setRepoNameForModal(undefined);
    setDefaultBranchForModal(null);
    document.body.style.overflow = "";
  }, []);

  const showOutputArea =
    (!isLoading &&
      (digest || (diagramData && filesToRenderInDiagram.length > 0)) &&
      !error) ||
    (!isLoading && processedRepoName && digest);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Header
        onToggleTokenModal={() => setShowTokenModal(true)}
        hasToken={!!githubToken}
        onToggleGeminiApiModal={() => setShowGeminiApiModal(true)}
        hasUserGeminiApiKey={!!userProvidedGeminiApiKey}
      />
      <div className="m-1">
        <div className="relative w-full max-w-4xl mx-auto flex sm:flex-row flex-col justify-center items-start sm:items-center pt-8 sm:pt-0">
          <svg
            className="h-auto w-16 sm:w-20 md:w-24 flex-shrink-0 p-2 md:relative sm:absolute lg:absolute left-0 lg:-translate-x-full md:translate-x-10 sm:-translate-y-16 md:-translate-y-0 -translate-x-2 lg:-translate-y-10"
            viewBox="0 0 91 98"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
              fill="#FE4A60"
              stroke="#000"
              strokeWidth="3.445"
            ></path>
            <path
              d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.21 3.453-12.905 12.854-14"
              stroke="#000"
              strokeWidth="2.548"
              strokeLinecap="round"
            ></path>
          </svg>
          <div className="text-center w-full flex flex-col items-center">
            <div className="mt-10">
              <a
                href="https://www.producthunt.com/products/git-scape-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-git&#0045;scape&#0045;ai"
                target="_blank"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=972181&theme=light&t=1748954910685"
                  alt="Git&#0032;Scape&#0032;AI - Understand&#0032;any&#0032;GitHub&#0032;repository&#0032;in&#0032;seconds | Product Hunt"
                  style={{ width: "200px", height: "54px" }}
                />
              </a>
            </div>
            <h1 className="text-4xl sm:text-5xl sm:pt-12 lg:pt-5 md:text-6xl lg:text-7xl font-bold tracking-tighter w-full inline-block relative">
              Understand Any Repo
              <br />
              In Seconds&nbsp;
            </h1>
          </div>
          <svg
            className="w-16 lg:w-20 h-auto lg:absolute flex-shrink-0 right-0 bottom-0 md:block hidden translate-y-10 md:translate-y-20 lg:translate-y-4 lg:translate-x-full -translate-x-10"
            viewBox="0 0 92 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
              fill="#5CF1A4"
              stroke="#000"
              strokeWidth="2.868"
              className=""
            ></path>
            <path
              d="M75.062 40.108c1.07 5.255 1.072 16.52-7.472 19.54m7.422-19.682c1.836 2.965 7.643 8.14 16.187 5.121-8.544 3.02-8.207 15.23-6.971 20.957-1.97-3.343-8.044-9.274-16.588-6.254M12.054 28.012c1.34-5.22 6.126-15.4 14.554-14.369M12.035 28.162c-.274-3.487-2.93-10.719-11.358-11.75C9.104 17.443 14.013 6.262 15.414.542c.226 3.888 2.784 11.92 11.212 12.95"
              stroke="#000"
              strokeWidth="2.319"
              strokeLinecap="round"
            ></path>
          </svg>
        </div>

        <div className="m-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
          <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/80 hover:border-slate-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-violet-500/20 rounded-full mr-3 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-violet-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-violet-400">
                Code Digest
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your AI-Ready code digest that converts any Git repository into
              clean text, making it easy to use with your preferred AI models.
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/80 hover:border-slate-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500/20 rounded-full mr-3 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-green-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-400">
                Code Visualization
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore interactive, zoomable diagrams of your GitHub repository
              structures.
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/80 hover:border-slate-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-sky-500/20 rounded-full mr-3 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-sky-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-400">
                Code Assistant
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instantly explain, debug, refactor, and discuss code with an AI
              that understands your repository.
            </p>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 flex-grow max-w-4xl">
        <div className="space-y-12">
          <section
            id="digest-generator-input"
            className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-slate-700"
          >
            {isLoading && progressPercent > 0 && (
              <div
                className="w-full bg-slate-600 rounded-full h-2.5 mb-3 overflow-hidden"
                aria-live="polite"
              >
                <div
                  className="bg-violet-500 h-2.5 rounded-full transition-all duration-300 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Generation progress"
                ></div>
              </div>
            )}
            <RepoInput
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              onGenerate={handleGenerateDigest}
              isLoading={isLoading}
            />
            {isLoading && progressMessage && (
              <p className="mt-3 text-sm text-violet-400 text-center">
                {progressMessage}
              </p>
            )}
            {error && !isLoading && (
              <p className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-700/50 p-3 rounded-md text-center">
                <span className="font-semibold">Error:</span> {error}
              </p>
            )}
          </section>

          {showOutputArea && (
            <section id="output-area">
              <OutputTabs
                digest={digest}
                isLoadingDigest={isLoading && progressPercent < 100 && !digest}
                diagramData={diagramData}
                repoName={processedRepoName!}
                repoNameForFilename={repoNameForFilename}
                defaultBranch={currentDefaultBranch}
                userProvidedGeminiApiKey={userProvidedGeminiApiKey}
                onOpenDiagramFullscreenModal={handleOpenDiagramFullscreenModal}
              />
            </section>
          )}
        </div>
      </main>

      <footer className="text-center py-8 mt-auto">
        <p className="text-sm text-slate-500">
          made with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/jmachete/"
            target="_blank"
            rel="noopener noreferrer"
          >
            João Machete
          </a>
        </p>
      </footer>

      {showTokenModal && (
        <GithubTokenModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onSaveToken={handleSaveToken}
          onClearToken={handleClearToken}
          currentToken={githubToken || ""}
        />
      )}
      {showGeminiApiModal && (
        <GeminiApiKeyModal
          isOpen={showGeminiApiModal}
          onClose={() => setShowGeminiApiModal(false)}
          onSaveKey={handleSaveUserGeminiApiKey}
          onClearKey={handleClearUserGeminiApiKey}
          currentKey={userProvidedGeminiApiKey || ""}
        />
      )}
      {showDiagramFullscreenModal &&
        diagramDataForModal &&
        repoNameForModal && (
          <DiagramFullscreenModal
            isOpen={showDiagramFullscreenModal}
            onClose={handleCloseDiagramFullscreenModal}
            data={diagramDataForModal}
            repoName={repoNameForModal}
            defaultBranch={defaultBranchForModal || ""}
          />
        )}
    </div>
  );
};

export default App;

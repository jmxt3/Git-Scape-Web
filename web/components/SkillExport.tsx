import React, { useState, useCallback } from "react";
import { SkillManifest } from "../types";

interface SkillExportProps {
  skillMd: string;
  manifestJson: SkillManifest | null;
  repoUrl: string;
  repoNameForFilename: string | null;
  githubToken: string | null;
}

const API_HOST = "api.gitscape.ai";

export const SkillExport: React.FC<SkillExportProps> = ({
  skillMd,
  manifestJson,
  repoUrl,
  repoNameForFilename,
  githubToken,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<"skill" | "manifest">("skill");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const handleDownloadZip = useCallback(async () => {
    if (!repoUrl) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const apiUrl = new URL(`https://${API_HOST}/skill-zip`);
      apiUrl.searchParams.append("repo_url", encodeURIComponent(repoUrl));
      if (githubToken) {
        apiUrl.searchParams.append(
          "github_token",
          encodeURIComponent(githubToken)
        );
      }

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${repoNameForFilename ?? "repo"}-skill.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setDownloadError(err.message ?? "Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [repoUrl, repoNameForFilename, githubToken]);

  const handleCopy = useCallback(async () => {
    const text =
      activePane === "skill"
        ? skillMd
        : JSON.stringify(manifestJson, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (_) {
      /* ignore */
    }
  }, [activePane, skillMd, manifestJson]);

  const manifestStr = manifestJson
    ? JSON.stringify(manifestJson, null, 2)
    : "{}";

  const languageList =
    manifestJson?.metadata?.primary_languages?.join(", ") ?? "—";
  const filesAnalyzed = manifestJson?.metadata?.files_analyzed ?? "—";
  const generatedAt = manifestJson?.metadata?.generated_at
    ? new Date(manifestJson.metadata.generated_at).toLocaleString()
    : "—";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Skill metadata pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {generatedAt}
          </span>
          <span className="flex items-center gap-1.5 bg-violet-500/10 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full">
            {filesAnalyzed} files
          </span>
          {languageList !== "—" && (
            <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
              {languageList}
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-green-500/10 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wide">
            agentskills.io v1.0
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            id="skill-copy-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500 transition-all duration-150"
            title="Copy to clipboard"
          >
            {copyState === "copied" ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            id="skill-download-zip-btn"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black transition-all duration-150 shadow-md hover:shadow-amber-500/25 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Packaging…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .zip
              </>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 px-3 py-2 rounded-lg">
          {downloadError}
        </p>
      )}

      {/* Pane toggle */}
      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-700 w-fit">
        <button
          id="skill-tab-skill-md"
          onClick={() => setActivePane("skill")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
            activePane === "skill"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          SKILL.md
        </button>
        <button
          id="skill-tab-manifest"
          onClick={() => setActivePane("manifest")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
            activePane === "manifest"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          manifest.json
        </button>
      </div>

      {/* Code pane */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 min-h-[400px]">
        {/* File label */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/60 z-10 backdrop-blur-sm">
          <span className="font-mono text-xs text-slate-400">
            {activePane === "skill" ? "SKILL.md" : "manifest.json"}
          </span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>

        <div className="pt-10 h-full overflow-auto">
          {activePane === "skill" ? (
            <MarkdownPreview content={skillMd} />
          ) : (
            <JsonPreview content={manifestStr} />
          )}
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-xs text-slate-500 text-center">
        Compatible with{" "}
        <a
          href="https://agentskills.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2"
        >
          agentskills.io
        </a>{" "}
        · Claude Skills · Google ADK · Agno · OpenAI Agents
      </p>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => (
  <pre className="p-4 text-xs leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-words select-all">
    {content || (
      <span className="text-slate-600 italic">No SKILL.md content available.</span>
    )}
  </pre>
);

const JsonPreview: React.FC<{ content: string }> = ({ content }) => {
  const highlighted = colorizeJson(content);
  return (
    <pre
      className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words select-all"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

/** Minimal JSON syntax highlighter — no external deps */
function colorizeJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "color:#6ee7b7"; // number — green
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "color:#93c5fd"; // key — blue
          } else {
            cls = "color:#fde68a"; // string — amber
          }
        } else if (/true|false/.test(match)) {
          cls = "color:#c084fc"; // bool — purple
        } else if (/null/.test(match)) {
          cls = "color:#94a3b8"; // null — slate
        }
        return `<span style="${cls}">${match}</span>`;
      }
    );
}

import React, { useState, useCallback } from "react";
import { SkillManifest } from "../types";
import type { ProgressReport } from "../services/webllm";

// Inline check — no import needed, just reads navigator.gpu
const webGPUSupported = typeof navigator !== "undefined" && "gpu" in navigator;

interface SkillExportProps {
  skillMd: string;
  manifestJson: SkillManifest | null;
  repoUrl: string;
  repoNameForFilename: string | null;
  githubToken: string | null;
  digest: string;
}

const API_HOST = "api.gitscape.ai";
type ActivePane = "skill" | "manifest" | "framework";
type Framework = "adk" | "agno";

export const SkillExport: React.FC<SkillExportProps> = ({
  skillMd,
  manifestJson,
  repoUrl,
  repoNameForFilename,
  githubToken,
  digest,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<ActivePane>("skill");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  // WebLLM state
  const [skillMdOverride, setSkillMdOverride] = useState<string>("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmProgress, setLlmProgress] = useState<ProgressReport | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);
  const webGPUOk = webGPUSupported;

  // Framework export state
  const [selectedFramework, setSelectedFramework] = useState<Framework>("adk");
  const [frameworkCode, setFrameworkCode] = useState<string>("");
  const [frameworkLoading, setFrameworkLoading] = useState(false);
  const [frameworkError, setFrameworkError] = useState<string | null>(null);

  const displaySkillMd = skillMdOverride || skillMd;
  const manifestStr = manifestJson ? JSON.stringify(manifestJson, null, 2) : "{}";
  const languageList = manifestJson?.metadata?.primary_languages?.join(", ") ?? "—";
  const filesAnalyzed = manifestJson?.metadata?.files_analyzed ?? "—";
  const generatedAt = manifestJson?.metadata?.generated_at
    ? new Date(manifestJson.metadata.generated_at).toLocaleString()
    : "—";

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDownloadZip = useCallback(async () => {
    if (!repoUrl) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const apiUrl = new URL(`https://${API_HOST}/skill-zip`);
      apiUrl.searchParams.append("repo_url", encodeURIComponent(repoUrl));
      if (githubToken) apiUrl.searchParams.append("github_token", encodeURIComponent(githubToken));
      const response = await fetch(apiUrl.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${repoNameForFilename ?? "repo"}-skill.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      setDownloadError(err.message ?? "Download failed.");
    } finally {
      setIsDownloading(false);
    }
  }, [repoUrl, repoNameForFilename, githubToken]);

  const handleCopy = useCallback(async () => {
    let text = "";
    if (activePane === "skill") text = displaySkillMd;
    else if (activePane === "manifest") text = manifestStr;
    else text = frameworkCode;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (_) {}
  }, [activePane, displaySkillMd, manifestStr, frameworkCode]);

  const handleGenerateDescription = useCallback(async () => {
    if (!webGPUOk) return;
    setLlmLoading(true);
    setLlmError(null);
    setLlmProgress(null);
    try {
      // Dynamic import — only fetches @mlc-ai/web-llm when user clicks the button
      const { generateSkillDescription } = await import("../services/webllm");
      const languages = manifestJson?.metadata?.primary_languages ?? [];
      const repoName = manifestJson?.display_name ?? repoNameForFilename ?? "this repo";
      const description = await generateSkillDescription(
        repoName,
        languages,
        digest,
        (report) => setLlmProgress(report)
      );
      // Patch the description field in the SKILL.md text
      const updated = displaySkillMd.replace(
        /description: ".*?"/s,
        `description: "${description.replace(/"/g, '\\"')}"`
      );
      setSkillMdOverride(updated);
    } catch (err: any) {
      setLlmError(err.message ?? "AI generation failed.");
    } finally {
      setLlmLoading(false);
      setLlmProgress(null);
    }
  }, [webGPUOk, manifestJson, repoNameForFilename, digest, displaySkillMd]);

  const handleLoadFramework = useCallback(async (fw: Framework) => {
    setSelectedFramework(fw);
    setFrameworkLoading(true);
    setFrameworkError(null);
    setFrameworkCode("");
    try {
      const apiUrl = new URL(`https://${API_HOST}/export/${fw}`);
      apiUrl.searchParams.append("repo_url", encodeURIComponent(repoUrl));
      const response = await fetch(apiUrl.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      setFrameworkCode(text);
    } catch (err: any) {
      setFrameworkError(err.message ?? "Failed to load framework export.");
    } finally {
      setFrameworkLoading(false);
    }
  }, [repoUrl]);

  const handleFrameworkTabClick = (fw: Framework) => {
    setActivePane("framework");
    handleLoadFramework(fw);
  };

  const handleDownloadFramework = useCallback(() => {
    if (!frameworkCode) return;
    const blob = new Blob([frameworkCode], { type: "text/x-python" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${repoNameForFilename ?? "repo"}-${selectedFramework}-skill.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [frameworkCode, repoNameForFilename, selectedFramework]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Metadata pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono">
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
          >
            {copyState === "copied" ? (
              <><svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400">Copied</span></>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>Copy</>
            )}
          </button>
          {activePane === "framework" && frameworkCode && (
            <button
              id="skill-download-py-btn"
              onClick={handleDownloadFramework}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all duration-150 shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download .py
            </button>
          )}
          <button
            id="skill-download-zip-btn"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black transition-all duration-150 shadow-md hover:shadow-amber-500/25 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Packaging…</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download .zip</>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 px-3 py-2 rounded-lg">{downloadError}</p>
      )}

      {/* Pane toggle */}
      <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-700 w-fit">
        {(["skill", "manifest"] as ActivePane[]).map((pane) => (
          <button
            key={pane}
            id={`skill-tab-${pane}`}
            onClick={() => setActivePane(pane)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
              activePane === pane
                ? pane === "skill"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {pane === "skill" ? "SKILL.md" : "manifest.json"}
          </button>
        ))}

        {/* Framework export buttons */}
        <span className="flex items-center px-2 text-slate-600 text-xs">|</span>
        <span className="flex items-center text-[10px] text-slate-500 pr-1 uppercase tracking-wider">Export:</span>
        {(["adk", "agno"] as Framework[]).map((fw) => (
          <button
            key={fw}
            id={`skill-tab-${fw}`}
            onClick={() => handleFrameworkTabClick(fw)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
              activePane === "framework" && selectedFramework === fw
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {fw === "adk" ? "Google ADK" : "Agno"}
          </button>
        ))}
      </div>

      {/* WebLLM AI Description section — only on SKILL.md pane */}
      {activePane === "skill" && (
        <div className="flex flex-col gap-2">
          {webGPUOk ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button
                  id="skill-ai-description-btn"
                  onClick={handleGenerateDescription}
                  disabled={llmLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white transition-all duration-150 shadow-md hover:shadow-violet-500/25 disabled:cursor-not-allowed"
                >
                  {llmLoading ? (
                    <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating…</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>✨ AI Description (WebGPU)</>
                  )}
                </button>
                <span className="text-[10px] text-slate-500">Qwen2 0.5B · runs in browser · no server cost</span>
              </div>
              {llmLoading && llmProgress && (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-48">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${Math.round((llmProgress.progress ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{llmProgress.text}</span>
                </div>
              )}
              {llmError && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 px-3 py-2 rounded-lg">{llmError}</p>
              )}
              {skillMdOverride && !llmLoading && (
                <p className="text-xs text-emerald-400">✓ Description updated with AI-generated content</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700 px-3 py-2 rounded-lg">
              ⚠️ WebGPU not available in this browser. Download the skill package and edit the{" "}
              <code className="text-amber-400/80">description</code> field manually.
            </p>
          )}
        </div>
      )}

      {/* Code pane */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 min-h-[400px]">
        {/* File label bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/60 z-10 backdrop-blur-sm">
          <span className="font-mono text-xs text-slate-400">
            {activePane === "skill" && "SKILL.md"}
            {activePane === "manifest" && "manifest.json"}
            {activePane === "framework" && `${repoNameForFilename ?? "repo"}-${selectedFramework}-skill.py`}
          </span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>

        <div className="pt-10 h-full overflow-auto">
          {activePane === "skill" && <MarkdownPreview content={displaySkillMd} />}
          {activePane === "manifest" && <JsonPreview content={manifestStr} />}
          {activePane === "framework" && (
            frameworkLoading ? (
              <div className="flex items-center justify-center h-full gap-3 text-slate-400">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span className="text-sm">Generating {selectedFramework.toUpperCase()} export…</span>
              </div>
            ) : frameworkError ? (
              <div className="p-4 text-xs text-red-400">{frameworkError}</div>
            ) : frameworkCode ? (
              <PythonPreview content={frameworkCode} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Select a framework above to generate the integration file.
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-500 text-center">
        Compatible with{" "}
        <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2">agentskills.io</a>
        {" "}· Claude Skills · Google ADK · Agno · OpenAI Agents
      </p>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => (
  <pre className="p-4 text-xs leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-words select-all">
    {content || <span className="text-slate-600 italic">No SKILL.md content available.</span>}
  </pre>
);

const JsonPreview: React.FC<{ content: string }> = ({ content }) => (
  <pre
    className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words select-all"
    dangerouslySetInnerHTML={{ __html: colorizeJson(content) }}
  />
);

const PythonPreview: React.FC<{ content: string }> = ({ content }) => (
  <pre
    className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words select-all"
    dangerouslySetInnerHTML={{ __html: colorizePython(content) }}
  />
);

function colorizeJson(json: string): string {
  return json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "color:#6ee7b7";
        if (/^"/.test(match)) cls = /:$/.test(match) ? "color:#93c5fd" : "color:#fde68a";
        else if (/true|false/.test(match)) cls = "color:#c084fc";
        else if (/null/.test(match)) cls = "color:#94a3b8";
        return `<span style="${cls}">${match}</span>`;
      }
    );
}

function colorizePython(code: string): string {
  const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')/g, `<span style="color:#fde68a">$1</span>`)
    .replace(/\b(from|import|def|class|return|if|else|elif|for|in|not|and|or|True|False|None|async|await|with|as|raise|try|except|finally|pass|lambda|yield|global|nonlocal)\b/g, `<span style="color:#93c5fd">$1</span>`)
    .replace(/(#[^\n]*)/g, `<span style="color:#6b7280">$1</span>`);
}

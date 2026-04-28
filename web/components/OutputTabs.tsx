import React, { useState } from 'react';
import { DigestOutput } from './DigestOutput';
import { Diagram } from './Diagram';
import { SkillExport } from './SkillExport';
import { RawDiagramNode, SkillManifest } from '../types';

interface OutputTabsProps {
  digest: string;
  isLoadingDigest: boolean;

  diagramData: RawDiagramNode | null;
  repoName: string; // This is owner/repo for display
  repoNameForFilename: string | null; // This is just 'repo' for filename
  defaultBranch: string | null;

  onOpenDiagramFullscreenModal: (data: RawDiagramNode, repoName: string, defaultBranch: string | null) => void;

  // Skill export fields
  skillMd?: string;
  manifestJson?: SkillManifest | null;
  repoUrl?: string;
  githubToken?: string | null;
}

type TabName = "Code Digest" | "Code Visualization" | "Skill Export";

interface TabStyle {
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const DiagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
  </svg>
);

const SkillIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const tabStyles: Record<TabName, TabStyle> = {
  "Code Digest": {
    textColor: "text-violet-400",
    borderColor: "border-violet-500",
    icon: <CodeIcon />,
  },
  "Code Visualization": {
    textColor: "text-green-400",
    borderColor: "border-green-500",
    icon: <DiagramIcon />,
  },
  "Skill Export": {
    textColor: "text-amber-400",
    borderColor: "border-amber-500",
    icon: <SkillIcon />,
  },
};

export const OutputTabs: React.FC<OutputTabsProps> = ({
  digest,
  isLoadingDigest,
  diagramData,
  repoName,
  repoNameForFilename,
  defaultBranch,
  onOpenDiagramFullscreenModal,
  skillMd,
  manifestJson,
  repoUrl,
  githubToken,
}) => {
  const [activeTab, setActiveTab] = useState<TabName>("Code Digest");

  const tabs: TabName[] = ["Code Digest", "Code Visualization", "Skill Export"];

  const tabBaseClasses =
    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-md focus:outline-none transition-colors duration-150 ease-in-out border-b-2";
  const activeTabBaseClasses = "bg-slate-800";
  const inactiveTabClasses =
    "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600";

  return (
    <div className="mt-8">
      <div className="mb-0 border-b border-slate-700 flex space-x-1">
        {tabs.map((tabName) => {
          const isActive = activeTab === tabName;
          const currentTabStyle = tabStyles[tabName];
          const activeClasses = isActive
            ? `${activeTabBaseClasses} ${currentTabStyle.textColor} ${currentTabStyle.borderColor}`
            : inactiveTabClasses;

          const isSkillTab = tabName === "Skill Export";

          return (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`${tabBaseClasses} ${activeClasses} ${isSkillTab && !isActive ? 'relative' : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
              id={`tab-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className={isActive ? currentTabStyle.textColor : 'text-slate-500'}>
                {currentTabStyle.icon}
              </span>
              {tabName}
              {isSkillTab && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  New
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-b-lg rounded-tr-lg shadow-xl border border-t-0 border-slate-700 min-h-[600px]">
        {activeTab === "Code Digest" && (
          <div
            id="tabpanel-code-digest"
            role="tabpanel"
            aria-labelledby="tab-code-digest"
            className="h-full flex flex-col"
          >
            <DigestOutput digest={digest} isLoading={isLoadingDigest} repoNameForFilename={repoNameForFilename} />
          </div>
        )}

        {activeTab === "Code Visualization" && (
          <div
            id="tabpanel-code-visualization"
            role="tabpanel"
            aria-labelledby="tab-code-visualization"
            className="h-[calc(70vh_-_40px)] max-h-[700px] min-h-[550px] w-full"
          >
            {diagramData && repoName && defaultBranch ? (
              <Diagram
                data={diagramData}
                repoName={repoName}
                defaultBranch={defaultBranch}
                onOpenFullscreenModal={onOpenDiagramFullscreenModal}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Visualization data not available or still loading.
              </div>
            )}
          </div>
        )}

        {activeTab === "Skill Export" && (
          <div
            id="tabpanel-skill-export"
            role="tabpanel"
            aria-labelledby="tab-skill-export"
            className="h-full flex flex-col"
          >
            {skillMd ? (
              <SkillExport
                skillMd={skillMd}
                manifestJson={manifestJson ?? null}
                repoUrl={repoUrl ?? ""}
                repoNameForFilename={repoNameForFilename}
                githubToken={githubToken ?? null}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <div className="p-4 bg-amber-500/10 rounded-full">
                  <SkillIcon />
                </div>
                <p className="text-sm">Generate a digest first to preview the Skill Export.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

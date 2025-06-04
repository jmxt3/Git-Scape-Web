import React, { useState } from 'react';
import { DigestOutput } from './DigestOutput';
import { Diagram } from './Diagram';
import { RepoChat } from './RepoChat';
import { RawDiagramNode } from '../types';

interface OutputTabsProps {
  digest: string;
  isLoadingDigest: boolean;

  diagramData: RawDiagramNode | null;
  repoName: string; // This is owner/repo for display
  repoNameForFilename: string | null; // This is just 'repo' for filename
  defaultBranch: string | null;

  userProvidedGeminiApiKey: string | null;
  onOpenDiagramFullscreenModal: (data: RawDiagramNode, repoName: string, defaultBranch: string | null) => void;
}

type TabName = "Code Digest" | "Code Visualization" | "Code Assistant";

interface TabStyle {
  textColor: string;
  borderColor: string;
}

const tabStyles: Record<TabName, TabStyle> = {
  "Code Digest": { textColor: "text-violet-400", borderColor: "border-violet-500" },
  "Code Visualization": { textColor: "text-green-400", borderColor: "border-green-500" },
  "Code Assistant": { textColor: "text-sky-400", borderColor: "border-sky-500" },
};

export const OutputTabs: React.FC<OutputTabsProps> = ({
  digest,
  isLoadingDigest,
  diagramData,
  repoName,
  repoNameForFilename,
  defaultBranch,
  userProvidedGeminiApiKey,
  onOpenDiagramFullscreenModal, // This prop name is from OutputTabsProps
}) => {
  const [activeTab, setActiveTab] = useState<TabName>("Code Digest");

  const handleTabClick = (tabName: TabName) => {
    setActiveTab(tabName);
  };

  const tabBaseClasses = "px-4 py-2.5 text-sm font-medium rounded-t-md focus:outline-none transition-colors duration-150 ease-in-out border-b-2";
  const activeTabBaseClasses = "bg-slate-800";
  const inactiveTabClasses = "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600";

  return (
    <div className="mt-8">
      <div className="mb-0 border-b border-slate-700 flex space-x-1">
        {(["Code Digest", "Code Visualization", "Code Assistant"] as TabName[]).map((tabName) => {
          const isActive = activeTab === tabName;
          const currentTabStyle = tabStyles[tabName];
          const activeClasses = isActive
            ? `${activeTabBaseClasses} ${currentTabStyle.textColor} ${currentTabStyle.borderColor}`
            : inactiveTabClasses;

          return (
            <button
              key={tabName}
              onClick={() => handleTabClick(tabName)}
              className={`${tabBaseClasses} ${activeClasses}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tabName}
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

        {activeTab === "Code Assistant" && (
          <div
            id="tabpanel-code-assistant"
            role="tabpanel"
            aria-labelledby="tab-code-assistant"
            className="h-full"
          >
            <RepoChat
              digest={digest}
              repoName={repoName}
              userProvidedGeminiApiKey={userProvidedGeminiApiKey}
            />
          </div>
        )}
      </div>
    </div>
  );
};

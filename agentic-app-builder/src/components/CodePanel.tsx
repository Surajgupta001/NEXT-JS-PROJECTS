'use client';

import React, { useEffect, useRef } from "react";
import { FileData, StatusStep } from "../../types/workspace";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview, SandpackFileExplorer, useSandpack } from '@codesandbox/sandpack-react';
import { dracula } from '@codesandbox/sandpack-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// ─── Placeholder ──────────────────────────────────────────────────────────────
const PLACEHOLDER_FILES = {
  "/App.js": {
    code: `export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <p style={{ fontSize: 14 }}>Your app will appear here</p>
      </div>
    </div>
  );
}`,
  },
};

// ─── Base dependencies ────────────────────────────────────────────────────────
const BASE_DEPENDENCIES: Record<string, string> = {
  "react-is": "latest",
  "react-router-dom": "latest",
  "lucide-react": "latest",
  recharts: "latest",
  "date-fns": "latest",
  "framer-motion": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  zod: "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-tooltip": "latest",
  "@radix-ui/react-accordion": "latest",
  "@radix-ui/react-select": "latest",
  axios: "latest",
  clsx: "latest",
  "class-variance-authority": "latest",
  "tailwind-merge": "latest",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ActiveTab = "preview" | "code";

interface CodePanelProps {
  fileData: FileData | null;
  isGenerating: boolean;
  statusLog: StatusStep[];
  onFilePatch: (patches: FileData) => void;
}

function SandpackInner({ fileData, isGenerating, activeTab, setActiveTab }: { fileData: FileData | null; isGenerating: boolean; activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void }) {
  const { sandpack, listen } = useSandpack();

  // ─── SandpackInner ────────────────────────────────────────────────────────────
  // Lives inside SandpackProvider so it can call useSandpack().
  // Receives fileData as a prop and uses updateFile() to push code changes
  // into the live Sandpack instance without remounting the provider.

  const prevFilesRef = useRef<Record<string, { code: string }>>({});
  useEffect(() => {
    if (!fileData?.files) return;

    const prev = prevFilesRef.current;

    for (const [path, { code }] of Object.entries(fileData.files)) {
      if (prev[path]?.code !== code) {
        sandpack.updateFile(path, code);
      }
    }
    prevFilesRef.current = fileData.files;
  }, [fileData?.files]);

  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">
        You can change your password here.
      </TabsContent>
    </Tabs>
  )
}


export default function CodePanel({ fileData, isGenerating, statusLog, onFilePatch }: CodePanelProps) {

  const [activeTab, setActiveTab] = React.useState<ActiveTab>("preview");

  const files = fileData?.files ?? PLACEHOLDER_FILES;

  const dependencies = {
    ...BASE_DEPENDENCIES,
    ...(fileData?.dependencies ?? {}),
  };

  const filePathKey = Object.keys(files).sort().join("|");

  return (
    <div>
      <SandpackProvider
        key={filePathKey}
        template="react"
        theme={dracula}
        files={files}
        customSetup={{ dependencies }}
        options={{
          // Tailwind v3 CDN - Injected into preview iframe
          externalResources: [
            "https://cdn.tailwindcss.com",
          ],
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
      >
        <SandpackInner
          fileData={fileData}
          isGenerating={isGenerating}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </SandpackProvider>
    </div>
  );

}
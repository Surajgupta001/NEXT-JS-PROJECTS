import React from "react";
import { FileData, StatusStep } from "../../types/workspace";

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

// ─── SandpackInner ────────────────────────────────────────────────────────────
// Lives inside SandpackProvider so it can call useSandpack().
// Receives fileData as a prop and uses updateFile() to push code changes
// into the live Sandpack instance without remounting the provider.

export default function CodePanel({ fileData, isGenerating, statusLog, onFilePatch }: CodePanelProps) {
    
    const [activeTab, setActiveTab] = React.useState<ActiveTab>("preview");
    
}
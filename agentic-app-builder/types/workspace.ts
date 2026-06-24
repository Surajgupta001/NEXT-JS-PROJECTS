export type MessageRole = 'user' | 'assistant';

export interface Message {
    role: MessageRole;
    content: string;
    imageUrl?: string;
}

// Files + depenedencies always travel together as one unit
// This is what gets saved to Prisma as a single Json Column
export interface FileData {
    files: Record<string, { code: string }>;
    dependencies: Record<string, string>;
    title: string;
}

export interface StatusStep {
    label: string;
    status: 'running' | 'done';
}

export interface WorkspaceData {
    id: string;
    title: string | null;
    messages: unknown; // Prisma return json - we parse it at time
    fileData: unknown;
}

export interface WorkspaceUser {
    id: string;
    credits: number;
    plan: string;
}
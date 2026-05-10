"use client";

import { CodeEditorState } from "@/types";
import { create } from "zustand/react";
import { Monaco } from "@monaco-editor/react";

const getInitialState = () => {

    // If we're running on the server, then return default values
    if (typeof window === 'undefined') {
        return {
            language: 'javascript',
            fontSize: 16,
            theme: 'vs-dark',
        }
    }

    // If we're running on the client, then we can access localStorage because it is available in the browser API
    const savedLanguage = localStorage.getItem('editor-language') || 'javascript';
    const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark';
    const savedFontSize = localStorage.getItem('editor-fontSize') || '16';

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize)
    };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,
        output: '',
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || '',

        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`);
            if (savedCode) editor.setValue(savedCode);
            set({ editor });
        },

        setTheme: (theme: string) => {
            localStorage.setItem('editor-theme', theme);
            set({ theme });
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem('editor-fontSize', fontSize.toString());
            set({ fontSize });
        },

        setLanguage: (language: string) => {
            // Save the current code before switching languages
            const currentCode = get().editor?.getValue();
            if (currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode);
            }
            localStorage.setItem('editor-language', language);
            set({
                language,
                editor: null, // Reset the editor so that it can be re-initialized with the new language
                output: '',
            })
        },

        runCode: async () => {
            // TODO:
        },
    };
});
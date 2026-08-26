"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Menubar from "./Menubar";

interface RichTextEditorProps {
    field: {
        value: string;
        onChange: (value: string) => void;
    };
}

export default function RichTextEditor({ field }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],

        content: getInitialContent(field.value),

        editorProps: {
            attributes: {
                class: "min-h-[300px] w-full max-w-none p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert",
            },
        },

        onUpdate: ({ editor }) => {
            field.onChange(
                JSON.stringify(editor.getJSON())
            );
        },

        immediatelyRender: false,
    });

    return (
        <div className="w-full overflow-hidden rounded-lg border border-input bg-background dark:bg-input/30">
            <Menubar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};


function getInitialContent(value: string) {
    if (!value) {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                },
            ],
        };
    }

    try {
        return JSON.parse(value);
    } catch {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                },
            ],
        };
    }
}
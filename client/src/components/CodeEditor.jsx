import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({
    value,
    onChange,
    language = "javascript",
    height = "400px",
    theme = "vs-dark",
    readOnly = false,
    className = "",
}) => {
    const editorRef = useRef(null);

    // Language mapping for Monaco Editor
    const getMonacoLanguage = (lang) => {
        const languageMap = {
            js: "javascript",
            py: "python",
            java: "java",
            cpp: "cpp",
            c: "c",
            cs: "csharp",
            go: "go",
            rs: "rust",
            php: "php",
            rb: "ruby",
        };
        return languageMap[lang] || "plaintext";
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Configure editor options
        editor.updateOptions({
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: readOnly,
            cursorStyle: "line",
            mouseWheelZoom: true,
        });

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            // Trigger run code when Ctrl+Enter is pressed
            const runButton = document.querySelector(
                '[data-action="run-code"]'
            );
            if (runButton) runButton.click();
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
            () => {
                // Trigger submit when Ctrl+Shift+Enter is pressed
                const submitButton = document.querySelector(
                    '[data-action="submit-code"]'
                );
                if (submitButton) submitButton.click();
            }
        );
    };

    const handleEditorChange = (value) => {
        if (onChange) {
            onChange(value || "");
        }
    };

    return (
        <div
            className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
        >
            <Editor
                height={height}
                language={getMonacoLanguage(language)}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: readOnly,
                    cursorStyle: "line",
                    automaticLayout: true,
                    fontSize: 14,
                    fontFamily:
                        "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                    fontLigatures: true,
                    lineHeight: 20,
                    letterSpacing: 0.5,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    tabSize: 4,
                    insertSpaces: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                    contextmenu: true,
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    cursorBlinking: "blink",
                    cursorSmoothCaretAnimation: true,
                    renderWhitespace: "selection",
                    renderControlCharacters: false,
                    fontWeight: "normal",
                    bracketPairColorization: {
                        enabled: true,
                    },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                    },
                    padding: {
                        top: 16,
                        bottom: 16,
                    },
                    suggest: {
                        insertMode: "replace",
                        filterGraceful: true,
                        showKeywords: true,
                        showSnippets: true,
                        showClasses: true,
                        showFunctions: true,
                        showVariables: true,
                    },
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false,
                    },
                    parameterHints: {
                        enabled: true,
                    },
                    autoIndent: "full",
                    formatOnPaste: true,
                    formatOnType: true,
                }}
                loading={
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                }
            />
        </div>
    );
};

export default CodeEditor;

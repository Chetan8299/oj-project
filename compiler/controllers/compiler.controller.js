import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Supported languages configuration
const LANGUAGES = {
    js: {
        name: "JavaScript",
        extension: "js",
        command: (filename) => `node ${filename}`,
        template: (code) => code,
    },
    py: {
        name: "Python",
        extension: "py",
        command: (filename) => `python3 ${filename}`,
        template: (code) => code,
    },
    java: {
        name: "Java",
        extension: "java",
        command: (filename) => {
            const className = path.basename(filename, ".java");
            return `javac "${filename}" && java ${className}`;
        },
        template: (code) => {
            // Extract class name from code or use default
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            const className = classMatch ? classMatch[1] : "Main";

            if (code.includes("public class")) {
                return code;
            } else {
                return `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n${code}\n    }\n}`;
            }
        },
        getFilename: (code, timestamp, uniqueId) => {
            // Extract class name from code to determine filename
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            const className = classMatch ? classMatch[1] : "Main";
            // Java requires exact class name as filename, so we'll use a unique temp directory instead
            return `${className}.java`;
        },
    },
    cpp: {
        name: "C++",
        extension: "cpp",
        command: (filename) => {
            const outputFile = filename.replace(".cpp", ".exe");
            return `g++ -o "${outputFile}" "${filename}" && "${outputFile}"`;
        },
        template: (code) => {
            return code.includes("#include")
                ? code
                : `#include <iostream>\nusing namespace std;\n\nint main() {\n${code}\n    return 0;\n}`;
        },
    },
    c: {
        name: "C",
        extension: "c",
        command: (filename) => {
            const outputFile = filename.replace(".c", ".exe");
            return `gcc -o "${outputFile}" "${filename}" && "${outputFile}"`;
        },
        template: (code) => {
            return code.includes("#include")
                ? code
                : `#include <stdio.h>\n\nint main() {\n${code}\n    return 0;\n}`;
        },
    },
    go: {
        name: "Go",
        extension: "go",
        command: (filename) => `go run ${filename}`,
        template: (code) => {
            return code.includes("package main")
                ? code
                : `package main\n\nimport "fmt"\n\nfunc main() {\n${code}\n}`;
        },
    },
    rs: {
        name: "Rust",
        extension: "rs",
        command: (filename) => {
            const outputFile = filename.replace(".rs", ".exe");
            return `rustc "${filename}" -o "${outputFile}" && "${outputFile}"`;
        },
        template: (code) => {
            return code.includes("fn main") ? code : `fn main() {\n${code}\n}`;
        },
    },
    php: {
        name: "PHP",
        extension: "php",
        command: (filename) => `php ${filename}`,
        template: (code) => {
            return code.includes("<?php") ? code : `<?php\n${code}\n?>`;
        },
    },
    rb: {
        name: "Ruby",
        extension: "rb",
        command: (filename) => `ruby ${filename}`,
        template: (code) => code,
    },
};

const compilerController = {
    executeCode: async (req, res) => {
        try {
            const { code, language, input = "" } = req.body;

            // Validate input
            if (!code || !language) {
                return res.status(400).json({
                    success: false,
                    message: "Code and language are required",
                });
            }

            if (!LANGUAGES[language]) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported language: ${language}. Supported languages: ${Object.keys(
                        LANGUAGES
                    ).join(", ")}`,
                });
            }

            const langConfig = LANGUAGES[language];
            const uniqueId = crypto.randomBytes(8).toString("hex");
            const timestamp = Date.now();

            // Prepare code with template first
            const finalCode = langConfig.template(code);

            // Generate filename based on final code for Java, or use default for others
            const filename =
                language === "java" && langConfig.getFilename
                    ? langConfig.getFilename(finalCode, timestamp, uniqueId)
                    : `temp_${timestamp}_${uniqueId}.${langConfig.extension}`;

            // For Java, create a unique subdirectory to avoid filename conflicts
            const tempDir =
                language === "java"
                    ? path.join(
                          __dirname,
                          "..",
                          "temp",
                          `java_${timestamp}_${uniqueId}`
                      )
                    : path.join(__dirname, "..", "temp");
            const filepath = path.join(tempDir, filename);

            // Create temp directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Write code to file
            fs.writeFileSync(filepath, finalCode);

            // Execute code
            const command = langConfig.command(filepath);
            const options = {
                cwd: tempDir,
                timeout: 10000, // 10 seconds timeout
                maxBuffer: 1024 * 1024, // 1MB buffer
            };

            let result;
            try {
                if (input && language === "java") {
                    // For Java, we need to handle input differently
                    // First compile, then run with input
                    const compileCommand = `javac "${filepath}"`;
                    const className = path.basename(filepath, ".java");
                    const runCommand = `java ${className}`;

                    // Compile first
                    await execAsync(compileCommand, options);

                    // Write input to a temporary file
                    const inputFile = path.join(tempDir, `input.txt`);
                    fs.writeFileSync(inputFile, input);

                    // Run with input redirection
                    result = await execAsync(
                        `${runCommand} < "${inputFile}"`,
                        options
                    );

                    // Clean up input file
                    try {
                        fs.unlinkSync(inputFile);
                    } catch (cleanupError) {
                        console.warn(
                            "Input file cleanup error:",
                            cleanupError.message
                        );
                    }
                } else if (input) {
                    // For other languages with input
                    const inputFile = path.join(
                        tempDir,
                        `input_${timestamp}_${uniqueId}.txt`
                    );
                    fs.writeFileSync(inputFile, input);

                    // Execute command with input redirection
                    result = await execAsync(
                        `${command} < "${inputFile}"`,
                        options
                    );

                    // Clean up input file
                    try {
                        fs.unlinkSync(inputFile);
                    } catch (cleanupError) {
                        console.warn(
                            "Input file cleanup error:",
                            cleanupError.message
                        );
                    }
                } else {
                    result = await execAsync(command, options);
                }
            } catch (execError) {
                // More detailed error handling
                let errorMessage = execError.message;
                let detailedError = execError.stderr || execError.message;

                if (
                    execError.code === "ENOENT" ||
                    errorMessage.includes("cannot find")
                ) {
                    if (language === "cpp") {
                        errorMessage =
                            "C++ compiler (g++) not found. Please install MinGW or Visual Studio Build Tools.";
                    } else if (language === "c") {
                        errorMessage =
                            "C compiler (gcc) not found. Please install MinGW or Visual Studio Build Tools.";
                    } else if (language === "java") {
                        errorMessage =
                            "Java compiler (javac) not found. Please install JDK.";
                    } else if (language === "py") {
                        errorMessage =
                            "Python not found. Please install Python.";
                    } else if (language === "go") {
                        errorMessage =
                            "Go compiler not found. Please install Go.";
                    } else if (language === "rs") {
                        errorMessage =
                            "Rust compiler (rustc) not found. Please install Rust.";
                    } else {
                        errorMessage = `${langConfig.name} compiler/interpreter not found.`;
                    }
                }

                return res.status(200).json({
                    success: false,
                    message: errorMessage,
                    output: "",
                    error: detailedError,
                    executionTime: 0,
                });
            }

            // Clean up temporary files
            try {
                if (language === "java") {
                    // For Java, clean up the entire temp subdirectory
                    fs.rmSync(tempDir, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filepath);
                    // Clean up compiled files for C++, C, Rust
                    if (["cpp", "c", "rs"].includes(language)) {
                        const outputFile = filepath.replace(
                            `.${langConfig.extension}`,
                            ".exe"
                        );
                        if (fs.existsSync(outputFile))
                            fs.unlinkSync(outputFile);
                    }
                }
            } catch (cleanupError) {
                console.warn("Cleanup error:", cleanupError.message);
            }

            return res.status(200).json({
                success: true,
                message: "Code executed successfully",
                output: result.stdout,
                error: result.stderr || null,
                language: langConfig.name,
                executionTime: 0, // Todo: Implement execution time later
            });
        } catch (error) {
            console.error("Execution error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    },

    getSupportedLanguages: (req, res) => {
        const languages = Object.entries(LANGUAGES).map(([key, config]) => ({
            value: key,
            label: config.name,
            extension: config.extension,
        }));

        return res.status(200).json({
            success: true,
            message: "Supported languages retrieved successfully",
            data: languages,
        });
    },
};

export default compilerController;

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Function to measure memory usage
const getMemoryUsage = (pid) => {
    try {
        const memoryInfo = fs.readFileSync(`/proc/${pid}/status`, "utf8");
        const vmPeak = memoryInfo.match(/VmPeak:\s+(\d+)/);
        return vmPeak ? parseInt(vmPeak[1]) : 0; // Returns KB
    } catch (error) {
        // If /proc is not available (e.g., on Windows), use process.memoryUsage
        const memoryUsage = process.memoryUsage();
        return Math.round(memoryUsage.heapUsed / 1024); // Convert bytes to KB
    }
};

// Function to execute command with time and memory tracking
const executeWithMetrics = async (command, options, input = null) => {
    const startTime = performance.now();
    let result;
    let verdict = null;

    try {
        if (input) {
            // Write input to a temporary file
            const inputFile = path.join(options.cwd, `input_${Date.now()}.txt`);
            fs.writeFileSync(inputFile, input);

            try {
                result = await execAsync(
                    `${command} < "${inputFile}"`,
                    options
                );
            } finally {
                // Clean up input file
                try {
                    fs.unlinkSync(inputFile);
                } catch (error) {
                    console.warn("Input file cleanup error:", error.message);
                }
            }
        } else {
            result = await execAsync(command, options);
        }
    } catch (error) {
        const endTime = performance.now();
        const executionTime = Math.round(endTime - startTime);

        // Check if it's a timeout error
        if (error.killed && error.signal === "SIGTERM") {
            verdict = "Time Limit Exceeded";
        } else if (
            error.code === "ENOBUFS" ||
            error.message.includes("maxBuffer")
        ) {
            verdict = "Memory Limit Exceeded";
        } else {
            verdict = "Runtime Error";
        }

        throw {
            ...error,
            verdict,
            executionTime,
            memory: getMemoryUsage(process.pid),
        };
    }

    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);

    // Get memory usage
    const memory = getMemoryUsage(process.pid);

    return {
        ...result,
        executionTime,
        memory,
        verdict: verdict || "Success",
    };
};

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

const cleanupFiles = (filepath, language, tempDir) => {
    try {
        // For Java, clean up the entire temp directory
        if (language === "java") {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } else {
            // For other languages, clean up the source and compiled files
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            // Clean up compiled files for C++, C, Rust
            if (["cpp", "c", "rs"].includes(language)) {
                const outputFile = filepath.replace(`.${language}`, ".exe");
                if (fs.existsSync(outputFile)) {
                    fs.unlinkSync(outputFile);
                }
            }
        }
    } catch (cleanupError) {
        console.warn("Cleanup error:", cleanupError.message);
    }
};

const compilerController = {
    executeCode: async (req, res) => {
        const tempDir = path.join(__dirname, "..", "temp");
        let filepath = null;
        let language = null;

        try {
            const { code, language: reqLanguage, input = "" } = req.body;
            language = reqLanguage;

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
            const finalCode = langConfig.template(code);

            const filename =
                language === "java" && langConfig.getFilename
                    ? langConfig.getFilename(finalCode, timestamp, uniqueId)
                    : `temp_${timestamp}_${uniqueId}.${langConfig.extension}`;

            const execTempDir =
                language === "java"
                    ? path.join(tempDir, `java_${timestamp}_${uniqueId}`)
                    : tempDir;
            filepath = path.join(execTempDir, filename);

            if (!fs.existsSync(execTempDir)) {
                fs.mkdirSync(execTempDir, { recursive: true });
            }

            fs.writeFileSync(filepath, finalCode);

            const options = {
                cwd: execTempDir,
                timeout: 10000,
                maxBuffer: 1024 * 1024,
            };

            let result;
            try {
                if (language === "java") {
                    const compileCommand = `javac "${filepath}"`;
                    const className = path.basename(filepath, ".java");
                    const runCommand = `java ${className}`;

                    await execAsync(compileCommand, options);
                    result = await executeWithMetrics(
                        runCommand,
                        options,
                        input
                    );
                } else {
                    const command = langConfig.command(filepath);
                    result = await executeWithMetrics(command, options, input);
                }

                return res.status(200).json({
                    success: true,
                    message: "Code executed successfully",
                    output: result.stdout,
                    error: result.stderr || null,
                    language: langConfig.name,
                    executionTime: result.executionTime,
                    memory: result.memory,
                });
            } catch (execError) {
                return res.status(200).json({
                    success: false,
                    message: execError.verdict || execError.message,
                    output: "",
                    error: execError.stderr || execError.message,
                    verdict: execError.verdict || "Runtime Error",
                    executionTime: execError.executionTime || 0,
                    memory: execError.memory || 0,
                });
            } finally {
                // Ensure cleanup happens whether execution succeeds or fails
                cleanupFiles(filepath, language, execTempDir);
            }
        } catch (error) {
            console.error("Execution error:", error);
            // If we have filepath and language info, try to clean up
            if (filepath && language) {
                cleanupFiles(filepath, language, tempDir);
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
                executionTime: 0,
                memory: 0,
            });
        }
    },

    executeTestCases: async (req, res) => {
        const tempDir = path.join(__dirname, "..", "temp");
        let currentFilepath = null;
        let currentTempDir = null;
        let language = null;

        try {
            const {
                code,
                language: reqLanguage,
                testCases,
                timeLimit = 10000, // Default 10s
                memoryLimit = 256, // Default 256MB
            } = req.body;
            language = reqLanguage;

            if (!code || !language || !testCases) {
                return res.status(400).json({
                    success: false,
                    message: "Code, language and testCases are required",
                });
            }

            const results = [];
            let passedTests = 0;
            let totalExecutionTime = 0;
            let maxMemory = 0;

            // Pre-compile the code once for compiled languages
            const langConfig = LANGUAGES[language];
            const uniqueId = crypto.randomBytes(8).toString("hex");
            const timestamp = Date.now();
            const finalCode = langConfig.template(code);

            const filename =
                language === "java" && langConfig.getFilename
                    ? langConfig.getFilename(finalCode, timestamp, uniqueId)
                    : `temp_${timestamp}_${uniqueId}.${langConfig.extension}`;

            const execTempDir =
                language === "java"
                    ? path.join(tempDir, `java_${timestamp}_${uniqueId}`)
                    : tempDir;

            currentTempDir = execTempDir;
            currentFilepath = path.join(execTempDir, filename);

            if (!fs.existsSync(execTempDir)) {
                fs.mkdirSync(execTempDir, { recursive: true });
            }

            fs.writeFileSync(currentFilepath, finalCode);

            // Compile once for compiled languages
            let compiledExecutable = null;
            try {
                const compileOptions = {
                    cwd: execTempDir,
                    timeout: 30000, // 30s for compilation
                    maxBuffer: 1024 * 1024 * 10, // 10MB for compilation output
                };

                if (language === "cpp" || language === "c") {
                    const outputFile = currentFilepath.replace(
                        `.${language}`,
                        ".exe"
                    );
                    const compileCommand =
                        language === "cpp"
                            ? `g++ -o "${outputFile}" "${currentFilepath}"`
                            : `gcc -o "${outputFile}" "${currentFilepath}"`;

                    await execAsync(compileCommand, compileOptions);
                    compiledExecutable = outputFile;
                } else if (language === "java") {
                    const compileCommand = `javac "${currentFilepath}"`;
                    await execAsync(compileCommand, compileOptions);
                    compiledExecutable = path.basename(
                        currentFilepath,
                        ".java"
                    );
                } else if (language === "rs") {
                    const outputFile = currentFilepath.replace(".rs", ".exe");
                    const compileCommand = `rustc "${currentFilepath}" -o "${outputFile}"`;
                    await execAsync(compileCommand, compileOptions);
                    compiledExecutable = outputFile;
                }
            } catch (compileError) {
                // Compilation failed
                return res.status(200).json({
                    success: false,
                    message: "Compilation Error",
                    error: compileError.stderr || compileError.message,
                    results: [],
                    summary: {
                        total: testCases.length,
                        passed: 0,
                        failed: testCases.length,
                        totalExecutionTime: 0,
                        maxMemory: 0,
                    },
                });
            }

            // Now run each test case
            for (const testCase of testCases) {
                const { input, output } = testCase;

                try {
                    const options = {
                        cwd: execTempDir,
                        timeout: timeLimit,
                        maxBuffer: memoryLimit * 1024 * 1024, // Convert MB to bytes
                    };

                    let executionResult;
                    if (compiledExecutable) {
                        // Use pre-compiled executable
                        let runCommand;
                        if (language === "java") {
                            runCommand = `java ${compiledExecutable}`;
                        } else {
                            runCommand = `"${compiledExecutable}"`;
                        }
                        executionResult = await executeWithMetrics(
                            runCommand,
                            options,
                            input
                        );
                    } else {
                        // For interpreted languages, use original command
                        const command = langConfig.command(currentFilepath);
                        executionResult = await executeWithMetrics(
                            command,
                            options,
                            input
                        );
                    }

                    const executionOutput = executionResult.stdout.trim();
                    const expectedOutput = output.trim();
                    const passed = executionOutput === expectedOutput;

                    if (passed) passedTests++;

                    totalExecutionTime += executionResult.executionTime;
                    maxMemory = Math.max(maxMemory, executionResult.memory);

                    // Check for verdict information from executeWithMetrics
                    const verdict = passed ? "Accepted" : "Wrong Answer";

                    results.push({
                        input,
                        expectedOutput,
                        actualOutput: executionOutput,
                        passed,
                        verdict,
                        executionTime: executionResult.executionTime,
                        memory: executionResult.memory,
                    });
                } catch (execError) {
                    // Use verdict from executeWithMetrics if available, otherwise determine it
                    let verdict = execError.verdict || "Runtime Error";
                    let errorMessage = execError.stderr || execError.message;

                    // Override message for timeout/memory errors
                    if (verdict === "Time Limit Exceeded") {
                        errorMessage = `Time limit of ${timeLimit}ms exceeded`;
                    } else if (verdict === "Memory Limit Exceeded") {
                        errorMessage = `Memory limit of ${memoryLimit}MB exceeded`;
                    }

                    totalExecutionTime += execError.executionTime || 0;
                    maxMemory = Math.max(maxMemory, execError.memory || 0);

                    results.push({
                        input,
                        expectedOutput: output,
                        actualOutput: errorMessage,
                        passed: false,
                        verdict,
                        error: true,
                        executionTime: execError.executionTime || 0,
                        memory: execError.memory || 0,
                    });
                }
            }

            return res.json({
                success: true,
                results,
                summary: {
                    total: testCases.length,
                    passed: passedTests,
                    failed: testCases.length - passedTests,
                    totalExecutionTime,
                    maxMemory,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                executionTime: 0,
                memory: 0,
            });
        } finally {
            // Clean up all files after all test cases
            if (currentFilepath && language) {
                cleanupFiles(currentFilepath, language, currentTempDir);
            }
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

/**
 * Constraint Parser Utility
 * Parses text constraints into structured rules for enforcement
 */

class ConstraintParser {
    constructor() {
        // Common patterns for constraint parsing
        this.patterns = {
            // -1000 ≤ a, b ≤ 1000 (comma-separated variables)
            multiVarRange:
                /(-?\d+)\s*[≤<=]\s*([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*[≤<=]\s*(-?\d+(?:\^\d+)?)/g,
            // 1 ≤ n ≤ 10^5, 1 <= n <= 10^5
            range: /(-?\d+)\s*[≤<=]\s*([a-zA-Z_]\w*(?:\[[\w\]]*\])?)\s*[≤<=]\s*(-?\d+(?:\^\d+)?)/g,
            // n ≤ 10^5, n <= 10^5
            upperBound:
                /([a-zA-Z_]\w*(?:\[[\w\]]*\])?)\s*[≤<=]\s*(-?\d+(?:\^\d+)?)/g,
            // 1 ≤ n, 1 <= n
            lowerBound: /(-?\d+)\s*[≤<=]\s*([a-zA-Z_]\w*(?:\[[\w\]]*\])?)/g,
            // |s| ≤ 100 (string length)
            stringLength: /\|([a-zA-Z_]\w*)\|\s*[≤<=]\s*(\d+(?:\^\d+)?)/g,
            // Time limits in problem text
            timeLimit:
                /time\s*limit[:\s]*(\d+(?:\.\d+)?)\s*(seconds?|ms|milliseconds?)/i,
            // Memory limits in problem text
            memoryLimit: /memory\s*limit[:\s]*(\d+)\s*(mb|gb|kb)/i,
        };
    }

    /**
     * Parse exponent notation (e.g., 10^5) to actual number
     * Also handles negative numbers (e.g., -10^3)
     */
    parseExponent(str) {
        if (str.includes("^")) {
            const [base, exp] = str.split("^");
            return Math.pow(parseInt(base), parseInt(exp));
        }
        return parseInt(str);
    }

    /**
     * Determine constraint type based on variable name
     */
    getConstraintType(variable) {
        if (variable.includes("[") && variable.includes("]")) {
            return "integer"; // Array element
        }
        if (
            variable === "n" ||
            variable === "m" ||
            variable.endsWith("_size")
        ) {
            return "array_size";
        }
        return "integer";
    }

    /**
     * Calculate time limit based on constraint complexity
     */
    calculateTimeLimit(constraints) {
        let maxComplexity = 1000; // Default for simple problems

        for (const constraint of constraints) {
            if (constraint.type === "array_size") {
                const size = constraint.max || 1000;
                // Estimate complexity based on array size
                if (size <= 1000) maxComplexity = Math.max(maxComplexity, 1000);
                else if (size <= 100000)
                    maxComplexity = Math.max(maxComplexity, 100000);
                else if (size <= 1000000)
                    maxComplexity = Math.max(maxComplexity, 1000000);
                else maxComplexity = Math.max(maxComplexity, 10000000);
            }
        }

        // Convert complexity to time limit (rough estimation)
        if (maxComplexity <= 1000) return 1000; // 1s
        if (maxComplexity <= 100000) return 2000; // 2s
        if (maxComplexity <= 1000000) return 3000; // 3s
        return 5000; // 5s for very large inputs
    }

    /**
     * Calculate memory limit based on constraint complexity
     */
    calculateMemoryLimit(constraints) {
        let maxArraySize = 0;

        for (const constraint of constraints) {
            if (constraint.type === "array_size") {
                maxArraySize = Math.max(maxArraySize, constraint.max || 1000);
            }
        }

        // Estimate memory based on largest array
        if (maxArraySize <= 1000) return 64; // 64MB
        if (maxArraySize <= 100000) return 128; // 128MB
        if (maxArraySize <= 1000000) return 256; // 256MB
        return 512; // 512MB for very large arrays
    }

    /**
     * Parse constraint text into structured constraints
     */
    parseConstraints(constraintText, difficulty = "Medium") {
        const constraints = [];
        let timeLimit = null;
        let memoryLimit = null;

        // Extract explicit time and memory limits
        const timeLimitMatch = constraintText.match(this.patterns.timeLimit);
        if (timeLimitMatch) {
            const value = parseFloat(timeLimitMatch[1]);
            const unit = timeLimitMatch[2].toLowerCase();
            if (unit.includes("ms") || unit.includes("millisecond")) {
                timeLimit = value;
            } else {
                timeLimit = value * 1000; // Convert seconds to milliseconds
            }
        }

        const memoryLimitMatch = constraintText.match(
            this.patterns.memoryLimit
        );
        if (memoryLimitMatch) {
            const value = parseInt(memoryLimitMatch[1]);
            const unit = memoryLimitMatch[2].toLowerCase();
            if (unit === "gb") {
                memoryLimit = value * 1024;
            } else if (unit === "kb") {
                memoryLimit = value / 1024;
            } else {
                memoryLimit = value; // MB
            }
        }

        // Parse multi-variable range constraints (-1000 ≤ a, b ≤ 1000)
        let match;
        this.patterns.multiVarRange.lastIndex = 0;
        while (
            (match = this.patterns.multiVarRange.exec(constraintText)) !== null
        ) {
            const min = parseInt(match[1]);
            const variablesStr = match[2];
            const max = this.parseExponent(match[3]);

            // Split comma-separated variables
            const variables = variablesStr.split(",").map((v) => v.trim());

            for (const variable of variables) {
                constraints.push({
                    variable,
                    min,
                    max,
                    type: this.getConstraintType(variable),
                });
            }
        }

        // Parse range constraints (1 ≤ n ≤ 10^5)
        this.patterns.range.lastIndex = 0;
        while ((match = this.patterns.range.exec(constraintText)) !== null) {
            const min = parseInt(match[1]);
            const variable = match[2];
            const max = this.parseExponent(match[3]);

            // Skip if already processed by multiVarRange
            if (!constraints.find((c) => c.variable === variable)) {
                constraints.push({
                    variable,
                    min,
                    max,
                    type: this.getConstraintType(variable),
                });
            }
        }

        // Parse upper bound constraints (n ≤ 10^5)
        this.patterns.upperBound.lastIndex = 0;
        while (
            (match = this.patterns.upperBound.exec(constraintText)) !== null
        ) {
            const variable = match[1];
            const max = this.parseExponent(match[2]);

            // Skip if already captured by range or multiVarRange pattern
            if (!constraints.find((c) => c.variable === variable)) {
                constraints.push({
                    variable,
                    min: 1, // Default minimum for positive constraints
                    max,
                    type: this.getConstraintType(variable),
                });
            }
        }

        // Parse lower bound constraints (1 ≤ n or -1000 ≤ x)
        this.patterns.lowerBound.lastIndex = 0;
        while (
            (match = this.patterns.lowerBound.exec(constraintText)) !== null
        ) {
            const min = parseInt(match[1]);
            const variable = match[2];

            // Skip if already captured by range or multiVarRange pattern
            if (!constraints.find((c) => c.variable === variable)) {
                constraints.push({
                    variable,
                    min,
                    max: null, // No upper bound specified
                    type: this.getConstraintType(variable),
                });
            }
        }

        // Parse string length constraints (|s| ≤ 100)
        this.patterns.stringLength.lastIndex = 0;
        while (
            (match = this.patterns.stringLength.exec(constraintText)) !== null
        ) {
            const variable = match[1];
            const max = this.parseExponent(match[2]);

            constraints.push({
                variable,
                min: 0,
                max,
                type: "string_length",
            });
        }

        // Calculate limits if not explicitly specified
        if (!timeLimit) {
            timeLimit = this.calculateTimeLimit(constraints);
            // Adjust based on difficulty
            if (difficulty === "Easy") timeLimit *= 0.8;
            if (difficulty === "Hard") timeLimit *= 1.5;
        }

        if (!memoryLimit) {
            memoryLimit = this.calculateMemoryLimit(constraints);
        }

        return {
            timeLimit: Math.round(timeLimit),
            memoryLimit: Math.round(memoryLimit),
            inputConstraints: constraints,
        };
    }

    /**
     * Validate input against constraints
     */
    validateInput(input, constraints) {
        const errors = [];
        const lines = input.trim().split("\n");

        try {
            // Simple validation - check first line for basic constraints
            if (constraints.length > 0 && lines.length > 0) {
                const firstLineValues = lines[0]
                    .split(" ")
                    .map((x) => parseInt(x.trim()))
                    .filter((x) => !isNaN(x));

                for (
                    let i = 0;
                    i < Math.min(constraints.length, firstLineValues.length);
                    i++
                ) {
                    const constraint = constraints[i];
                    const value = firstLineValues[i];

                    if (constraint.min !== null && value < constraint.min) {
                        errors.push(
                            `${constraint.variable} = ${value} is less than minimum ${constraint.min}`
                        );
                    }
                    if (constraint.max !== null && value > constraint.max) {
                        errors.push(
                            `${constraint.variable} = ${value} exceeds maximum ${constraint.max}`
                        );
                    }
                }
            }
        } catch (error) {
            errors.push(`Invalid input format: ${error.message}`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

export default new ConstraintParser();

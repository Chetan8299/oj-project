# AlgoVerse Online Judge

AlgoVerse is a full-stack online judge platform for practicing algorithms and data structures, featuring problem solving, code execution, AI code review, and user management.

---

## Features

- **User Authentication**: Register, login, and manage profiles.
- **Problem Solving**: Browse, filter, and solve curated algorithmic problems.
- **Problem Creation**: Setters/admins can create, edit, and delete problems with sample and hidden test cases.
- **Code Editor**: In-browser code editor with language selection and theme support.
- **Code Execution**: Run code against custom input or sample test cases.
- **Submission & Judging**: Submit solutions for automatic judging against hidden test cases.
- **AI Code Review**: Get instant AI-powered feedback on code quality, bugs, and improvements.
- **Admin Panel**: Manage users and roles (admin, setter, user).
- **Statistics**: Track submissions, accepted problems, and progress.

---

## Workflow

### 1. User Flow
- Users register/login and are authenticated via JWT tokens.
- Authenticated users can browse problems, submit solutions, and view their stats.
- Admins/setters can create/edit/delete problems and manage users.

### 2. Problem Solving
- Users select a problem, read the description, and write code in the editor.
- Users can run code against sample inputs for quick feedback.
- On submission, the code is sent to the backend for judging.

### 3. Submission & Judging
- Backend fetches the problem's sample and hidden test cases.
- Code and test cases are sent to the compiler service for execution.
- Compiler service runs the code in a sandboxed environment, enforcing time/memory limits and language constraints.
- Results (pass/fail, execution time, memory, verdict) are returned to the backend.
- Backend saves the submission and verdict in the database.
- User receives detailed feedback (Accepted, Wrong Answer, Compilation Error, etc.).

### 4. AI Code Review
- Users can request an AI review of their code.
- Backend sends code to Google Gemini via the AI controller.
- AI returns a markdown-formatted review (quality, bugs, suggestions).

---

## Tech Stack

- **Frontend**: React, Redux, TailwindCSS, Monaco Editor
- **Backend**: Node.js, Express, MongoDB, JWT, Google Gemini API
- **Compiler Service**: Node.js, Docker, supports C, C++, Java, Python, Go, Rust, Ruby

---

## Directory Structure

- `client/` - React frontend
- `server/` - Express backend API
- `compiler/` - Code execution and judging microservice

---

## Setup (Development)

1. Clone the repo and install dependencies in `client/`, `server/`, and `compiler/`.
2. Set up environment variables for MongoDB, JWT, and Gemini API keys.
3. Start the compiler service (`npm run dev` in `compiler/`).
4. Start the backend server (`npm run dev` in `server/`).
5. Start the frontend (`npm run dev` in `client/`).

---

## API Endpoints (Key)

- `/api/v1/users/` - Auth, profile, admin user management
- `/api/v1/problems/` - CRUD, list, submit, submissions
- `/api/v1/compiler/` - Code execution, test case evaluation
- `/api/v1/ai/` - AI code review

---

## Judging & Constraints
- Each problem defines sample and hidden test cases, time/memory/input constraints.
- Compiler service enforces constraints and returns detailed verdicts.
- Submissions are stored with verdict, stats, and code for user review.

---

## License
MIT 
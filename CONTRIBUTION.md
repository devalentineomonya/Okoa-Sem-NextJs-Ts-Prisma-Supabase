# Contribution Guide for OKOA SEM Application

Thank you for your interest in contributing to OKOA SEM! This guide will help you understand how to contribute new features (e.g., video file support, authentication) or improvements to the application. Let’s build something great together!

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Contribution Workflow](#contribution-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Feature-Specific Guidelines](#feature-specific-guidelines)
7. [Code of Conduct](#code-of-conduct)
8. [Need Help?](#need-help)

---

## Getting Started

### Prerequisites
- **Node.js v18+**
- **Git**
- **Package Manager** (npm, yarn, or pnpm)
- **Database** (PostgreSQL/MySQL/SQLite – check `prisma/schema.prisma`)
- Basic understanding of:
  - Next.js 14+
  - TypeScript
  - Prisma ORM
  - Tailwind CSS

---

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/okoa-sem.git
cd okoa-sem
```

### 2. Install Dependencies
```bash
npm install  # or yarn/pnpm
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_SECRET="your-secret-key"  # For authentication
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Sync with Prisma schema:
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the Application
```bash
npm run dev
```

---

## Contribution Workflow

### 1. Create an Issue
- Discuss your proposed feature/bug fix in the [GitHub Issues](https://github.com/your-org/okoa-sem/issues) tab.
- Use labels like `feature`, `bug`, or `enhancement`.

### 2. Branch Naming Convention
Create a new branch from `main`:
```bash
git checkout -b feat/video-support  # For features
git checkout -b fix/login-error     # For bug fixes
```

### 3. Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add video upload support
fix: resolve login token expiration
docs: update contribution guide
```

### 4. Open a Pull Request (PR)
- Target the `main` branch.
- Include:
  - Description of changes
  - Screenshots/GIFs (for UI changes)
  - Related issue number

---

## Coding Standards

### 1. Code Style
- **TypeScript**: Strict mode enforced.
- **Tailwind CSS**: Use utility classes (avoid custom CSS unless necessary).
- **Components**: Atomic design pattern (atoms, molecules, organisms).

### 2. Folder Structure
```
src/
├── app/            # Next.js pages and layouts
├── components/     # Reusable UI components
├── lib/            # Utilities, constants, and helpers
├── prisma/         # Database schema and migrations
├── public/         # Static assets
└── types/          # TypeScript types
```

### 3. Documentation
- Add JSDoc comments for complex functions.
- Update README.md for major changes.

### 4. Security
- Never hardcode secrets.
- Sanitize user inputs (e.g., file uploads).

---

## Feature-Specific Guidelines

### 1. Adding Video File Support
**Steps**:
1. **Backend**:
   - Extend Prisma schema to support video metadata:
     ```prisma
     model Video {
       id        String @id @default(uuid())
       title     String
       url       String
       duration  Int
       createdAt DateTime @default(now())
     }
     ```
   - Create an API route (`/api/videos/upload`) for handling uploads.
   - Use FFmpeg/WASM for video transcoding.

2. **Frontend**:
   - Add a video upload component (`components/VideoUpload.tsx`).
   - Use react-dropzone for drag-and-drop functionality.
   - Display videos using `<video>` tag or a player library (e.g., `react-player`).

**Tips**:
- Limit file types to MP4, WebM.
- Use AWS S3 or Firebase Storage for large files.

### 2. Implementing Authentication
**Steps**:
1. Integrate NextAuth.js:
   ```tsx
   // pages/api/auth/[...nextauth].ts
   import NextAuth from "next-auth";
   import GitHubProvider from "next-auth/providers/github";

   export default NextAuth({
     providers: [
       GitHubProvider({
         clientId: process.env.GITHUB_ID,
         clientSecret: process.env.GITHUB_SECRET,
       }),
     ],
   });
   ```

2. Add role-based access control (RBAC):
   ```ts
   // types/user.ts
   type UserRole = "STUDENT" | "ADMIN" | "LECTURER";
   ```

3. Protect routes using middleware:
   ```ts
   // middleware.ts
   export { default } from "next-auth/middleware";
   ```

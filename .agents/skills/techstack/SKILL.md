---
name: web-dev-stack
description: Strictly enforces Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Drizzle ORM, NextAuth.js, Vercel, and Git automation. Use for full-stack web development tasks.
---

# Web Development Agent Instructions

## Role
Senior Full-Stack Developer. Build modern, scalable web app. Manage Git version control autonomously.

## Tech Stack (STRICT)
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Authentication:** NextAuth.js (Auth.js) with Drizzle Adapter
- **Deployment:** Vercel

## Token Optimization & Output Rules
- **No Fluff:** Provide only necessary code, terminal commands, or file structures. No polite greetings or explanations.
- **Diffs Only:** For existing files, output only changed functions/blocks with `// ... existing code ...`. Never reprint whole file.
- **Targeted Generation:** Generate only immediately necessary files.

## Coding Standards
- **TypeScript First:** `.ts` / `.tsx` only. Strong typing, strict interfaces.
- **App Router:** Use `/app` directory conventions.
- **RSC Default:** Server Components by default. `'use client'` only for React hooks or browser APIs.
- **Secrets:** `.env.local` only. Never hardcode credentials.
- **Clean Code:** Modular, readable, clean structure.

## Development Workflow
1. **Init:** Next.js + Tailwind + TypeScript.
2. **UI:** Init shadcn/ui, add base components (`button`, `input`, `form`).
3. **Database:** Install Drizzle ORM + kit, configure `drizzle.config.ts`, connect Supabase (`postgres` / `pg`), define NextAuth schema.
4. **Auth:** NextAuth.js + Drizzle Adapter + providers (Google/GitHub/Email).
5. **Features:** Build requested pages, components, server actions / API routes.

## Git Automation (CRITICAL)
Run after major milestones or task completion:
```bash
git init
git add .
git commit -m "feat: [concise description]"
git branch -M main
```
If remote URL given:
```bash
git remote add origin <REPOSITORY_URL>
git push -u origin main
```
Resolve conflicts cleanly. Force push only if instructed.

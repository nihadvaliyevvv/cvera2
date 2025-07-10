# CVera Project - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

CVera is a professional CV platform built with Next.js, TypeScript, and Tailwind CSS. The application allows users to create, manage, and export professional CVs with LinkedIn import capabilities, template selection, and subscription management.

## Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with TypeORM/Prisma
- **Authentication**: JWT with refresh tokens stored in httpOnly cookies
- **Payments**: epoint.az integration for Azerbaijan users (only payment method)
- **File Generation**: Puppeteer for PDF, docx library for DOCX
- **External APIs**: RapidAPI for LinkedIn scraping

## Key Features

1. **Authentication System**: JWT-based auth with refresh tokens
2. **CV Management**: Create, edit, delete CVs with JSON data structure
3. **LinkedIn Import**: Scrape LinkedIn profiles with API key rotation
4. **Template System**: Tiered templates based on subscription level
5. **Subscription Management**: Free/Medium/Premium tiers with epoint.az
6. **File Generation**: Async PDF/DOCX generation with job queue
7. **Real-time Preview**: Live CV preview while editing

## Code Standards

- Use TypeScript with strict mode
- Follow Next.js 15 App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling and validation
- Use React Server Components where appropriate
- Follow security best practices (OWASP guidelines)

## Database Schema

Key models: users, cvs, templates, subscriptions, api_keys, file_generation_jobs

## API Endpoints

RESTful API structure with proper authentication and rate limiting:
- `/api/auth/*` - Authentication endpoints
- `/api/cvs/*` - CV management
- `/api/templates/*` - Template management
- `/api/import/*` - LinkedIn import
- `/api/webhooks/*` - epoint.az webhooks

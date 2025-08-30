# Overview

BlogCraft is a modern full-stack blogging platform built with React, Express, and PostgreSQL. The application features AI-powered content analysis, user authentication through Replit Auth, and a comprehensive content management system with admin moderation capabilities. Users can create, publish, and interact with blog posts while administrators can moderate content with the help of AI sentiment analysis and quality scoring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **File Structure**: Monorepo structure with shared schema between client and server

## Database Design
- **Users Table**: Stores user profiles with admin role support
- **Blogs Table**: Content storage with status workflow (draft → pending → approved/rejected)
- **Comments Table**: Threaded comments system linked to blogs and users
- **Likes Table**: User engagement tracking for blog posts
- **Sessions Table**: Required for Replit Auth session persistence

## Content Management Workflow
- **Draft System**: Users can save articles as drafts before submission
- **Moderation Pipeline**: Submitted articles enter pending status for admin review
- **AI Analysis**: OpenAI GPT-5 integration for content sentiment analysis and quality scoring
- **Admin Dashboard**: Comprehensive moderation tools with bulk actions and analytics

## API Architecture
- **RESTful Design**: Standard HTTP methods with JSON payloads
- **Authentication Middleware**: Route-level protection with user session validation
- **Error Handling**: Centralized error handling with structured responses
- **Request Logging**: Automatic API request/response logging for debugging

## Key Features
- **Markdown Editor**: Real-time preview with syntax highlighting
- **Search & Discovery**: Full-text search across blog content
- **Trending Algorithm**: View-based content ranking system
- **User Profiles**: Author pages with statistics and content history
- **Responsive Design**: Mobile-first approach with adaptive layouts

# External Dependencies

## Core Services
- **Neon Database**: PostgreSQL hosting with serverless connection pooling
- **OpenAI API**: GPT-5 integration for content analysis and sentiment scoring
- **Replit Auth**: OAuth2/OpenID Connect authentication service

## UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for enhanced user experience

## Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Production bundling for server-side code

## Runtime Dependencies
- **Express Session**: Session management with PostgreSQL persistence
- **React Query**: Server state caching and synchronization
- **React Hook Form**: Form validation and state management
- **Date-fns**: Date manipulation and formatting utilities
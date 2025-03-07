# Task Manager Application

A full-stack task management application built with React, TypeScript, and Supabase.

#live deme [https://taskmanagement-mern.vercel.app/]

## Features

- User authentication (sign up, login)
- Create, read, update, and delete tasks
- Assign categories to tasks
- Set priority levels (high, medium, low)
- Mark tasks as completed or pending
- Set due dates for tasks
- Filter tasks by category and status
- Search tasks by title
- Sort tasks by various criteria
- Dashboard with task statistics

## Technologies Used

- **Frontend**:

  - React
  - TypeScript
  - Tailwind CSS
  - React Router
  - React Hot Toast (for notifications)
  - Date-fns (for date formatting)
  - Lucide React (for icons)

- **Backend**:
  - Supabase (PostgreSQL database)
  - Supabase Authentication
  - Row Level Security (RLS)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Connect to Supabase:

   - Click the "Connect to Supabase" button in the top right corner
   - Create a new Supabase project or connect to an existing one
   - This will automatically set up the required environment variables

4. Run the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/context` - React context for state management
- `/src/lib` - Utility functions and Supabase client
- `/src/pages` - Application pages
- `/src/types` - TypeScript type definitions
- `/supabase/migrations` - SQL migrations for Supabase

## Database Schema

### Tasks Table

- `id` (uuid, primary key)
- `created_at` (timestamp)
- `title` (text)
- `description` (text, nullable)
- `is_completed` (boolean)
- `user_id` (uuid, references auth.users)
- `category` (text, nullable)
- `priority` (text, nullable)
- `due_date` (timestamp, nullable)

### Categories Table

- `id` (uuid, primary key)
- `name` (text)
- `user_id` (uuid, references auth.users)
- `created_at` (timestamp)

## Security

The application implements Row Level Security (RLS) to ensure that users can only access their own data. Policies are set up for each table to restrict access based on the authenticated user's ID.

## Deployment

To deploy this application:

1. Build the project:

   ```
   npm run build
   ```

2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Future Enhancements

- Task sharing and collaboration
- Email notifications for upcoming due dates
- Recurring tasks
- Task attachments
- Mobile application

VITE_SUPABASE_URL=https://jnpztmirpmgcrewfsykm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucHp0bWlycG1nY3Jld2ZzeWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTY0MjYsImV4cCI6MjA1NjQ3MjQyNn0.pW3B4k0DPcLmli9N8gpmXEmVAvyo52UalQpbyrkL9uo

# Todo Frontend

A clean and modern todo application frontend built with Next.js, TypeScript, and shadcn/ui components. This frontend seamlessly integrates with the todo-fast NestJS backend.

## Features

- **Authentication**: Login and registration with session-based auth
- **Role-based Access**: Different permissions for USER, MANAGER, and ADMIN roles
- **Task Management**: Create, update, delete, and view tasks
- **Real-time Stats**: Dashboard with task statistics
- **Clean UI**: Modern interface using shadcn/ui components
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **date-fns** for date formatting

## Prerequisites

Make sure the todo-fast backend is running on `http://localhost:3000`

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── AuthForm.tsx      # Authentication form
│   ├── Dashboard.tsx     # Main dashboard
│   ├── TaskForm.tsx      # Task creation form
│   ├── TaskList.tsx      # Task list display
│   └── TaskStats.tsx     # Task statistics
├── lib/                  # Utility functions
│   ├── api.ts           # API service
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── index.ts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

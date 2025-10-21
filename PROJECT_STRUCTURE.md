# Todo List Application - Project Structure & Context

## 📋 Project Overview

A full-stack todo list application with role-based access control, built with modern web technologies. The project consists of a NestJS backend API and a Next.js frontend with real-time features.

### 🎯 Key Features
- **Authentication & Authorization**: Session-based auth with role-based access (USER, MANAGER, ADMIN)
- **Task Management**: CRUD operations with priority levels, status tracking, and due dates
- **Real-time Updates**: WebSocket integration for live notifications
- **Role-based Permissions**: Different access levels for different user roles
- **AI Integration**: OpenAI integration for task description suggestions
- **Modern UI**: Built with Next.js 15, Tailwind CSS, and shadcn/ui components

---

## 🏗️ Project Structure

```
todolist/
├── 📁 todo-fast/                    # Backend API (NestJS)
│   ├── 📁 src/
│   │   ├── 📁 auth/                 # Authentication module
│   │   │   ├── auth.controller.ts   # Auth endpoints (login, register, logout)
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── auth.module.ts       # Auth module configuration
│   │   │   ├── 📁 decorators/       # Custom decorators (Session, Roles)
│   │   │   ├── 📁 dto/              # Data transfer objects
│   │   │   ├── 📁 enums/            # Role enums
│   │   │   └── 📁 guards/           # Auth guards (SessionAuth, RoleGuard)
│   │   ├── 📁 tasks/                # Task management module
│   │   │   ├── tasks.controller.ts  # Task CRUD endpoints
│   │   │   ├── tasks.service.ts     # Task business logic
│   │   │   ├── tasks.module.ts      # Task module configuration
│   │   │   ├── 📁 dto/              # Task DTOs (Create, Update)
│   │   │   ├── 📁 enums/            # Task enums (Status, Priority)
│   │   │   └── 📁 schemas/          # MongoDB schemas
│   │   ├── 📁 users/                # User management module
│   │   │   ├── users.controller.ts  # User endpoints
│   │   │   ├── users.service.ts     # User business logic
│   │   │   └── users.module.ts      # User module configuration
│   │   ├── 📁 notifications/        # WebSocket notifications
│   │   │   ├── notifications.gateway.ts  # Socket.IO gateway
│   │   │   └── notifications.module.ts   # Notifications module
│   │   ├── 📁 ai-suggest/           # AI integration module
│   │   │   ├── ai-suggest.controller.ts  # AI endpoints
│   │   │   ├── ai-suggest.service.ts     # OpenAI integration
│   │   │   └── ai-suggest.module.ts      # AI module
│   │   ├── 📁 config/               # Configuration files
│   │   │   └── session.config.ts    # Session configuration
│   │   ├── 📁 interfaces/           # TypeScript interfaces
│   │   ├── app.module.ts            # Main app module
│   │   └── main.ts                  # Application entry point
│   ├── 📄 package.json              # Backend dependencies
│   ├── 📄 Dockerfile                # Backend containerization
│   ├── 📄 .env.example              # Environment variables template
│   └── 📄 README.md                 # Backend documentation
│
├── 📁 todo-frontend/                # Frontend Application (Next.js)
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 (auth)/               # Auth route group
│   │   │   ├── login/page.tsx       # Login page
│   │   │   └── register/page.tsx    # Registration page
│   │   ├── 📁 dashboard/            # Dashboard route group
│   │   │   ├── page.tsx             # Main dashboard
│   │   │   ├── tasks/page.tsx       # Tasks management
│   │   │   ├── analytics/page.tsx   # Analytics page
│   │   │   ├── users/page.tsx       # User management (Admin)
│   │   │   └── settings/page.tsx    # Settings page
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   ├── 📁 components/               # React components
│   │   ├── 📁 ui/                   # shadcn/ui components
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── input.tsx            # Input component
│   │   │   ├── dialog.tsx           # Dialog component
│   │   │   └── ... (32 UI components)
│   │   ├── 📁 dashboard/            # Dashboard-specific components
│   │   │   ├── TaskDashboard.tsx    # Main task dashboard
│   │   │   ├── TaskCard.tsx         # Individual task card
│   │   │   ├── TaskForm.tsx         # Task creation/edit form
│   │   │   ├── TaskList.tsx         # Task list view
│   │   │   ├── TaskStats.tsx        # Task statistics
│   │   │   ├── UserManagement.tsx   # User management (Admin)
│   │   │   ├── Analytics.tsx        # Analytics dashboard
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   └── Header.tsx           # Dashboard header
│   │   ├── 📁 forms/                # Form components
│   │   │   └── TaskFormDialog.tsx   # Task form dialog
│   │   ├── AuthForm.tsx             # Authentication form
│   │   ├── Dashboard.tsx            # Main dashboard component
│   │   ├── TaskForm.tsx             # Task form component
│   │   └── TaskList.tsx             # Task list component
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── api.ts                   # API service layer
│   │   ├── auth.tsx                 # Authentication context
│   │   └── utils.ts                 # Utility functions
│   ├── 📁 types/                    # TypeScript type definitions
│   │   └── index.ts                 # Shared types and interfaces
│   ├── 📁 hooks/                    # Custom React hooks
│   │   └── use-toast.ts             # Toast notification hook
│   ├── 📄 package.json              # Frontend dependencies
│   ├── 📄 Dockerfile                # Frontend containerization
│   ├── 📄 next.config.ts            # Next.js configuration
│   ├── 📄 tailwind.config.js        # Tailwind CSS configuration
│   └── 📄 components.json           # shadcn/ui configuration
│
├── 📄 DEPLOYMENT.md                 # Deployment guide and troubleshooting
└── 📄 PROJECT_STRUCTURE.md          # This file
```

---

## 🛠️ Technology Stack

### Backend (todo-fast)
- **Framework**: NestJS 11.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Express Sessions with connect-mongo
- **Real-time**: Socket.IO for WebSocket connections
- **AI Integration**: OpenAI API for task suggestions
- **Validation**: class-validator and class-transformer
- **Security**: bcrypt for password hashing, CORS enabled
- **Development**: TypeScript, ESLint, Prettier

### Frontend (todo-frontend)
- **Framework**: Next.js 15.x with App Router
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts for analytics
- **Notifications**: Sonner for toast messages

---

## 🔐 Authentication & Authorization

### Session-Based Authentication
- **Session Storage**: MongoDB with connect-mongo
- **Cookie Configuration**: 
  - `httpOnly: true` for security
  - `secure: true` in production (HTTPS)
  - `sameSite: 'none'` for cross-origin requests
  - 24-hour expiration

### Role-Based Access Control (RBAC)
```typescript
enum Role {
  USER = 'USER',        // Basic user - can view/edit assigned tasks
  MANAGER = 'MANAGER',  // Can create tasks, assign to users
  ADMIN = 'ADMIN'       // Full access to all features
}
```

### Permission Matrix
| Feature | USER | MANAGER | ADMIN |
|---------|------|---------|-------|
| View assigned tasks | ✅ | ✅ | ✅ |
| Edit assigned tasks | ✅ | ✅ | ✅ |
| Create tasks | ❌ | ✅ | ✅ |
| Assign tasks | ❌ | ✅ | ✅ |
| Delete tasks | Own only | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ |
| System analytics | ❌ | ✅ | ✅ |

---

## 📊 Data Models

### User Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string; // hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Schema
```typescript
interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority; // LOW, MEDIUM, HIGH
  status: TaskStatus;     // PENDING, IN_PROGRESS, COMPLETED
  assignedTo: User | string;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🌐 API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/me` - Get current user info

### Task Routes (`/tasks`)
- `GET /tasks` - Get tasks (filtered by role)
- `POST /tasks` - Create new task (Manager/Admin)
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/my-tasks` - Get current user's tasks
- `GET /tasks/user/:userId` - Get tasks by user (Manager/Admin)
- `GET /tasks/:id` - Get single task
- `PATCH /tasks/:id` - Update task
- `PATCH /tasks/:id/assign` - Reassign task (Manager/Admin)
- `DELETE /tasks/:id` - Delete task
- `DELETE /tasks/bulk/:ids` - Bulk delete tasks (Manager/Admin)

### User Routes (`/users`)
- `GET /users/me` - Get current user profile
- `GET /users/list` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID

### AI Routes (`/ai-suggest`)
- `POST /ai-suggest/improvement` - Get AI task description suggestions

---

## 🔧 Configuration & Environment

### Backend Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/todo-fast

# Authentication
SESSION_SECRET=your-super-secure-session-secret-here

# Server
NODE_ENV=development
PORT=4000

# CORS
CORS_ORIGIN=http://localhost:3000

# AI Integration
OPENAI_API_KEY=your-openai-api-key
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 Development Workflow

### Backend Development
```bash
cd todo-fast
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev     # Start development server
```

### Frontend Development
```bash
cd todo-frontend
npm install
npm run dev          # Start development server
```

### Production Build
```bash
# Backend
npm run build
npm run start:prod

# Frontend
npm run build
npm start
```

---

## 🐳 Docker Configuration

### Backend Dockerfile
- Multi-stage build for optimization
- Node.js 20 Alpine base image
- Production dependencies only in final stage
- Exposes port 4000

### Frontend Dockerfile
- Multi-stage build with Next.js standalone output
- Optimized for production deployment
- Non-root user for security
- Exposes port 3000

---

## 🔄 Real-time Features

### WebSocket Integration
- **Gateway**: `NotificationsGateway` handles Socket.IO connections
- **Events**: Task creation, updates, assignments trigger real-time notifications
- **Client Integration**: Frontend connects to WebSocket for live updates

### Notification Types
- Task assigned to user
- Task status changed
- New task created
- Task deadline approaching

---

## 🎨 UI/UX Design System

### Component Architecture
- **Atomic Design**: Base UI components in `/components/ui/`
- **Feature Components**: Domain-specific components in feature folders
- **Layout Components**: Page layouts and navigation
- **Form Components**: Reusable form elements with validation

### Design Tokens
- **Colors**: Tailwind CSS color palette with dark/light theme support
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized margin and padding scale
- **Animations**: Smooth transitions and micro-interactions

---

## 🔍 Key Implementation Details

### Session Management
- MongoDB session store for persistence
- Automatic session cleanup with TTL
- Cross-origin cookie handling for deployment

### Error Handling
- Global exception filters in NestJS
- Consistent error response format
- Client-side error boundaries and toast notifications

### Data Validation
- Backend: class-validator decorators
- Frontend: Zod schemas with React Hook Form
- Type safety across the full stack

### Security Measures
- Password hashing with bcrypt
- Session-based authentication
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Role-based route protection

---

## 📈 Performance Optimizations

### Backend
- MongoDB indexing for efficient queries
- Lazy loading of related data
- Pagination for large datasets
- Connection pooling

### Frontend
- Next.js App Router for optimal loading
- Component lazy loading
- Image optimization
- Bundle splitting and code splitting

---

## 🧪 Testing Strategy

### Backend Testing
- Unit tests with Jest
- Integration tests for API endpoints
- Database testing with in-memory MongoDB

### Frontend Testing
- Component testing with React Testing Library
- E2E testing capabilities
- Type checking with TypeScript

---

## 📦 Deployment Architecture

### Production Setup
- **Backend**: Containerized NestJS application
- **Frontend**: Static Next.js build with standalone output
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Session Store**: MongoDB collection for session persistence

### Environment Considerations
- HTTPS required for secure cookies
- CORS configuration for cross-origin requests
- Environment-specific configuration management
- Health checks and monitoring

---

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **TypeScript**: Type safety and better DX
- **Husky**: Git hooks for pre-commit checks

### Development Experience
- **Hot Reload**: Both frontend and backend support hot reload
- **Type Generation**: Shared types between frontend and backend
- **API Documentation**: Swagger/OpenAPI integration potential
- **Debugging**: VS Code debugging configuration

---

This project structure provides a solid foundation for a scalable, maintainable todo list application with modern web development practices and comprehensive feature set.

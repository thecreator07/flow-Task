# Todo Fast API

A simple todo application built with NestJS and MongoDB for a college project.

## Features

- User registration and login with sessions
- Role-based access (USER, ADMIN)
- Simple todo management
- MongoDB database

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/todo-fast
SESSION_SECRET=my-secret-key
PORT=4000
```

3. Start the app:
```bash
npm run start:dev
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/me` - Get user info

### Users
- `GET /users/me` - Get my profile
- `GET /users/list` - List all users (Admin only)

## Tech Stack

- NestJS
- MongoDB
- Express Sessions
- bcrypt

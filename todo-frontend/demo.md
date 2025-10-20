# Todo Frontend Demo

## How to Test the Application

### 1. Start the Backend
Make sure your todo-fast backend is running:
```bash
cd ../todo-fast
npm run start:dev
```
The backend should be running on `http://localhost:3000`

### 2. Start the Frontend
```bash
npm install
npm run dev
```
The frontend will run on `http://localhost:3001`

### 3. Test Authentication

#### Register a New User
1. Go to `http://localhost:3001`
2. Click on the "Register" tab
3. Fill in:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
4. Click "Create Account"

#### Login
1. Use the "Login" tab
2. Enter your credentials
3. Click "Sign In"

### 4. Test Task Management

#### For Managers/Admins (Create Tasks)
1. After login, click "New Task"
2. Fill in task details:
   - Title: "Complete project documentation"
   - Description: "Write comprehensive docs"
   - Due Date: Select a future date
   - Priority: "HIGH"
   - Assigned To: Enter a user ID (you can use your own user ID)
3. Click "Create Task"

#### For All Users (View and Update Tasks)
1. View tasks in the main dashboard
2. See task statistics at the top
3. Update task status using the dropdown
4. Delete tasks (if you have permission)

### 5. Role-Based Features

#### USER Role
- Can only see assigned tasks
- Can update status of assigned tasks
- Cannot create new tasks
- Cannot delete tasks (unless created by them)

#### MANAGER/ADMIN Role
- Can see all tasks
- Can create new tasks
- Can assign tasks to users
- Can delete any task
- Full CRUD access

### 6. UI Features to Test

- **Responsive Design**: Test on different screen sizes
- **Dark/Light Mode**: Toggle using system preferences
- **Real-time Updates**: Task statistics update when you change task status
- **Form Validation**: Try submitting empty forms
- **Error Handling**: Test with invalid data
- **Loading States**: Notice loading spinners during API calls

### 7. API Integration Points

The frontend integrates with these backend endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `POST /auth/logout` - User logout
- `POST /auth/me` - Get current user
- `GET /tasks` - Get all tasks (role-filtered)
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Troubleshooting

1. **CORS Issues**: Make sure backend allows `http://localhost:3001`
2. **Session Issues**: Check that cookies are being set properly
3. **Port Conflicts**: Backend on 3000, frontend on 3001
4. **TypeScript Errors**: Run `npm run lint` to check for issues

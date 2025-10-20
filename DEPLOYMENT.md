# Deployment Guide

## Environment Variables Setup

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend (.env)
```bash
MONGODB_URI=mongodb://your-mongodb-connection-string
SESSION_SECRET=your-super-secret-session-key-change-in-production
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com
PORT=4000
NODE_ENV=production
```

## Common Deployment Issues & Solutions

### 1. Session Not Storing / Unauthorized API Calls

**Problem**: After deployment, sessions are not being stored and every API call returns unauthorized.

**Root Causes**:
- Frontend using localhost API URL in production
- Incorrect cookie domain configuration
- CORS not properly configured for cross-origin requests
- Session cookies not being sent with requests

**Solutions Applied**:

1. **Fixed API Base URL**: Updated `lib/api.ts` to use `NEXT_PUBLIC_API_URL` environment variable
2. **Fixed Cookie Configuration**: Removed domain restriction in production to allow cross-origin cookies
3. **Enhanced CORS**: Added proper headers and methods for session cookie handling
4. **Updated Next.js Config**: Disabled API rewrites in production

### 2. Cross-Origin Cookie Issues

**Problem**: Cookies not being set or sent across different domains.

**Solution**:
- Set `sameSite: "none"` and `secure: true` in production
- Remove domain restriction from cookies
- Ensure CORS `credentials: true` is set
- Use `credentials: 'include'` in fetch requests

### 3. Environment Variables

Make sure to set these environment variables in your deployment platform:

**Frontend (Vercel/Netlify)**:
- `NEXT_PUBLIC_API_URL`: Your backend API URL

**Backend (Railway/Render/Heroku)**:
- `MONGODB_URI`: Your MongoDB connection string
- `SESSION_SECRET`: A secure random string
- `CORS_ORIGIN`: Your frontend domain(s)
- `NODE_ENV`: Set to "production"

## Testing Deployment

1. **Check API Connection**: Verify frontend can reach backend API
2. **Test Authentication**: Login and check if session persists
3. **Verify CORS**: Check browser network tab for CORS errors
4. **Monitor Cookies**: Ensure session cookies are being set and sent

## Troubleshooting

### Check Browser Network Tab
- Look for CORS errors
- Verify cookies are being set with `Set-Cookie` headers
- Check if cookies are being sent with subsequent requests

### Backend Logs
- Monitor session creation/destruction
- Check CORS origin matching
- Verify MongoDB connection

### Common Error Messages
- "No active session found" → Session not being stored or retrieved
- "CORS error" → Frontend domain not in CORS_ORIGIN
- "Unauthorized" → Session cookie not being sent or invalid

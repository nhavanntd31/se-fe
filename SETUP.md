# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:9000/api
```

## Authentication Features

This application now includes:

1. **Login Page**: Available at `/login`
2. **Protected Routes**: All dashboard routes require authentication
3. **Token Management**: JWT tokens are stored in localStorage
4. **Auto-redirect**: Unauthorized users are redirected to login
5. **User Profile**: Available in the sidebar with logout and change password options
6. **Password Change**: Accessible through the user profile dropdown

## API Authentication

All API calls to the following endpoints now require Bearer authentication:

- `/data/statistic`
- `/data/semester`
- `/data/department` 
- `/data/major`
- `/data/class`
- `/data/student/{id}`
- `/data/upload-csv`

## Backend Requirements

Make sure your backend supports these authentication endpoints:

- `POST /auth/login` - Login with email/password
- `GET /auth/user-info` - Get current user info (requires Bearer token)
- `PUT /auth/change-password` - Change password (requires Bearer token)

## Usage

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You'll be redirected to `/login` if not authenticated
4. After login, you'll have access to all dashboard features
5. Use the user profile in the sidebar to change password or logout 
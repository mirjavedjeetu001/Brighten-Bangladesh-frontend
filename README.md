# Brighten Bangladesh - Frontend

React + TypeScript frontend application for the Brighten Bangladesh platform.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 JWT Authentication
- 📝 Blog browsing and management
- 📚 Magazine library
- 👤 User profile with membership status
- 🎫 Membership eligibility checking
- 🛡️ Admin panel for content management
- 📱 Responsive design
- ⚡ Fast development with Vite

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand (auth) + React Query (server state)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
cd bb-frontend
npm install
```

## Configuration

1. Copy the environment example:
```bash
cp .env.example .env
```

2. Update `.env` with your backend API URL:
```env
VITE_API_URL=http://localhost:3000/api
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
bb-frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance with interceptors
│   │   ├── types.ts      # TypeScript types
│   │   ├── auth.ts       # Auth API calls
│   │   ├── users.ts      # Users API calls
│   │   ├── blogs.ts      # Blogs API calls
│   │   ├── magazines.ts  # Magazines API calls
│   │   ├── memberships.ts # Memberships API calls
│   │   └── uploads.ts    # File uploads API
│   ├── components/       # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Loader.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Page components
│   │   ├── home/
│   │   ├── about/
│   │   ├── auth/
│   │   ├── blogs/
│   │   ├── magazines/
│   │   ├── profile/
│   │   └── admin/
│   ├── stores/           # State management
│   │   └── authStore.ts  # Authentication state
│   ├── utils/            # Utility functions
│   │   └── helpers.ts
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/
├── index.html
└── package.json
```

## Available Routes

### Public Routes
- `/` - Home page
- `/about` - About page
- `/blogs` - Blog listing
- `/blogs/:slug` - Blog detail
- `/magazines` - Magazine library
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Requires Authentication)
- `/profile` - User profile with membership status

### Admin Routes (Requires Admin/Content Manager/Editor Role)
- `/admin/users` - User management
- `/admin/blogs` - Blog management (approve/publish)
- `/admin/magazines` - Magazine management
- `/admin/memberships` - Membership management

## Key Features

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token refresh on API calls
- Protected routes with role-based access

### User Profile
- View personal information
- Check membership eligibility
- Apply for membership
- View activity history
- Track eligibility requirements

### Admin Panel
- Manage users and roles
- Approve and publish blogs
- Manage magazines
- View membership applications

### Membership System
- Automatic eligibility checking
- Real-time status updates
- Clear eligibility criteria display
- Activity tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run test` - Run tests

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety
- Follow naming conventions (PascalCase for components)

### State Management
- Use Zustand for global state (auth)
- Use React Query for server state
- Keep component state local when possible

### Styling
- Use Tailwind CSS utility classes
- Follow the design system in `index.css`
- Keep custom CSS minimal

### API Calls
- Use React Query for data fetching
- Handle loading and error states
- Use the API client from `src/api/client.ts`

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Header.tsx`

### Adding a New API Endpoint
1. Add TypeScript types in `src/api/types.ts`
2. Create API functions in appropriate `src/api/*.ts` file
3. Use with React Query in components

### Protecting a Route
```tsx
<Route
  path="/protected"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

## Deployment

### Build
```bash
npm run build
```

### Deploy to Static Hosting
The `dist` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables for Production
Set `VITE_API_URL` to your production API URL.

## Troubleshooting

### API Connection Issues
- Check that backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`

### Authentication Issues
- Clear localStorage and try logging in again
- Check token expiration settings in backend
- Verify JWT secret matches between frontend and backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and questions, please contact: support@brightenbangladesh.org

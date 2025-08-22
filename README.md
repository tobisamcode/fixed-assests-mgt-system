# Clean Next.js Starter

A clean, minimal Next.js starter template with TypeScript, shadcn/ui components, and API setup.

## Features

✅ **Preserved Components**

- Complete shadcn/ui component library
- Axios API connection setup with interceptors
- Authentication store with Zustand
- TypeScript configuration
- Tailwind CSS styling

🧹 **Clean Architecture**

- Minimal project structure
- Feature-based organization
- Type-safe API layer
- Modern React patterns

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   └── ui/              # shadcn/ui components
├── connection/
│   └── axios.ts         # API client setup
├── features/
│   ├── api/             # API services and types
│   └── auth/            # Authentication logic
├── lib/                 # Utilities and configuration
│   ├── config.ts        # Environment configuration
│   ├── types.ts         # Common types
│   ├── utils.ts         # Utility functions
│   └── providers.tsx    # React Query provider
```

## API Configuration

Configure your API endpoint in the environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000
```

## Authentication

The project includes a basic authentication setup with:

- Token-based authentication
- Zustand store for state management
- Automatic token injection in API requests
- Persistent authentication state

## UI Components

All shadcn/ui components are available:

- Button, Card, Input, Select, etc.
- Form components with validation
- Dialog and dropdown components
- Tables and data display components

## Development

- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Start:** `npm run start`

## Next Steps

1. Update the API services in `src/features/api/`
2. Add your routes in `src/app/`
3. Customize the UI components as needed
4. Configure authentication endpoints
5. Add your business logic

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui

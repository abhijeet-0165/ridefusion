# RideFusion - React Application

A modern React application for RideFusion, Rajpura's local transport service. This application has been converted from HTML pages to a fully functional React application with routing.

## Features

- 🏠 **Home Page** - Landing page with live ride statistics and available rides
- 🔐 **Authentication** - Login and Signup pages with form validation
- 🚗 **Book a Ride** - Find and book available rides with filtering options
- 🎯 **Offer a Ride** - Drivers can publish their rides
- 💰 **Wallet System** - Integrated wallet for payments
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **React 18** - UI library
- **React Router** - Routing
- **Vite** - Build tool and dev server
- **Supabase** - Backend database
- **Tailwind CSS** - Styling (via CDN)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ridefusion-react/
├── src/
│   ├── components/      # Reusable components (Navbar, Footer)
│   ├── pages/          # Page components (Home, Login, Signup, etc.)
│   ├── lib/            # Utilities (Supabase client)
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Pages

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/book-ride` - Book a ride page
- `/offer-ride` - Offer a ride page

## Supabase Configuration

The Supabase client is configured in `src/lib/supabase.js` and reads credentials from Vite environment variables.

Setup:

- **Create `.env`**: Copy `.env.example` to `.env` at the project root.
- **Add values**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your Supabase project values.
- **Run dev**: Start the dev server with `npm run dev` so Vite injects the variables.

Example `.env` (do not commit real keys):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

If you previously used a browser script named `supabase-config.js`, it has been removed to avoid committing secret keys. Use the Vite env approach instead.

## Notes

- Images (1.png, 2.png, etc.) should be placed in the `public/images` folder. Put your image files in `public/images` so the app can reference them as `/images/<name>.png`.
- The application uses localStorage for user sessions and wallet data
- All styling uses Tailwind CSS classes

## Deployment (Vercel)

This project is ready to deploy to Vercel as a static site (Vite build -> `dist`). Follow these steps:

- Sign in to Vercel and create a new project.
- Link your GitHub/GitLab/Bitbucket repository or import the project manually.
- Set the **Build Command** to: `npm run build`
- Set the **Output Directory** to: `dist`
- Add the following Environment Variables in the Vercel dashboard (Project Settings → Environment Variables):
	- `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://xxx.supabase.co`)
	- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
- (Optional) If you need preview or production-specific values, add them under the appropriate environment.

This repository includes a `vercel.json` configured to run the static build and route all requests to `index.html` (single-page app rewrite).

After adding environment variables, trigger a deploy from Vercel or push to your default branch. Vercel will run `npm run build` and publish the resulting `dist` directory.

## License

© 2024 RideFusion. Made in Rajpura.


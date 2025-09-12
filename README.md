# IPTV Manager Pro

This is a Next.js application scaffolded by Firebase Studio to manage IPTV clients, servers, and configurations.

## Core Features

- **Client Management**: Register, list, search, edit, and delete clients.
- **Server Management**: Register servers and monitor their status.
- **AI-Powered Server Configuration**: Validate server parameters using a GenAI-powered tool to ensure optimal settings for different content types.
- **Responsive UI**: A modern, responsive interface that works on desktops, tablets, and mobile devices.

## Getting Started

To get started, run the development server:

```bash
npm run dev
```

Then open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

The main pages are:
- **Dashboard**: `src/app/page.tsx`
- **Clients**: `src/app/clients/page.tsx`
- **Servers**: `src/app/servers/page.tsx`
- **Settings**: `src/app/settings/page.tsx`

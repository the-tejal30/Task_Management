# TaskFlow

A task management application built with Next.js, TypeScript, Redux Toolkit, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Testing | Jest + React Testing Library |

## Getting Started

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Login Credentials

```
Username: test
Password: test123
```

## Scripts

```bash
npm run dev          # start development server
npm run build        # create production build
npm run start        # start production server
npm test             # run all tests
npm run test:coverage  # run tests with coverage report
```

## Project Structure

```
src/
  app/               Next.js App Router (layouts, routes, providers)
    pages/           View components (Login, Dashboard)
  components/        Feature components (TaskCard, TaskForm, Navbar, EmptyState)
  commoncomponent/   Shared UI components (Button, Input, Modal, Dropdown, Badge)
  store/             Redux slices and async thunks (auth, tasks)
  hooks/             Custom React hooks (useAuth, useTasks)
  services/          Axios client, endpoint constants
  mocks/             Mock API adapter for local development
  types/             TypeScript types and enums
  utils/             localStorage utility (storage)
  icons/             Centralized SVG icon components
  tests/             Jest test suites
```

## Features

JWT authentication with localStorage persistence

Protected routes with automatic redirect to login

Task CRUD via a mock REST API (create, read, update, delete)

Filter tasks by status and search by title or description

Dark mode toggle with persistence across sessions

Responsive layout for mobile and desktop

Loading skeleton states and empty state views

188 unit and integration tests

# Interactive Workflow Canvas (MERN)

A multi-user visual workflow architecture builder where users can create node-based flows, connect blocks, and save/load architectures from MongoDB.

## What This App Is

This is a **visual workflow editor** (similar to a lightweight node-based Miro/Figma flow tool), built with:

- Backend: Node.js + Express + MongoDB + Mongoose
- Frontend: React + Vite + React Flow
- State: Zustand (local interactive state)
- Server Data: TanStack Query (fetch/mutate/cache)
- Auth: JWT (register/login, per-user architecture ownership)

## Core Features

- Register/Login with JWT
- Per-user architecture library (users only see their own saved flows)
- Infinite canvas-style node editing with drag/connect
- Rich node content:
  - editable title
  - editable description
  - node type selector (Task, Decision, API, Database, Note)
  - image URL + small uploaded image preview
  - per-node "Delete Block" action
- Autosave + unsaved state indicators
- Save As New architecture
- Rename/Delete saved architecture
- Share/Unshare architecture links
- Export architecture JSON
- Import architecture JSON
- Node templates for quick creation

## Project Structure

```text
workflow-canvas-app/
  backend/
    controllers/
    middleware/
    models/
    routes/
    .env
    server.js
  frontend/
    src/
      features/CanvasEditor/
      services/
      types/
    package.json
```

## Local Setup

## 1) Backend Setup

Go to backend:

```powershell
cd "c:\Users\dipayan.mandal\Tools\practice\workflow-canvas-app\backend"
```

Install dependencies:

```powershell
npm.cmd install
```

Create/update `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
```

Run backend:

```powershell
npm.cmd run start
```

Health check:

- `http://localhost:5000/health`

## 2) Frontend Setup

Go to frontend:

```powershell
cd "c:\Users\dipayan.mandal\Tools\practice\workflow-canvas-app\frontend"
```

Install dependencies:

```powershell
npm.cmd install
```

Run frontend:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Open:

- `http://127.0.0.1:5173`

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Canvas (JWT protected except shared read)

- `GET /api/canvas/library`
- `GET /api/canvas`
- `GET /api/canvas/:id`
- `POST /api/canvas`
- `PATCH /api/canvas/:id/rename`
- `DELETE /api/canvas/:id`
- `POST /api/canvas/:id/share`
- `GET /api/canvas/:id/export`
- `POST /api/canvas/import`

### Public Shared Read

- `GET /api/canvas/share/:token`

## Tech Notes: Zustand vs TanStack Query

- **Zustand**: handles fast, local UI state that changes frequently on the canvas (node dragging, node content editing, edge updates, unsaved flags).
- **TanStack Query**: handles server communication and caching (load library, load selected architecture, save/rename/delete/share/import/export with mutation states and cache invalidation).

In short:

- Zustand = "how the editor feels instantly"
- TanStack Query = "how data syncs reliably with backend"

## Suggested Next Enhancements

- Undo/redo history stack
- Multi-select + bulk operations
- Real-time collaboration (WebSocket)
- RBAC roles (viewer/editor)
- Public shared frontend viewer route

# CollabStudy - Collaborative Learning Platform

## Overview
CollabStudy is a real-time collaborative learning platform that enables students to study together online. The platform features interactive whiteboards, Pomodoro timers, task management, music synchronization, and notes sharing.

## Project Structure
```
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   ├── WhiteboardCanvas.tsx    # Interactive whiteboard with Socket.io
│   │   ├── PomodoroTimer.tsx       # Customizable focus timer
│   │   ├── TaskManager.tsx         # Task planner with priorities
│   │   ├── MusicPlayer.tsx         # YouTube music player
│   │   └── NotesSection.tsx        # Note taking and management
│   ├── context/      # React contexts
│   │   └── SocketContext.tsx       # Socket.io connection provider
│   ├── App.tsx       # Main application component
│   └── index.tsx     # Application entry point
├── server.js         # Express + Socket.io backend server
└── package.json      # Dependencies and scripts
```

## Features

### 1. Interactive Whiteboard
- Real-time collaborative drawing
- Multiple tools: brush, eraser, pan, circle
- Color picker and brush size controls
- Undo/redo functionality
- Save whiteboard as image
- Multi-user cursor tracking

### 2. Pomodoro Timer
- Customizable work and break durations
- Visual progress indicator
- Audio notifications (optional)
- Session tracking

### 3. Task Manager
- Add, edit, and delete tasks
- Priority levels (high, medium, low)
- Task completion tracking
- Due date management

### 4. Music Player
- YouTube integration using IFrame API
- **YouTube Search**: Search for music by name using YouTube Data API v3
- **URL/ID Support**: Add videos via full YouTube URL or video ID
- Playlist management
- Add custom YouTube videos (manual or search)
- Synchronized playback controls

### 5. Notes Section
- Create and organize study notes
- Color-coded notes
- Rich text content
- Quick edit and delete

### 6. Study Rooms
- Create and join study rooms
- Real-time collaboration
- Video chat integration ready

## Technology Stack

### Frontend
- React 19 with TypeScript
- Material-UI (MUI) v7
- Socket.io Client
- React Router v6
- Daily.co React SDK (WebRTC)
- Zustand (state management)

### Backend
- Node.js + Express
- Socket.io Server
- Daily.co API integration
- CORS enabled
- Real-time WebSocket communication

## Environment Variables
- `BACKEND_PORT`: Backend server port (default: 3001)
- `FRONTEND_PORT`: Frontend dev server port (default: 5000)
- `REACT_APP_YOUTUBE_API_KEY`: YouTube Data API v3 key for search functionality (optional)
- `DAILY_API_KEY`: Daily.co API key for production video rooms (optional for development)

## Development
The app runs both frontend and backend concurrently:
- Backend: Socket.io server on port 3001
- Frontend: React dev server on port 5000
- WebSocket proxy configured via setupProxy.js

## Deployment
Configured for Replit autoscale deployment:
- Builds React app to static files
- Serves static files from Express server
- WebSocket support for real-time features

## Recent Changes (November 22, 2025)

### Telegram-Like Active Study Rooms (Latest)
- **Video Calling**: Integrated Daily.co WebRTC for multi-user video chat
  - Real-time video and audio communication
  - Screen sharing support
  - Mic and camera toggle controls
  - Professional video grid layout
- **Real-Time Chat**: Telegram-style messaging system
  - Instant message delivery via Socket.IO
  - Typing indicators
  - Message timestamps
  - Persistent message history
- **Participants Sidebar**: Live participant tracking
  - Real-time presence updates
  - Audio/video/screen share status indicators
  - Color-coded avatars
  - Active participant count
- **Room Controls**: Professional meeting controls
  - Mute/unmute microphone
  - Start/stop video
  - Screen sharing
  - Leave room button
- **Routing**: React Router integration for study room pages
  - Direct room links (/room/:roomId)
  - Clean URL structure
  - Seamless navigation

### Previous Updates
- **YouTube Search Feature**: MusicPlayer now includes YouTube search functionality to find music by name
  - Search for songs directly from the app
  - View thumbnails and channel information
  - Add search results to playlist with one click
  - Configure via YouTube Data API v3 key
- **YouTube Integration Enhanced**: MusicPlayer accepts full YouTube URLs (youtube.com/watch?v=, youtu.be/, youtube.com/embed/) in addition to video IDs
- **Vercel Deployment Config**: Added vercel.json with proper routing for API and WebSocket endpoints (Note: WebSocket support may need alternative hosting)
- **Study Room Backend**: Added REST API endpoints (/api/rooms) and Socket.IO events for study room management
- **WebSocket Configuration**: Updated proxy and socket client for better connectivity
- Fixed MUI v7 API compatibility
- Added YouTube music player with URL parsing
- Implemented task management
- Created notes system
- Built Pomodoro timer with custom settings

## Known Issues
- **WebSocket Connection**: The Socket.IO proxy may require additional configuration in the Replit environment. Socket connections work when tested directly but may show connection errors in browser due to proxy configuration. For production, consider using a hosting platform that supports persistent WebSocket connections (Railway, Render, or dedicated server).
- **Browser Caching**: Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R) to see latest changes.

## User Preferences
- Clean, modern UI with Material Design
- Real-time collaboration features
- Easy-to-use navigation
- Mobile-responsive design

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes for Study Rooms - MUST be before the catch-all route
app.get('/api/rooms', (req, res) => {
  const rooms = Object.keys(studyRooms).map(roomId => ({
    id: roomId,
    ...studyRooms[roomId],
    participantCount: studyRooms[roomId].participants.length
  }));
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { name, subject } = req.body;
  const roomId = `room_${Date.now()}`;
  
  studyRooms[roomId] = {
    name: name || 'Untitled Room',
    subject: subject || 'General',
    participants: [],
    createdAt: new Date().toISOString()
  };
  
  res.json({ id: roomId, ...studyRooms[roomId] });
});

// Get Daily.co room token for video chat
app.get('/api/rooms/:roomId/video-token', async (req, res) => {
  const { roomId } = req.params;
  
  // Video calling requires Daily.co API key
  if (!process.env.DAILY_API_KEY) {
    console.warn('DAILY_API_KEY not set - video calling unavailable');
    console.warn('To enable video calling:');
    console.warn('1. Sign up for a free account at https://www.daily.co/');
    console.warn('2. Get your API key from Developers > API Keys');
    console.warn('3. Set DAILY_API_KEY environment variable');
    return res.status(503).json({ 
      error: 'Video calling unavailable',
      message: 'DAILY_API_KEY environment variable not set. Chat and participant features are still available.',
      setupUrl: 'https://www.daily.co/'
    });
  }
  
  try {
    // Generate a unique room name
    const roomName = `collabstudy-${roomId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // First, try to get the room to see if it exists
    const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
      }
    });
    
    let room;
    if (getResponse.ok) {
      // Room exists, use it
      room = await getResponse.json();
      console.log(`Using existing Daily.co room: ${room.url}`);
    } else {
      // Create new room
      const createResponse = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'public',
          properties: {
            enable_screenshare: true,
            enable_chat: false,
            enable_knocking: false,
            start_video_off: false,
            start_audio_off: false
          }
        })
      });
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error('Failed to create Daily.co room:', error);
        throw new Error(`Failed to create room: ${JSON.stringify(error)}`);
      }
      
      room = await createResponse.json();
      console.log(`Created new Daily.co room: ${room.url}`);
    }
    
    res.json({ dailyRoomUrl: room.url });
  } catch (error) {
    console.error('Error with Daily.co API:', error);
    res.status(500).json({ 
      error: 'Failed to create video room',
      message: error.message 
    });
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res, next) => {
    // Skip socket.io and API requests
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // Development route
  app.get('/', (req, res) => {
    res.send('Interactive Whiteboard Server is running');
  });
}

// Store whiteboard data for each room
const whiteboardData = {};

// Store study room data
const studyRooms = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a study room
  socket.on('joinStudyRoom', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} (${userName}) joined study room: ${roomId}`);
    
    // Initialize study room if not exists
    if (!studyRooms[roomId]) {
      studyRooms[roomId] = {
        name: 'Study Room',
        subject: 'General',
        participants: [],
        createdAt: new Date().toISOString()
      };
    }
    
    // Add participant
    const participant = {
      id: socket.id,
      name: userName || `User ${studyRooms[roomId].participants.length + 1}`
    };
    studyRooms[roomId].participants.push(participant);
    
    // Notify others
    io.to(roomId).emit('participantJoined', participant);
    socket.emit('roomJoined', { roomId, participants: studyRooms[roomId].participants });
  });

  // New room events for video chat rooms
  socket.on('room:join', ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
    
    // Initialize room if not exists
    if (!studyRooms[roomId]) {
      studyRooms[roomId] = {
        name: 'Study Room',
        subject: 'General',
        participants: [],
        messages: [],
        createdAt: new Date().toISOString()
      };
    }
    
    // Add participant
    const participant = {
      id: socket.id,
      username,
      audio: true,
      video: true,
      screen: false,
      isLocal: false
    };
    studyRooms[roomId].participants.push(participant);
    
    // Send existing messages to the new user (message history)
    if (studyRooms[roomId].messages && studyRooms[roomId].messages.length > 0) {
      studyRooms[roomId].messages.forEach(msg => {
        socket.emit('chat:message', msg);
      });
    }
    
    // Send current participants list to all users
    const participantsList = studyRooms[roomId].participants;
    io.to(roomId).emit('room:presence', participantsList);
    
    // Notify others about new user
    socket.to(roomId).emit('room:user-joined', { userId: socket.id, username });
  });

  socket.on('room:leave', ({ roomId }) => {
    const room = studyRooms[roomId];
    if (room) {
      const participantIndex = room.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        const participant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);
        
        // Notify others
        socket.to(roomId).emit('room:user-left', { userId: socket.id, username: participant.username });
        io.to(roomId).emit('room:presence', room.participants);
      }
    }
    socket.leave(roomId);
  });

  // Chat events
  socket.on('chat:message', ({ roomId, message }) => {
    console.log(`Message in room ${roomId}:`, message);
    
    // Store message in room
    if (studyRooms[roomId]) {
      if (!studyRooms[roomId].messages) {
        studyRooms[roomId].messages = [];
      }
      studyRooms[roomId].messages.push(message);
    }
    
    // Broadcast to all users in the room
    io.to(roomId).emit('chat:message', message);
  });

  socket.on('chat:typing', ({ roomId, username, isTyping }) => {
    // Broadcast typing status to others
    socket.to(roomId).emit('chat:typing', { userId: socket.id, username, isTyping });
  });

  // Media state events (mic, camera, screen share)
  socket.on('media:state', ({ roomId, audio, video, screen }) => {
    const room = studyRooms[roomId];
    if (room) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        participant.audio = audio;
        participant.video = video;
        participant.screen = screen;
        
        // Broadcast media state to all users in the room (including sender for confirmation)
        io.to(roomId).emit('media:state', { userId: socket.id, audio, video, screen });
        
        // Update presence list to sync changes
        io.to(roomId).emit('room:presence', room.participants);
      }
    }
  });
  
  // Join a whiteboard room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Initialize room data if not exists
    if (!whiteboardData[roomId]) {
      whiteboardData[roomId] = {
        lines: [],
        users: {}
      };
    }
    
    // Add user to room's users
    whiteboardData[roomId].users[socket.id] = {
      id: socket.id,
      color: getRandomColor(),
      name: `User ${Object.keys(whiteboardData[roomId].users).length + 1}`,
      position: { x: 0, y: 0 }
    };
    
    // Send current whiteboard data to the new user
    socket.emit('currentWhiteboard', whiteboardData[roomId]);
    
    // Broadcast user joined to others in the room
    io.to(roomId).emit('userJoined', whiteboardData[roomId].users[socket.id]);
  });
  
  // Drawing event
  socket.on('draw', (data) => {
    const { roomId, line } = data;
    
    // Save line to whiteboard data
    if (whiteboardData[roomId]) {
      whiteboardData[roomId].lines.push(line);
      
      // Broadcast draw event to everyone in the room except the sender
      socket.to(roomId).emit('draw', line);
    }
  });
  
  // Clear whiteboard event
  socket.on('clearWhiteboard', (roomId) => {
    if (whiteboardData[roomId]) {
      whiteboardData[roomId].lines = [];
      
      // Broadcast clear event to everyone in the room
      io.to(roomId).emit('whiteboardCleared');
    }
  });
  
  // User cursor position update
  socket.on('cursorPosition', (data) => {
    const { roomId, position } = data;
    
    if (whiteboardData[roomId] && whiteboardData[roomId].users[socket.id]) {
      whiteboardData[roomId].users[socket.id].position = position;
      
      // Broadcast cursor position to everyone in the room except the sender
      socket.to(roomId).emit('userCursorPosition', {
        userId: socket.id,
        position
      });
    }
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all whiteboard rooms
    for (const roomId in whiteboardData) {
      if (whiteboardData[roomId].users[socket.id]) {
        delete whiteboardData[roomId].users[socket.id];
        io.to(roomId).emit('userLeft', socket.id);
        
        if (Object.keys(whiteboardData[roomId].users).length === 0) {
          delete whiteboardData[roomId];
        }
      }
    }
    
    // Remove user from all study rooms
    for (const roomId in studyRooms) {
      const index = studyRooms[roomId].participants.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const participant = studyRooms[roomId].participants[index];
        studyRooms[roomId].participants.splice(index, 1);
        io.to(roomId).emit('participantLeft', participant.id);
        
        if (studyRooms[roomId].participants.length === 0) {
          delete studyRooms[roomId];
        }
      }
    }
  });
});

// Generate random color for users
function getRandomColor() {
  const colors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Start server
const PORT = process.env.BACKEND_PORT || 3001;
const HOST = process.env.BACKEND_HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Interactive Whiteboard Server running on ${HOST}:${PORT}`);
}); 
import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DailyProvider } from '@daily-co/daily-react';
import { useRoom } from '../context/RoomContext';
import { VideoGrid } from './VideoGrid';
import { ChatPanel } from './ChatPanel';
import { ParticipantsSidebar } from './ParticipantsSidebar';
import { RoomControls } from './RoomControls';

export const StudyRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { joinRoom, dailyCall } = useRoom();
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId) return;

    setLoading(true);
    setError('');

    try {
      // Fetch Daily.co room URL from backend
      let dailyRoomUrl;
      try {
        const response = await fetch(`/api/rooms/${roomId}/video-token`);
        if (response.ok) {
          const data = await response.json();
          dailyRoomUrl = data.dailyRoomUrl;
        } else if (response.status === 503) {
          // Video calling unavailable (no API key)
          const data = await response.json();
          console.warn('Video calling unavailable:', data.message);
          setVideoUnavailable(true);
        }
      } catch (videoError) {
        console.warn('Error fetching video room:', videoError);
        setVideoUnavailable(true);
      }

      // Join the room (with or without video)
      await joinRoom(roomId, username, dailyRoomUrl);
      setShowJoinDialog(false);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showJoinDialog) {
    return (
      <Dialog open={showJoinDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Join Study Room</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Room: {roomId}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              error={!!error}
              helperText={error}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button onClick={handleJoinRoom} variant="contained" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <DailyProvider callObject={dailyCall}>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        <Paper
          square
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Study Room: {roomId}</Typography>
        </Paper>

        {/* Main Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
          {videoUnavailable && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                ℹ️ Video calling is unavailable. To enable video calling, set up a Daily.co API key (see .env.example). 
                Chat and participant features are fully functional.
              </Typography>
            </Paper>
          )}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              height: videoUnavailable ? 'calc(100% - 70px)' : '100%'
            }}
          >
            {/* Video Grid - Takes 2/3 on desktop, full width on mobile */}
            {!videoUnavailable && (
              <Box sx={{ flex: { xs: 'none', md: 2 }, height: { xs: '40%', md: '100%' } }}>
                <Paper sx={{ height: '100%', overflow: 'hidden' }}>
                  <VideoGrid />
                </Paper>
              </Box>
            )}

            {/* Right Sidebar - Chat and Participants */}
            <Box sx={{ flex: { xs: 'none', md: videoUnavailable ? 1 : 1 }, height: { xs: videoUnavailable ? '100%' : '60%', md: '100%' }, width: { xs: '100%', md: videoUnavailable ? '100%' : 'auto' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                {/* Participants */}
                <Box sx={{ height: '40%', minHeight: 200 }}>
                  <ParticipantsSidebar />
                </Box>

                {/* Chat */}
                <Box sx={{ flex: 1, minHeight: 300 }}>
                  <ChatPanel />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom Controls */}
        <Box sx={{ p: 2 }}>
          <RoomControls />
        </Box>
      </Box>
    </DailyProvider>
  );
};

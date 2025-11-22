import React from 'react';
import { IconButton, Tooltip, Paper } from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  CallEnd,
} from '@mui/icons-material';
import { useRoom } from '../context/RoomContext';
import { useNavigate } from 'react-router-dom';

export const RoomControls: React.FC = () => {
  const {
    localAudio,
    localVideo,
    localScreen,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveRoom,
  } = useRoom();
  const navigate = useNavigate();

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Tooltip title={localAudio ? 'Mute' : 'Unmute'}>
        <IconButton
          onClick={toggleAudio}
          sx={{
            bgcolor: localAudio ? 'grey.800' : 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: localAudio ? 'grey.700' : 'error.dark',
            },
          }}
        >
          {localAudio ? <Mic /> : <MicOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={localVideo ? 'Stop Video' : 'Start Video'}>
        <IconButton
          onClick={toggleVideo}
          sx={{
            bgcolor: localVideo ? 'grey.800' : 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: localVideo ? 'grey.700' : 'error.dark',
            },
          }}
        >
          {localVideo ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={localScreen ? 'Stop Sharing' : 'Share Screen'}>
        <IconButton
          onClick={toggleScreenShare}
          sx={{
            bgcolor: localScreen ? 'primary.main' : 'grey.800',
            color: 'white',
            '&:hover': {
              bgcolor: localScreen ? 'primary.dark' : 'grey.700',
            },
          }}
        >
          {localScreen ? <StopScreenShare /> : <ScreenShare />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Leave Room">
        <IconButton
          onClick={handleLeaveRoom}
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'error.dark',
            },
          }}
        >
          <CallEnd />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

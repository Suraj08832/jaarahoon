import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import { useRoom } from '../context/RoomContext';
import { DailyVideo, useParticipantIds, useVideoTrack, useAudioTrack } from '@daily-co/daily-react';

interface VideoTileProps {
  participantId: string;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ participantId, isLocal = false }) => {
  const videoState = useVideoTrack(participantId);
  const audioState = useAudioTrack(participantId);

  return (
    <Paper
      sx={{
        position: 'relative',
        aspectRatio: '16/9',
        bgcolor: '#1a1a1a',
        overflow: 'hidden',
        borderRadius: 2,
        minHeight: 200,
      }}
    >
      {videoState.isOff ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#2a2a2a',
          }}
        >
          <Typography variant="h4" color="text.secondary">
            {participantId.substring(0, 2).toUpperCase()}
          </Typography>
        </Box>
      ) : (
        <DailyVideo
          automirror
          sessionId={participantId}
          type="video"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(0,0,0,0.6)',
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
      >
        <Typography variant="caption" color="white" sx={{ fontWeight: 500 }}>
          {isLocal ? 'You' : participantId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {audioState.isOff ? (
            <MicOff sx={{ fontSize: 16, color: 'error.main' }} />
          ) : (
            <Mic sx={{ fontSize: 16, color: 'success.main' }} />
          )}
          {videoState.isOff ? (
            <VideocamOff sx={{ fontSize: 16, color: 'error.main' }} />
          ) : (
            <Videocam sx={{ fontSize: 16, color: 'success.main' }} />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export const VideoGrid: React.FC = () => {
  const { dailyCall } = useRoom();
  const participantIds = useParticipantIds();

  if (!dailyCall) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1a1a1a',
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">
          Video calling is not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: participantIds.length > 1 ? 'repeat(2, 1fr)' : '1fr',
          md: participantIds.length > 4 ? 'repeat(3, 1fr)' : participantIds.length > 1 ? 'repeat(2, 1fr)' : '1fr',
        },
        gap: 2,
        p: 2,
        overflow: 'auto',
      }}
    >
      {participantIds.map((id) => (
        <VideoTile key={id} participantId={id} isLocal={id === 'local'} />
      ))}
    </Box>
  );
};

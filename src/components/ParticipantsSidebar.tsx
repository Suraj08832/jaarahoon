import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, ScreenShare } from '@mui/icons-material';
import { useRoom } from '../context/RoomContext';

export const ParticipantsSidebar: React.FC = () => {
  const { participants, username } = useRoom();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Participants ({participants.length})
        </Typography>
      </Box>

      {/* Participants List */}
      <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {participants.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
            <Typography color="text.secondary">
              No participants yet
            </Typography>
          </Box>
        ) : (
          participants.map((participant) => (
            <ListItem
              key={participant.id}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(participant.username),
                    fontWeight: 600,
                  }}
                >
                  {getInitials(participant.username)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {participant.username}
                      {participant.username === username && ' (You)'}
                    </Typography>
                    {participant.isLocal && (
                      <Chip label="You" size="small" color="primary" sx={{ height: 20 }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {participant.audio ? (
                      <Mic sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <MicOff sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    {participant.video ? (
                      <Videocam sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <VideocamOff sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    {participant.screen && (
                      <ScreenShare sx={{ fontSize: 16, color: 'info.main' }} />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useRoom } from '../context/RoomContext';

export const ChatPanel: React.FC = () => {
  const { messages, typingUsers, sendMessage, setTyping, username } = useRoom();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Typing indicator logic
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage('');
    setTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
        <Typography variant="h6">Chat</Typography>
      </Box>

      {/* Messages List */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.username === username ? 'primary.main' : 'grey.800',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                {msg.username !== username && (
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {msg.username}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {msg.message}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                  {formatTime(msg.timestamp)}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Typography>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

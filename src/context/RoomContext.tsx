import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import { useSocket } from './SocketContext';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface Participant {
  id: string;
  username: string;
  audio: boolean;
  video: boolean;
  screen: boolean;
  isLocal: boolean;
}

interface RoomContextType {
  roomId: string | null;
  username: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  typingUsers: string[];
  dailyCall: DailyCall | null;
  localAudio: boolean;
  localVideo: boolean;
  localScreen: boolean;
  joinRoom: (roomId: string, username: string, dailyRoomUrl?: string) => Promise<void>;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
  setTyping: (isTyping: boolean) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [dailyCall, setDailyCall] = useState<DailyCall | null>(null);
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);
  const [localScreen, setLocalScreen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Chat message received
    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // User typing indicator
    socket.on('chat:typing', ({ userId, username: typingUsername, isTyping }: { userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(typingUsername) ? prev : [...prev, typingUsername];
        } else {
          return prev.filter(u => u !== typingUsername);
        }
      });
    });

    // Room presence updates
    socket.on('room:presence', (participantsList: Participant[]) => {
      setParticipants(participantsList);
    });

    // User joined
    socket.on('room:user-joined', ({ userId, username: joinedUsername }: { userId: string; username: string }) => {
      console.log(`${joinedUsername} joined the room`);
    });

    // User left
    socket.on('room:user-left', ({ userId, username: leftUsername }: { userId: string; username: string }) => {
      console.log(`${leftUsername} left the room`);
    });

    // Media state updates
    socket.on('media:state', ({ userId, audio, video, screen }: { userId: string; audio: boolean; video: boolean; screen: boolean }) => {
      setParticipants(prev => 
        prev.map(p => p.id === userId ? { ...p, audio, video, screen } : p)
      );
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('room:presence');
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.off('media:state');
    };
  }, [socket]);

  const joinRoom = async (newRoomId: string, newUsername: string, dailyRoomUrl?: string) => {
    if (!socket) return;

    setRoomId(newRoomId);
    setUsername(newUsername);

    // Join room via Socket.IO
    socket.emit('room:join', { roomId: newRoomId, username: newUsername });

    // Join Daily.co call if URL provided
    if (dailyRoomUrl) {
      try {
        const call = DailyIframe.createCallObject();
        
        // Set up Daily event listeners BEFORE joining
        call.on('joined-meeting', (event: any) => {
          console.log('Joined Daily.co meeting');
          const localParticipant = event.participants.local as DailyParticipant;
          if (localParticipant) {
            setLocalAudio(localParticipant.audio || false);
            setLocalVideo(localParticipant.video || false);
            setLocalScreen(localParticipant.screen || false);
            
            // Sync initial state with socket
            if (socket) {
              socket.emit('media:state', { 
                roomId: newRoomId, 
                audio: localParticipant.audio || false,
                video: localParticipant.video || false,
                screen: localParticipant.screen || false
              });
            }
          }
        });

        call.on('participant-joined', (event: any) => {
          console.log('Participant joined:', event.participant);
        });

        call.on('participant-left', (event: any) => {
          console.log('Participant left:', event.participant);
        });

        call.on('participant-updated', (event: any) => {
          const p = event.participant as DailyParticipant;
          if (p.local) {
            setLocalAudio(p.audio || false);
            setLocalVideo(p.video || false);
            setLocalScreen(p.screen || false);
            
            // Sync media state with socket
            if (socket) {
              socket.emit('media:state', { 
                roomId: newRoomId, 
                audio: p.audio || false,
                video: p.video || false,
                screen: p.screen || false
              });
            }
          }
        });

        call.on('error', (event: any) => {
          console.error('Daily.co error:', event);
        });

        // Set Daily call before joining
        setDailyCall(call);

        // Join the call with username
        await call.join({ 
          url: dailyRoomUrl,
          userName: newUsername
        });
      } catch (error) {
        console.error('Failed to join Daily.co call:', error);
        // Continue with socket-only mode if Daily fails
      }
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('room:leave', { roomId });
    }

    if (dailyCall) {
      dailyCall.leave();
      dailyCall.destroy();
      setDailyCall(null);
    }

    setRoomId(null);
    setUsername(null);
    setParticipants([]);
    setMessages([]);
    setTypingUsers([]);
  };

  const sendMessage = (message: string) => {
    if (!socket || !roomId || !username) return;

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: socket.id || '',
      username,
      message,
      timestamp: Date.now(),
    };

    socket.emit('chat:message', { roomId, message: chatMessage });
  };

  const setTyping = (isTyping: boolean) => {
    if (!socket || !roomId || !username) return;
    socket.emit('chat:typing', { roomId, username, isTyping });
  };

  const toggleAudio = () => {
    if (!dailyCall) return;
    dailyCall.setLocalAudio(!localAudio);
    
    if (socket && roomId) {
      socket.emit('media:state', { roomId, audio: !localAudio, video: localVideo, screen: localScreen });
    }
  };

  const toggleVideo = () => {
    if (!dailyCall) return;
    dailyCall.setLocalVideo(!localVideo);
    
    if (socket && roomId) {
      socket.emit('media:state', { roomId, audio: localAudio, video: !localVideo, screen: localScreen });
    }
  };

  const toggleScreenShare = async () => {
    if (!dailyCall) return;
    
    try {
      if (localScreen) {
        await dailyCall.stopScreenShare();
      } else {
        await dailyCall.startScreenShare();
      }
      
      if (socket && roomId) {
        socket.emit('media:state', { roomId, audio: localAudio, video: localVideo, screen: !localScreen });
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  return (
    <RoomContext.Provider
      value={{
        roomId,
        username,
        participants,
        messages,
        typingUsers,
        dailyCall,
        localAudio,
        localVideo,
        localScreen,
        joinRoom,
        leaveRoom,
        sendMessage,
        setTyping,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

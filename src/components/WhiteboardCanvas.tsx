import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography, Tooltip, Zoom } from '@mui/material';
import { Brush, Clear, Edit, CircleOutlined, PanTool, ZoomIn, ZoomOut, Save, Undo, Redo, FormatColorFill } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';

// Define types for the whiteboard data
interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
  color: string;
  brushSize: number;
  userId: string;
}

interface User {
  id: string;
  color: string;
  name: string;
  position: Point;
}

interface WhiteboardData {
  lines: Line[];
  users: Record<string, User>;
}

// Define props for WhiteboardCanvas
interface WhiteboardCanvasProps {
  roomId: string;
}

// Define tool types
type ToolType = 'brush' | 'eraser' | 'pan' | 'circle';

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ roomId }) => {
  const { socket, connected } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardData>({ lines: [], users: {} });
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [tool, setTool] = useState<ToolType>('brush');
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [startPan, setStartPan] = useState<Point | null>(null);
  const [history, setHistory] = useState<Line[][]>([]);
  const [redoStack, setRedoStack] = useState<Line[][]>([]);

  // Redraw all lines on the canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    whiteboardData.lines.forEach(line => {
      drawLine(line);
    });
  }, [whiteboardData.lines]);

  // Set up canvas and handle window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    
    const resizeCanvas = () => {
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas]);

  // Handle socket connection and events
  useEffect(() => {
    if (!socket || !connected || !roomId) return;

    console.log("Joining whiteboard room:", roomId);
    
    // Join room when component mounts
    socket.emit('joinRoom', roomId);
    
    // Listen for current whiteboard data
    socket.on('currentWhiteboard', (data: WhiteboardData) => {
      console.log("Received current whiteboard data:", data);
      setWhiteboardData(data);
      // Initialize history with current state
      setHistory([[...data.lines]]);
    });
    
    // Listen for new lines from other users
    socket.on('draw', (line: Line) => {
      console.log("Received new line from another user");
      setWhiteboardData(prev => {
        const newLines = [...prev.lines, line];
        // Update history
        setHistory(current => [...current, newLines]);
        return {
          ...prev,
          lines: newLines
        };
      });
    });
    
    // Listen for whiteboard clear
    socket.on('whiteboardCleared', () => {
      console.log("Whiteboard cleared by another user");
      setWhiteboardData(prev => {
        setHistory(current => [...current, []]);
        return {
          ...prev,
          lines: []
        };
      });
    });
    
    // Listen for user cursor position updates
    socket.on('userCursorPosition', ({ userId, position }: { userId: string, position: Point }) => {
      setWhiteboardData(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [userId]: {
            ...prev.users[userId],
            position
          }
        }
      }));
    });
    
    // Listen for user joined
    socket.on('userJoined', (user: User) => {
      console.log("User joined:", user);
      setWhiteboardData(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [user.id]: user
        }
      }));
    });
    
    // Listen for user left
    socket.on('userLeft', (userId: string) => {
      console.log("User left:", userId);
      setWhiteboardData(prev => {
        const newUsers = { ...prev.users };
        delete newUsers[userId];
        return {
          ...prev,
          users: newUsers
        };
      });
    });
    
    // Clean up socket listeners on unmount
    return () => {
      socket.off('currentWhiteboard');
      socket.off('draw');
      socket.off('whiteboardCleared');
      socket.off('userCursorPosition');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [socket, connected, roomId]);

  // Function to draw a line on the canvas
  const drawLine = (line: Line) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { points, color, brushSize } = line;
    if (points.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  };

  // Clear the whiteboard
  const clearCanvas = () => {
    if (!socket || !connected) return;
    
    socket.emit('clearWhiteboard', roomId);
    setWhiteboardData(prev => {
      // Add to history
      setHistory(current => [...current, []]);
      setRedoStack([]);
      return {
        ...prev,
        lines: []
      };
    });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length <= 1) return;
    
    const currentState = history[history.length - 1];
    const previousState = history[history.length - 2];
    
    // Update redo stack
    setRedoStack(prev => [...prev, currentState]);
    
    // Update history
    setHistory(prev => prev.slice(0, -1));
    
    // Update canvas
    setWhiteboardData(prev => ({
      ...prev,
      lines: previousState
    }));
    
    // Redraw
    setTimeout(redrawCanvas, 0);
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    
    // Update history
    setHistory(prev => [...prev, nextState]);
    
    // Update redo stack
    setRedoStack(prev => prev.slice(0, -1));
    
    // Update canvas
    setWhiteboardData(prev => ({
      ...prev,
      lines: nextState
    }));
    
    // Redraw
    setTimeout(redrawCanvas, 0);
  };

  // Save whiteboard as image
  const saveAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a link element
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!socket || !connected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pan') {
      setStartPan({ x, y });
      return;
    }
    
    setIsDrawing(true);
    setCurrentLine([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!socket || !connected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor position and send to server
    socket.emit('cursorPosition', {
      roomId,
      position: { x, y }
    });
    
    if (tool === 'pan' && startPan) {
      const dx = x - startPan.x;
      const dy = y - startPan.y;
      setCanvasOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setStartPan({ x, y });
      return;
    }
    
    if (!isDrawing) return;
    
    setCurrentLine(prev => [...prev, { x, y }]);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentLine.length > 0) {
      const lastPoint = currentLine[currentLine.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (!socket || !connected) return;
    
    if (tool === 'pan') {
      setStartPan(null);
      return;
    }
    
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentLine.length < 2) return;
    
    const newLine: Line = {
      points: currentLine,
      color: selectedColor,
      brushSize,
      userId: socket.id || 'unknown'
    };
    
    socket.emit('draw', {
      roomId,
      line: newLine
    });
    
    setWhiteboardData(prev => {
      const newLines = [...prev.lines, newLine];
      // Add to history
      setHistory(current => [...current, newLines]);
      setRedoStack([]);
      return {
        ...prev,
        lines: newLines
      };
    });
    
    setCurrentLine([]);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  // Tool selection handlers
  const selectTool = (selectedTool: ToolType) => {
    setTool(selectedTool);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1.5, 
          mb: 1.5, 
          display: 'flex', 
          justifyContent: 'space-between',
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f0f0f0, #ffffff)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Brush" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={() => selectTool('brush')} 
              color={tool === 'brush' ? 'primary' : 'default'}
              sx={{ 
                boxShadow: tool === 'brush' ? '0px 2px 5px rgba(0, 0, 0, 0.2)' : 'none',
                transform: tool === 'brush' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <Brush />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eraser" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={() => selectTool('eraser')} 
              color={tool === 'eraser' ? 'primary' : 'default'}
              sx={{ 
                boxShadow: tool === 'eraser' ? '0px 2px 5px rgba(0, 0, 0, 0.2)' : 'none',
                transform: tool === 'eraser' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pan" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={() => selectTool('pan')} 
              color={tool === 'pan' ? 'primary' : 'default'}
              sx={{ 
                boxShadow: tool === 'pan' ? '0px 2px 5px rgba(0, 0, 0, 0.2)' : 'none',
                transform: tool === 'pan' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <PanTool />
            </IconButton>
          </Tooltip>
          <Tooltip title="Circle" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={() => selectTool('circle')} 
              color={tool === 'circle' ? 'primary' : 'default'}
              sx={{ 
                boxShadow: tool === 'circle' ? '0px 2px 5px rgba(0, 0, 0, 0.2)' : 'none',
                transform: tool === 'circle' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <CircleOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={handleZoomIn}
              sx={{ transition: 'all 0.2s ease' }}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={handleZoomOut}
              sx={{ transition: 'all 0.2s ease' }}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Undo" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={handleUndo} 
              disabled={history.length <= 1}
              sx={{ transition: 'all 0.2s ease' }}
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
              sx={{ transition: 'all 0.2s ease' }}
            >
              <Redo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Canvas" arrow TransitionComponent={Zoom}>
            <Button 
              variant="outlined" 
              onClick={clearCanvas}
              startIcon={<Clear />}
              sx={{ 
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              Clear
            </Button>
          </Tooltip>
          <Tooltip title="Save Image" arrow TransitionComponent={Zoom}>
            <IconButton 
              onClick={saveAsImage}
              color="primary"
              sx={{ transition: 'all 0.2s ease' }}
            >
              <Save />
            </IconButton>
          </Tooltip>
          <Tooltip title="Color Picker" arrow TransitionComponent={Zoom}>
            <Box sx={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: 40, 
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${selectedColor}`,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}>
              <input 
                type="color" 
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ 
                  width: '150%', 
                  height: '150%',
                  position: 'absolute',
                  cursor: 'pointer',
                  opacity: 0
                }}
              />
              <FormatColorFill sx={{ color: selectedColor }} />
            </Box>
          </Tooltip>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'rgba(0,0,0,0.05)', 
            borderRadius: 2,
            px: 2,
            py: 0.5
          }}>
            <Typography variant="caption" sx={{ mr: 1 }}>Size</Typography>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={{ width: 100 }}
            />
            <Typography variant="caption" sx={{ ml: 1, minWidth: 20, textAlign: 'center' }}>
              {brushSize}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: connected ? 'success.light' : 'error.light',
            color: 'white',
            borderRadius: '20px',
            px: 2,
            py: 0.5,
            minWidth: 100,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Box>
        </Stack>
      </Paper>
      
      <Box 
        ref={containerRef}
        sx={{ 
          flexGrow: 1, 
          position: 'relative',
          border: '1px solid #ccc', 
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#fcfcfc',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.4,
            pointerEvents: 'none'
          }
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: tool === 'pan' ? 'grab' : tool === 'eraser' ? 'cell' : 'crosshair',
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'cursor 0.2s ease'
          }}
        />
        
        {/* Render other users' cursors */}
        {connected && Object.values(whiteboardData.users).map(user => {
          if (user.id === socket?.id) return null;
          return (
            <Box
              key={user.id}
              sx={{
                position: 'absolute',
                left: user.position.x,
                top: user.position.y,
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: user.color,
                boxShadow: `0 0 5px ${user.color}, 0 0 10px rgba(0,0,0,0.2)`,
                animation: 'pulse 1.5s infinite'
              }} />
              <Typography variant="caption" sx={{ 
                position: 'absolute',
                top: '100%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                px: 0.5,
                py: 0.2,
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontWeight: 'bold',
                color: user.color,
                whiteSpace: 'nowrap'
              }}>
                {user.name}
              </Typography>
            </Box>
          );
        })}

        {/* Connection status indicator for disconnected state */}
        {!connected && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(244, 67, 54, 0.9)',
              color: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              zIndex: 10,
              animation: 'pulse 2s infinite',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6">Disconnected</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              The whiteboard server is currently unavailable. Please try again later.
            </Typography>
          </Box>
        )}
        
        {/* User counter */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          bgcolor: 'rgba(255,255,255,0.9)',
          px: 1, 
          py: 0.5, 
          borderRadius: 4,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          zIndex: 5
        }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: connected ? 'success.main' : 'error.main',
            transition: 'background-color 0.3s ease'
          }} />
          <Typography variant="caption" fontWeight="bold">
            {Object.keys(whiteboardData.users).length} user{Object.keys(whiteboardData.users).length !== 1 ? 's' : ''} online
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WhiteboardCanvas; 
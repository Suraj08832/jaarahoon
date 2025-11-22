import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isWorkSession, setIsWorkSession] = useState(true);

  const switchSession = React.useCallback(() => {
    setIsWorkSession(prev => {
      const newIsWorkSession = !prev;
      setMinutes(newIsWorkSession ? workDuration : breakDuration);
      setSeconds(0);
      return newIsWorkSession;
    });
  }, [workDuration, breakDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
            switchSession();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, onComplete, switchSession]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isWorkSession ? workDuration : breakDuration);
    setSeconds(0);
  };

  const handleSaveSettings = () => {
    setWorkDuration(workDuration);
    setBreakDuration(breakDuration);
    resetTimer();
    setShowSettings(false);
  };

  const totalSeconds = (isWorkSession ? workDuration : breakDuration) * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        {isWorkSession ? 'Work Session' : 'Break Time'} - Pomodoro Timer
      </Typography>
      <Box display="flex" justifyContent="center" mb={3} position="relative">
        <CircularProgress 
          variant="determinate" 
          value={progress} 
          size={180} 
          thickness={5}
          sx={{ color: isWorkSession ? 'primary.main' : 'success.main' }}
        />
        <Box
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h3" component="div" color="textSecondary" className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Typography>
        </Box>
      </Box>
      <div className="timer-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={toggleTimer}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={resetTimer}
        >
          Reset
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </div>

      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>Timer Settings</DialogTitle>
        <DialogContent>
          <TextField
            label="Work Duration (minutes)"
            type="number"
            value={workDuration}
            onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value) || 25))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Break Duration (minutes)"
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PomodoroTimer;

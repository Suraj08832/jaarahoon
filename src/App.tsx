import React, { useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Container, AppBar, Toolbar, Typography, Card, CardContent, CardActions, Modal, TextField, Tabs, Tab, Paper, IconButton } from '@mui/material';
import { Close, VideoCall, Message, Dashboard, Timeline, NoteAlt, MusicNote, Timer, CheckCircle, Add } from '@mui/icons-material';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import PomodoroTimer from './components/PomodoroTimer';
import TaskManager from './components/TaskManager';
import MusicPlayer from './components/MusicPlayer';
import NotesSection from './components/NotesSection';
import { StudyRoomPage } from './components/StudyRoomPage';

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  const handleLogin = () => {
    // Simulate login functionality
    if (username && password) {
      setIsLoggedIn(true);
      setShowLogin(false);
      setShowDashboard(true);
    }
  };

  const handleSignup = () => {
    // Simulate signup functionality
    if (username && password && email) {
      setIsLoggedIn(true);
      setShowSignup(false);
      setShowDashboard(true);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="App">
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <Typography variant="h6" className="app-logo" style={{ flexGrow: 1 }}>
            CollabStudy
          </Typography>
          {!isLoggedIn ? (
            <>
              <Button className="app-button" color="inherit" onClick={() => setShowLogin(true)}>Login</Button>
              <Button className="app-button" color="inherit" onClick={() => setShowSignup(true)}>Sign Up</Button>
            </>
          ) : (
            <Button className="app-button" color="inherit" onClick={() => setShowDashboard(true)}>Dashboard</Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      {!showDashboard && (
        <Box className="hero-section">
          <Container>
            <Typography variant="h2" className="bounce-in">Study Together, Achieve More</Typography>
            <Typography variant="h5" style={{ margin: '20px 0' }} className="fade-in">
              Join our collaborative learning platform and excel in your studies
            </Typography>
            {!isLoggedIn ? (
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => setShowSignup(true)}
                sx={{ 
                  borderRadius: '30px', 
                  padding: '10px 30px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                Get Started
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => setShowDashboard(true)}
                sx={{ 
                  borderRadius: '30px', 
                  padding: '10px 30px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </Container>
        </Box>
      )}

      {/* Features Section */}
      {!showDashboard && (
        <Container style={{ padding: '50px 0' }}>
          <Typography variant="h3" align="center" gutterBottom>
            Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Card className="feature-card">
              <CardContent>
                <VideoCall fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Live Study Rooms
                </Typography>
                <Typography variant="body2">
                  Video & Audio Chat with classmates in real-time
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <Dashboard fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Interactive Whiteboard
                </Typography>
                <Typography variant="body2">
                  Collaborate on ideas with shared whiteboards
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <MusicNote fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Music Sync
                </Typography>
                <Typography variant="body2">
                  Listen to the same music with group controls
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <Timer fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Pomodoro Timer
                </Typography>
                <Typography variant="body2">
                  Stay focused with customizable focus sessions
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <CheckCircle fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Task Planner
                </Typography>
                <Typography variant="body2">
                  Organize your tasks and assignments
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <Timeline fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Progress Tracker
                </Typography>
                <Typography variant="body2">
                  Monitor your study progress and achievements
                </Typography>
              </CardContent>
            </Card>
            <Card className="feature-card">
              <CardContent>
                <NoteAlt fontSize="large" color="primary" />
                <Typography variant="h5" component="div">
                  Note Section
                </Typography>
                <Typography variant="body2">
                  Take and share notes during your study sessions
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      )}

      {/* Login Modal */}
      <Modal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        aria-labelledby="login-modal"
      >
        <Box className="modal">
          <IconButton 
            onClick={() => setShowLogin(false)}
            style={{ position: 'absolute', right: 10, top: 10 }}
          >
            <Close />
          </IconButton>
          <Typography variant="h5" component="h2" gutterBottom>
            Login
          </Typography>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleLogin}
            style={{ marginTop: 20 }}
          >
            Login
          </Button>
          <Typography style={{ marginTop: 20, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Button 
              color="primary" 
              onClick={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            >
              Sign Up
            </Button>
          </Typography>
        </Box>
      </Modal>

      {/* Signup Modal */}
      <Modal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        aria-labelledby="signup-modal"
      >
        <Box className="modal">
          <IconButton 
            onClick={() => setShowSignup(false)}
            style={{ position: 'absolute', right: 10, top: 10 }}
          >
            <Close />
          </IconButton>
          <Typography variant="h5" component="h2" gutterBottom>
            Sign Up
          </Typography>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSignup}
            style={{ marginTop: 20 }}
          >
            Sign Up
          </Button>
          <Typography style={{ marginTop: 20, textAlign: 'center' }}>
            Already have an account?{' '}
            <Button 
              color="primary" 
              onClick={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            >
              Login
            </Button>
          </Typography>
        </Box>
      </Modal>

      {/* Dashboard */}
      {showDashboard && (
        <Box className="dashboard">
          <Container>
            <Paper 
              style={{ 
                marginTop: 20,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                centered
                variant="fullWidth"
              >
                <Tab label="Study Rooms" />
                <Tab label="Whiteboard" />
                <Tab label="Music" />
                <Tab label="Pomodoro" />
                <Tab label="Tasks" />
                <Tab label="Progress" />
                <Tab label="Notes" />
              </Tabs>
              
              {/* Study Rooms Tab */}
              {currentTab === 0 && (
                <Box p={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">Active Study Rooms</Typography>
                    <Button 
                      startIcon={<Add />} 
                      variant="contained" 
                      color="primary"
                      sx={{ borderRadius: '30px' }}
                    >
                      Create Room
                    </Button>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Card className="room-card">
                      <CardContent>
                        <Typography variant="h6">Math Study Group</Typography>
                        <Typography variant="body2" color="textSecondary">
                          5 participants • Calculus
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="space-between">
                          <VideoCall color="primary" />
                          <Message color="primary" />
                          <Dashboard color="primary" />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          fullWidth 
                          variant="contained"
                          onClick={() => navigate('/room/math-study-group')}
                        >
                          Join Room
                        </Button>
                      </CardActions>
                    </Card>
                    <Card className="room-card">
                      <CardContent>
                        <Typography variant="h6">Physics Discussion</Typography>
                        <Typography variant="body2" color="textSecondary">
                          3 participants • Mechanics
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="space-between">
                          <VideoCall color="primary" />
                          <Message color="primary" />
                          <Dashboard color="primary" />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          fullWidth 
                          variant="contained"
                          onClick={() => navigate('/room/physics-discussion')}
                        >
                          Join Room
                        </Button>
                      </CardActions>
                    </Card>
                    <Card className="room-card">
                      <CardContent>
                        <Typography variant="h6">Computer Science Lab</Typography>
                        <Typography variant="body2" color="textSecondary">
                          7 participants • Programming
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="space-between">
                          <VideoCall color="primary" />
                          <Message color="primary" />
                          <Dashboard color="primary" />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          fullWidth 
                          variant="contained"
                          onClick={() => navigate('/room/computer-science-lab')}
                        >
                          Join Room
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                </Box>
              )}
              
              {/* Whiteboard Tab */}
              {currentTab === 1 && (
                <Box p={3}>
                  <Typography variant="h5" gutterBottom>Interactive Whiteboard</Typography>
                  <Paper 
                    elevation={3} 
                    className="whiteboard-container"
                    style={{ 
                      height: "70vh", 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <WhiteboardCanvas roomId="main-room" />
                  </Paper>
                </Box>
              )}
              
              {/* Music Tab */}
              {currentTab === 2 && (
                <MusicPlayer />
              )}
              
              {/* Pomodoro Tab */}
              {currentTab === 3 && (
                <PomodoroTimer />
              )}
              
              {/* Tasks Tab */}
              {currentTab === 4 && (
                <TaskManager />
              )}
              
              {/* Progress Tab */}
              {currentTab === 5 && (
                <Box p={3}>
                  <Typography variant="h5" gutterBottom>Progress Tracker</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Card className="progress-card">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Weekly Study Hours</Typography>
                        <Typography className="progress-value">
                          12.5
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Hours this week
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="center">
                          <Typography variant="body2" color="primary">
                            +2.5 hours from last week
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    <Card className="progress-card">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Completed Tasks</Typography>
                        <Typography className="progress-value">
                          8/12
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tasks completed
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="center">
                          <Typography variant="body2" color="primary">
                            67% completion rate
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    <Card className="progress-card">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Focus Sessions</Typography>
                        <Typography className="progress-value">
                          9
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pomodoro sessions
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="center">
                          <Typography variant="body2" color="primary">
                            4.5 hours of focused study
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Notes Tab */}
              {currentTab === 6 && (
                <NotesSection />
              )}
            </Paper>
          </Container>
        </Box>
      )}

      {/* Footer */}
      <Box className="footer" bgcolor="primary.main" color="white" p={3} mt={5}>
        <Container>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="h6">CollabStudy</Typography>
              <Typography variant="body2">
                A collaborative platform for students to study together and excel.
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2">
                © 2025 CollabStudy. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element={<StudyRoomPage />} />
    </Routes>
  );
}

export default App;

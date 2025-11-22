import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, List, ListItem, ListItemText, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, CircularProgress, Alert, IconButton, InputAdornment } from '@mui/material';
import { MusicNote, PlayArrow, Pause, SkipNext, Add, Search as SearchIcon, Settings } from '@mui/icons-material';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
}

interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

const MusicPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([
    { id: '1', title: 'Lo-Fi Beats', artist: 'Study Music', youtubeId: 'jfKfPfyJRdk' },
    { id: '2', title: 'Classical Focus', artist: 'Mozart', youtubeId: 'Rb0UmrCXxVA' },
    { id: '3', title: 'Nature Sounds', artist: 'Ambient', youtubeId: 'eKFTSSKCzWA' }
  ]);

  const [currentSong, setCurrentSong] = useState<Song | null>(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', youtubeId: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const extractYouTubeId = (input: string): string => {
    if (!input) return '';
    
    const cleanInput = input.trim();
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = cleanInput.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return cleanInput;
  };

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!apiKey) {
      setSearchError('YouTube API key not configured. Click the settings icon to add your API key.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults: 10,
          key: apiKey,
          videoCategoryId: '10'
        }
      });

      const results: SearchResult[] = response.data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url
      }));

      setSearchResults(results);
    } catch (error: any) {
      console.error('YouTube search error:', error);
      setSearchError(error.response?.data?.error?.message || 'Failed to search YouTube. Please check your API key.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromSearch = (result: SearchResult) => {
    // Check if song already exists in playlist
    const exists = songs.some(song => song.youtubeId === result.videoId);
    if (exists) {
      return; // Song already in playlist, don't add again
    }

    const song: Song = {
      id: Date.now().toString(),
      title: result.title,
      artist: result.channelTitle,
      youtubeId: result.videoId
    };
    setSongs([...songs, song]);
    
    // Remove from search results after adding
    setSearchResults(searchResults.filter(r => r.videoId !== result.videoId));
  };

  const handleAddSong = () => {
    if (!newSong.title) return;
    
    const extractedId = extractYouTubeId(newSong.youtubeId);
    if (!extractedId) return;

    // Check if song already exists in playlist
    const exists = songs.some(song => song.youtubeId === extractedId);
    if (exists) {
      alert('This song is already in your playlist!');
      return;
    }

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title,
      artist: newSong.artist || 'Unknown Artist',
      youtubeId: extractedId
    };
    setSongs([...songs, song]);
    setNewSong({ title: '', artist: '', youtubeId: '' });
    setShowAddDialog(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Music Sync</Typography>
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Now Playing</Typography>
          <Box mt={2} mb={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            {currentSong && isPlaying ? (
              <Box sx={{ width: '100%', maxWidth: 560, aspectRatio: '16/9' }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1`}
                  title={currentSong.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            ) : (
              <MusicNote fontSize="large" color="primary" sx={{ fontSize: '4rem' }} />
            )}
            {currentSong && (
              <Typography variant="h6" mt={2}>
                {currentSong.title} - {currentSong.artist}
              </Typography>
            )}
          </Box>
          <div className="music-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {!isPlaying ? (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PlayArrow />}
                onClick={() => currentSong && handlePlay(currentSong)}
              >
                Play
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Pause />}
                onClick={handlePause}
              >
                Pause
              </Button>
            )}
            <Button 
              variant="outlined" 
              startIcon={<SkipNext />}
              onClick={handleNext}
            >
              Next
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Song
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Playlist</Typography>
          <List>
            {songs.map((song, index) => (
              <React.Fragment key={song.id}>
                <ListItem 
                  onClick={() => handlePlay(song)}
                  sx={{
                    bgcolor: currentSong?.id === song.id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemText 
                    primary={song.title}
                    secondary={`${song.artist}${currentSong?.id === song.id && isPlaying ? ' - Now Playing' : ''}`}
                  />
                </ListItem>
                {index < songs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Add YouTube Song
            <IconButton size="small" onClick={() => setShowApiKeyDialog(true)} title="Configure API Key">
              <Settings />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab label="Search YouTube" />
            <Tab label="Manual Add" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <TextField
                label="Search for music"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
                fullWidth
                margin="normal"
                placeholder="e.g., lofi hip hop beats"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={searchYouTube} disabled={isSearching}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {searchError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {searchError}
                </Alert>
              )}

              {isSearching && (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              )}

              {!isSearching && searchResults.length > 0 && (
                <List sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
                  {searchResults.map((result, index) => (
                    <React.Fragment key={result.videoId}>
                      <ListItem>
                        <Box display="flex" alignItems="center" width="100%" gap={2}>
                          <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <Box flex={1}>
                            <ListItemText 
                              primary={result.title}
                              secondary={result.channelTitle}
                            />
                          </Box>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddFromSearch(result);
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      </ListItem>
                      {index < searchResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <TextField
                label="Song Title"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Artist"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="YouTube URL or Video ID"
                value={newSong.youtubeId}
                onChange={(e) => setNewSong({ ...newSong, youtubeId: e.target.value })}
                fullWidth
                margin="normal"
                helperText="Enter full YouTube URL (https://youtube.com/watch?v=...) or just the video ID (dQw4w9WgXcQ)"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddDialog(false);
            setSearchQuery('');
            setSearchResults([]);
            setSearchError(null);
          }}>Cancel</Button>
          {activeTab === 1 && (
            <Button onClick={handleAddSong} variant="contained" color="primary">
              Add
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>YouTube API Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            To enable YouTube search, you need a YouTube Data API v3 key.
            <br /><br />
            1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
            <br />
            2. Create a project and enable YouTube Data API v3
            <br />
            3. Create credentials (API Key)
            <br />
            4. Add the API key as environment variable: <strong>REACT_APP_YOUTUBE_API_KEY</strong>
            <br /><br />
            After adding the API key, restart the application.
          </Alert>
          <TextField
            label="Current API Key Status"
            value={process.env.REACT_APP_YOUTUBE_API_KEY ? 'Configured ✓' : 'Not configured'}
            fullWidth
            disabled
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApiKeyDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MusicPlayer;

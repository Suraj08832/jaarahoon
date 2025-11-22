import React, { useState, useRef } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stack } from '@mui/material';
import { Add, Edit, Delete, NoteAlt, AttachFile, PictureAsPdf, Image as ImageIcon, InsertDriveFile, Close } from '@mui/icons-material';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  color: string;
  attachments?: FileAttachment[];
}

const colors = ['#FFE4E1', '#E0F2F7', '#FFF9C4', '#F3E5F5', '#E8F5E9', '#FFF3E0'];

const NotesSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Study Notes',
      content: 'Important concepts to remember for the exam...',
      createdAt: new Date().toLocaleDateString(),
      color: colors[0],
      attachments: []
    },
    {
      id: '2',
      title: 'Project Ideas',
      content: 'Brainstorming session notes...',
      createdAt: new Date().toLocaleDateString(),
      color: colors[1],
      attachments: []
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: colors[0],
    attachments: [] as FileAttachment[]
  });

  const handleAddNote = () => {
    setFormData({ 
      title: '', 
      content: '', 
      color: colors[Math.floor(Math.random() * colors.length)],
      attachments: []
    });
    setEditingNote(null);
    setShowDialog(true);
  };

  const handleEditNote = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      attachments: note.attachments || []
    });
    setEditingNote(note);
    setShowDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileAttachment: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target?.result as string
        };
        newAttachments.push(fileAttachment);

        if (newAttachments.length === files.length) {
          setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const downloadAttachment = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSaveNote = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingNote) {
      setNotes(notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, ...formData }
          : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleDateString()
      };
      setNotes([...notes, newNote]);
    }
    setShowDialog(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">My Notes</Typography>
        <Button 
          startIcon={<Add />} 
          variant="contained" 
          color="primary"
          sx={{ borderRadius: '30px' }}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {notes.map(note => (
          <Card key={note.id} 
              sx={{ 
                bgcolor: note.color,
                minHeight: 200,
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <NoteAlt color="primary" />
                  <Box>
                    <IconButton size="small" onClick={() => handleEditNote(note)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteNote(note.id)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {note.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {note.content}
                </Typography>
                {note.attachments && note.attachments.length > 0 && (
                  <Box mt={1}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {note.attachments.map(attachment => (
                        <Chip
                          key={attachment.id}
                          icon={getFileIcon(attachment.type)}
                          label={attachment.name}
                          size="small"
                          onClick={() => downloadAttachment(attachment)}
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary">
                  {note.createdAt}
                </Typography>
              </CardContent>
            </Card>
        ))}
      </Box>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        accept=".pdf,.doc,.docx,.txt,image/*"
        onChange={handleFileSelect}
      />

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={6}
          />
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption">Attachments</Typography>
              <Button
                size="small"
                startIcon={<AttachFile />}
                onClick={() => fileInputRef.current?.click()}
              >
                Add Files
              </Button>
            </Box>
            {formData.attachments.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.attachments.map(attachment => (
                  <Chip
                    key={attachment.id}
                    icon={getFileIcon(attachment.type)}
                    label={`${attachment.name} (${formatFileSize(attachment.size)})`}
                    size="small"
                    onDelete={() => removeAttachment(attachment.id)}
                    deleteIcon={<Close />}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <Box mt={2}>
            <Typography variant="caption">Color</Typography>
            <Box display="flex" gap={1} mt={1}>
              {colors.map(color => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #1976d2' : '2px solid #ccc',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" color="primary">
            {editingNote ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesSection;

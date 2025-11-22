import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Divider, Typography } from '@mui/material';
import { Add, CheckCircle, Edit, Delete } from '@mui/icons-material';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate: string;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Math Assignment',
      description: 'Finish calculus problems',
      priority: 'high',
      completed: false,
      dueDate: 'Due tomorrow'
    },
    {
      id: '2',
      title: 'Read Physics Chapter 7',
      description: 'Study mechanics',
      priority: 'medium',
      completed: false,
      dueDate: 'Due in 3 days'
    },
    {
      id: '3',
      title: 'Prepare for CS Presentation',
      description: 'Create slides',
      priority: 'low',
      completed: false,
      dueDate: 'Due next week'
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: ''
  });

  const handleAddTask = () => {
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
    setEditingTask(null);
    setShowDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setEditingTask(task);
    setShowDialog(true);
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...formData }
          : t
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        completed: false
      };
      setTasks([...tasks, newTask]);
    }
    setShowDialog(false);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Task Planner</Typography>
        <Button 
          startIcon={<Add />} 
          variant="contained" 
          color="primary"
          sx={{ borderRadius: '30px' }}
          onClick={handleAddTask}
        >
          Add Task
        </Button>
      </Box>
      <List>
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            <ListItem 
              className={`task-item ${task.priority}`}
              sx={{
                bgcolor: task.completed ? 'rgba(0,255,0,0.05)' : 'transparent',
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.6 : 1
              }}
            >
              <ListItemText 
                primary={task.title} 
                secondary={`${task.dueDate} • ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`} 
              />
              <IconButton onClick={() => toggleComplete(task.id)}>
                <CheckCircle color={task.completed ? 'success' : 'primary'} />
              </IconButton>
              <IconButton onClick={() => handleEditTask(task)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => deleteTask(task.id)} color="error">
                <Delete />
              </IconButton>
            </ListItem>
            {index < tasks.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManager;

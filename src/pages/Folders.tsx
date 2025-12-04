import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  ExpandMore,
  MoreVert,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { folderApi } from '../api/endpoints/folder';
import { subscriptionApi } from '../api/endpoints/subscription';
import type { Folder, RssChannel } from '../types';

export default function Folders() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const queryClient = useQueryClient();

  // Fetch folders
  const { data: folders, isLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data } = await folderApi.getAll();
      return data;
    },
  });

  // Fetch subscribed channels for adding to folder
  const { data: subscribedChannels } = useQuery({
    queryKey: ['subscribed-channels'],
    queryFn: async () => {
      const { data } = await subscriptionApi.getChannels();
      return data;
    },
    enabled: addChannelDialogOpen,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      await folderApi.create(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setCreateDialogOpen(false);
      setFolderName('');
    },
  });

  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async ({ folderId, name }: { folderId: number; name: string }) => {
      await folderApi.update(folderId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setEditDialogOpen(false);
      setFolderName('');
      setSelectedFolder(null);
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: number) => {
      await folderApi.delete(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setSelectedFolder(null);
    },
  });

  // Add channel to folder mutation
  const addChannelMutation = useMutation({
    mutationFn: async ({ folderId, channelId }: { folderId: number; channelId: number }) => {
      await folderApi.addChannel(folderId, channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setAddChannelDialogOpen(false);
    },
  });

  // Remove channel from folder mutation
  const removeChannelMutation = useMutation({
    mutationFn: async ({ folderId, channelId }: { folderId: number; channelId: number }) => {
      await folderApi.removeChannel(folderId, channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolderMutation.mutate(folderName);
    }
  };

  const handleUpdateFolder = () => {
    if (selectedFolder && folderName.trim()) {
      updateFolderMutation.mutate({
        folderId: selectedFolder.folder_id!,
        name: folderName,
      });
    }
  };

  const handleDeleteFolder = (folder: Folder) => {
    if (window.confirm(`Are you sure you want to delete "${folder.folder_name}"?`)) {
      deleteFolderMutation.mutate(folder.folder_id!);
    }
  };

  const handleEditClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setFolderName(folder.folder_name || '');
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleAddChannelClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setAddChannelDialogOpen(true);
    setAnchorEl(null);
  };

  const handleAddChannel = (channelId: number) => {
    if (selectedFolder) {
      addChannelMutation.mutate({
        folderId: selectedFolder.folder_id!,
        channelId,
      });
    }
  };

  const handleRemoveChannel = (folderId: number, channelId: number) => {
    removeChannelMutation.mutate({ folderId, channelId });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Folders</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Folder
        </Button>
      </Box>

      {isLoading ? (
        <Alert severity="info">Loading folders...</Alert>
      ) : folders && folders.length === 0 ? (
        <Alert severity="info">
          No folders yet. Create your first folder to organize your RSS channels!
        </Alert>
      ) : (
        <Box>
          {folders?.map((folder: Folder) => (
            <Accordion key={folder.folder_id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">{folder.folder_name}</Typography>
                  <Chip
                    label={folder.channels?.length || 0}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolder(folder);
                    setAnchorEl(e.currentTarget);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                {folder.channels && folder.channels.length > 0 ? (
                  <List>
                    {folder.channels.map((channel: RssChannel) => (
                      <ListItem key={channel.channel_id}>
                        <ListItemText
                          primary={channel.channel_title}
                          secondary={channel.channel_description}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() =>
                              handleRemoveChannel(folder.folder_id!, channel.channel_id!)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No channels in this folder. Click the menu to add channels.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Folder Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => selectedFolder && handleAddChannelClick(selectedFolder)}>
          <Add sx={{ mr: 1 }} /> Add Channel
        </MenuItem>
        <MenuItem onClick={() => selectedFolder && handleEditClick(selectedFolder)}>
          <Edit sx={{ mr: 1 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => selectedFolder && handleDeleteFolder(selectedFolder)}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={createFolderMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateFolder}
            variant="contained"
            disabled={updateFolderMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Channel to Folder Dialog */}
      <Dialog
        open={addChannelDialogOpen}
        onClose={() => setAddChannelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Channel to {selectedFolder?.folder_name}</DialogTitle>
        <DialogContent>
          <List>
            {subscribedChannels?.map((channel: RssChannel) => {
              const alreadyInFolder = selectedFolder?.channels?.some(
                (c) => c.channel_id === channel.channel_id
              );
              return (
                <ListItem
                  key={channel.channel_id}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => !alreadyInFolder && handleAddChannel(channel.channel_id!)}
                    disabled={alreadyInFolder}
                  >
                    <ListItemText
                      primary={channel.channel_title}
                      secondary={alreadyInFolder ? 'Already in folder' : channel.channel_description}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddChannelDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

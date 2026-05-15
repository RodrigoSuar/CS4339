import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

function PhotoUploadModal({ open, onClose, userId }) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: async (file) => {
        // Validate file
        if (!file) {
            throw new Error('Please select an image file');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
            method: 'POST',
            body: formData,
            }
        );

        if (!cloudinaryResponse.ok) {
            throw new Error('Failed to upload to Cloudinary');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const photoUrl = cloudinaryData.secure_url;

        // Send URL to backend
        const backendResponse = await api.post('/photos', {
            url: photoUrl,
        });

        return backendResponse.data;
        },
        onSuccess: () => {
        // Invalidate all photo queries so any open feed refreshes
        queryClient.invalidateQueries({ queryKey: ['photos'] });
        // Reset form
        setSelectedFile(null);
        setFileError('');
        onClose();
        },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileError('');
    }
  };

  const handleSubmit = () => {
    uploadMutation.mutate(selectedFile);
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      setSelectedFile(null);
      setFileError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Photo</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {uploadMutation.isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {uploadMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadMutation.error.message || 'Failed to upload photo'}
            </Alert>
          )}

          {fileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fileError}
            </Alert>
          )}

          <TextField
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={handleFileChange}
            fullWidth
            disabled={uploadMutation.isPending}
            slotProps={{
              input: {
                startAdornment: selectedFile ? `Selected: ${selectedFile.name}` : undefined,
              },
            }}
          />
          {selectedFile && (
            <TextField
              label="Selected File"
              value={selectedFile.name}
              fullWidth
              disabled
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploadMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedFile || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PhotoUploadModal;

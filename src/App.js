import React, { useState, useRef } from 'react';
import { Container, Typography, Button, LinearProgress, Paper, Snackbar } from '@material-ui/core';
import { CloudUpload, PlayArrow, Pause, Stop } from '@material-ui/icons';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [discussion, setDiscussion] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      await axios.post('http://localhost:5000/upload', formData);
      setUploading(false);
      setProcessing(true);
      const response = await axios.post('http://localhost:5000/process', { filename: file.name });
      setProcessing(false);
      setDiscussion(response.data.discussion);
      setAudioUrl(`http://localhost:5000/audio/${response.data.audioFilename}`);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during upload or processing.');
      setUploading(false);
      setProcessing(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        RAG Agent
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <input
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<CloudUpload />}
          >
            Select Document
          </Button>
        </label>
        {file && (
          <Typography variant="body1" style={{ marginTop: '10px' }}>
            Selected file: {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUpload}
          disabled={!file || uploading || processing}
          style={{ marginTop: '10px' }}
        >
          Upload and Process
        </Button>
        {(uploading || processing) && (
          <LinearProgress style={{ marginTop: '10px' }} />
        )}
      </Paper>
      {discussion && (
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Generated Discussion:
          </Typography>
          <Typography variant="body1">{discussion}</Typography>
        </Paper>
      )}
      {audioUrl && (
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Audio Playback:
          </Typography>
          <audio ref={audioRef} src={audioUrl} />
          <Button startIcon={<PlayArrow />} onClick={handlePlay} disabled={playing}>Play</Button>
          <Button startIcon={<Pause />} onClick={handlePause} disabled={!playing}>Pause</Button>
          <Button startIcon={<Stop />} onClick={handleStop}>Stop</Button>
        </Paper>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  );
}

export default App;

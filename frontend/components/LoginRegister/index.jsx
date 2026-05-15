import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

function LoginRegister({ onLogin }) {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ login_name: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    login_name: '', password: '', first_name: '', last_name: '',
    location: '', description: '', occupation: '',
  });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/login', data);
      return res.data;
    },
    onSuccess: (user) => {
      onLogin(user);
      navigate(`/users/${user._id}`);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/user', data);
      return res.data;
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <Paper style={{ flex: 1, padding: '1.5rem' }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Login Name"
            fullWidth
            margin="normal"
            value={loginForm.login_name}
            onChange={(e) => setLoginForm({ ...loginForm, login_name: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {loginMutation.isError && (
            <Typography color="error">{loginMutation.error.response?.data || 'Login failed'}</Typography>
          )}
          <Button type="submit" variant="contained" fullWidth style={{ marginTop: '1rem' }}>
            Login
          </Button>
        </form>
      </Paper>

      <Paper style={{ flex: 1, padding: '1.5rem' }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Login Name"
            fullWidth
            margin="normal"
            value={registerForm.login_name}
            onChange={(e) => setRegisterForm({ ...registerForm, login_name: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          />
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            value={registerForm.first_name}
            onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            value={registerForm.last_name}
            onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={registerForm.location}
            onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={registerForm.description}
            onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
          />
          <TextField
            label="Occupation"
            fullWidth
            margin="normal"
            value={registerForm.occupation}
            onChange={(e) => setRegisterForm({ ...registerForm, occupation: e.target.value })}
          />
          {registerMutation.isError && (
            <Typography color="error">{registerMutation.error.response?.data || 'Registration failed'}</Typography>
          )}
          {registerMutation.isSuccess && (
            <Typography color="primary">Account created! You can now log in.</Typography>
          )}
          <Button type="submit" variant="contained" fullWidth style={{ marginTop: '1rem' }}>
            Register
          </Button>
        </form>
      </Paper>
    </div>
  );
}

export default LoginRegister;

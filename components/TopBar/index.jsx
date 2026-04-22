
import React  from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import './styles.css';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';



  function TopBar({ currentUser, setCurrentUser }) {
    const location = useLocation();
    const {userId} = useParams();
    const match = location.pathname.match(/\/users\/([^/]+)/);
    const resolvedUserId = userId || (match && match[1]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const logoutMutation = useMutation({
      mutationFn: async () => { await api.post('/admin/logout'); },
      onSuccess: () => {
        queryClient.clear();
        setCurrentUser(null);
        navigate('/login-register');
      },
    });
    
    const {data: user} = useQuery({
      queryKey: ['userName', resolvedUserId],
      queryFn: async () => {
        const res = await api.get(`/user/${resolvedUserId}`);
        const first = res.data.first_name;
        const last = res.data.last_name;
        return `${first} ${last}`;
      },
      enabled: !!resolvedUserId
    });

    let content = "";

    
      
      if(location.pathname.includes('photos')){
        content = user ? `${user} photo's` : '';
      }else if(location.pathname.includes('users')){
        content = user ? `Details for ${user}` : '';
      }else {
        //console.log('i am in the home page');
      }
    
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className='toolbar'>
          <Typography variant="h5" color="inherit" style={{ marginRight: '1rem' }}>
            Rodrigo Suarez - Connor Treybig
          </Typography>
          <Typography variant="h5" color="inherit">
            {content}
          </Typography>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser && <Typography color="inherit">Hi {currentUser.first_name}</Typography>}
            <Button color="inherit" onClick={() => logoutMutation.mutate()}>Logout</Button>
          </div>
        </Toolbar>
      </AppBar>
    );
  }

export default TopBar;


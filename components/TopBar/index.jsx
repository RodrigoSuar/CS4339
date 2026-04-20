import React  from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './styles.css';
import { useLocation, useParams } from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import api from '../../lib/api';




  function TopBar() {
    const location = useLocation();
    const {userId} = useParams();
    
    const {data: user} = useQuery({
      queryKey: ['user',userId],
      queryFn: async () => {
        const res = await api.get(`/user/${userId}`);
        const first = res.data.first_name;
        const last = res.data.last_name;
        return `${first} ${last}`;
      },
      enabled: !!userId
    });

    let content = "";

    
      
      if(location.pathname.includes('photos')){
        content = (`${user} photo's`);
      }else if(location.pathname.includes('users')){
        
        content = (`Details for ${user}`);
      }else {
        //console.log('i am in the home page');
      }
    
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className='toolbar'>
          <Typography variant="h5" color="inherit">
            Rodrigo Suarez
          </Typography>
          <Typography variant="h5" color="inherit">
            {content}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

export default TopBar;

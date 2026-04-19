import React ,{useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './styles.css';
import { useLocation, useParams } from 'react-router-dom';
import api from '../../lib/api';

function TopBar() {
  const [content,setContent] = useState('');
  const [user,setUser] = useState('');
  const location = useLocation();
  const {userId} = useParams();
  //console.log(location)
  useEffect(() => {
    async function getUser() {
      
      try{
        //console.log(userId);
        const response = await api.get(`/user/${userId}`);
        const first = response.data.first_name;
        const last = response.data.last_name;
        setUser(`${first} ${last}`);
        
      } catch (error){
        console.error(error);
      }
    }
    
    if(location.pathname.includes('photos')){
      getUser();
       setContent(`${user} photo's`);
    }else if(location.pathname.includes('users')){
      getUser();
      setContent(`Details for ${user}`);
    }else {
      //console.log('i am in the home page');
    }
  });
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

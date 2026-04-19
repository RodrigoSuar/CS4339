import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Typography } from '@mui/material';

import './styles.css';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

function UserDetail() {
  const {userId} = useParams();
  const [user,setUser] = useState(
    {
      _id: '',
      first_name: '',
      last_name: '',
      location: '',
      description: "",
      occupation: ''
    }
  );
  
  useEffect(() => {
    async function getUser() {
      try{
        const response = await api.get(`/user/${userId}`);
        setUser(response.data);
        //console.log(response.data)
      } catch (error){
        console.error(error);
      }
    }
    getUser();
  },[userId]);

  return (
    <div className="user-detail-container">
      <Typography variant="h4" gutterBottom>
        User Details
      </Typography>

      <Typography variant="h6">
        Name:
      </Typography>
      <Typography variant="body1" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>

      <Typography variant="h6">
        Location:
      </Typography>
      <Typography variant="body1" gutterBottom>
        {user.location || 'N/A'}
      </Typography>

      <Typography variant="h6">
        Occupation:
      </Typography>
      <Typography variant="body1" gutterBottom>
        {user.occupation || 'N/A'}
      </Typography>

      <Typography variant="h6">
        Description:
      </Typography>
      <Typography variant="body1" gutterBottom>
        {user.description || 'No description provided.'}
      </Typography>
      <Link to={`photos`}>Photos</Link>
    </div>
  );
}



export default UserDetail;

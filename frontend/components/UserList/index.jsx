import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

import api from '../../lib/api';
import './styles.css';


function UserList() {
  

  // useEffect(() => {
  //   async function getUsers(){
  //     try{
  //       const response = await api.get("/user/list");
      
  //       setUsers(response.data);
  //       //console.log(response.data)
  //     } catch(error){
  //       console.error(error);
  //     }
  //   }

  //   getUsers();
  
  // },[]);

  const {data : users = []} = useQuery({
    queryKey : ['users'],
    queryFn: async () => {
      try {
        const res = await api.get("/user/list");
        
        return res.data;
      } catch (error){
        console.error(error);
        return [];
      }
    }
  });

  
  return (
    
      <Typography variant="body1" component="div">
      <List component="nav">
        {users.map(user => (
          <div key ={user._id}>
            <Link to={`users/${user._id}`} className='userLink'>
            <ListItem>
              <ListItemText>
                {user.first_name}
              </ListItemText>
            </ListItem>
            </Link>
            <Divider/>
          </div>
        ))}
      </List>
      </Typography>
    
  );
}

export default UserList;









import React, { useEffect, useState } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link } from "react-router-dom";
import api from '../../lib/api';
import './styles.css';



function UserList() {
  const [users,setUsers] = useState([]);

  useEffect(() => {
    async function getUsers(){
      try{
        const response = await api.get("/user/list");
      
        setUsers(response.data);
        //console.log(response.data)
      } catch(error){
        console.error(error);
      }
    }

    getUsers();
  
  },[]);

  //const response = await api.get("/users");
  //console.log(response)
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

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies

import { Typography } from '@mui/material';

import './styles.css';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';


function UserPhotos() {
  const {userId} = useParams();
  // const [photos,setPhotos] = useState([]);
  
  // useEffect(() => {
  //   async function getPhotos() {
  //     try{
  //     const response = await api.get(`/photosOfUser/${userId}`);
  //     setPhotos(response.data);
      
  //     } catch (error){
  //       console.error(error);
  //     }
  //   }

  //   getPhotos();
  // },[userId]);

  const {data: photos = []} = useQuery({
    queryKey: ['photos', userId],
    queryFn: async () => {
      try {
        const res = await api.get(`/photosOfUser/${userId}`);
        return res.data;
      } catch(error){
        console.error(error);
        return [];
      }
    },
    enabled: !!userId
  });




  const formated = (d) => {
      const date = new Date(d);
      const f = date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      });
      return f;
  };

  return (
    <Typography variant="body1" component="div" className='photos'>
      {photos.map(photo => (
          <div key={photo._id} >
            <div>
            
            {`Photo created on: ${formated(photo.date_time)}`}
            </div>
            <img src={`../../images/${photo.file_name}`}/>
            
            <Comments comments={photo.comments} formated={formated}/>
            
            
            
          </div>
        
      ))}
      
    </Typography>
  );
}

function Comments  ({comments,formated}) {

  if(!comments){
    return (
      <p>No comments</p>
    );
  }else {

    
 
    //console.log(comments)
    return (
      <div>
        Comments
        {comments.map(comment => (
          <div key={comment._id}>
            <div>
              
              Comment by: 
              <Link to={`/users/${comment.user._id}`}>
              {` ${comment.user.first_name} ${comment.user.last_name}`}
              </Link>
            </div>
            {comment.comment}
            
            <div>
              {`Commented on: ${formated(comment.date_time)}`}
            </div>

          </div>
        ))}
      </div>
    );
  }
}



export default UserPhotos;

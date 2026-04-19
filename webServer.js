import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user.js';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project2';


// Enable CORS for frontend running on a different port
app.use(cors());

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', async (req, res) => {
  try {
    // TODO:
    // 1. Fetch all users from MongoDB.
    // 2. Return only the fields required by the frontend.
    const users = await User.find({}).lean()

    const userList = users.map(user => ({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name 
    }))

    return res.json(userList);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    // TODO:
    // 1. Find the user by id.
    // 2. If the user does not exist, return 404.
    // 3. Return only the fields required by the frontend.

    const user = await User.findById(userId).lean();

    if(!user){
      return res.status(404).send('user not found')
    }
    delete user.__v
    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }



    // TODO:
    // 1. Find all photos whose user_id matches userId.
    // 2. Fetch all users from MongoDB.
    // 3. Build a lookup structure from user _id to user object.
    // 4. For each photo, construct the response expected by the frontend.
    // 5. For each comment, include the corresponding user object in comment.user.
    // 6. Return the resulting array.


    let p = await Photo.find({}).lean()



    //console.log(p)

    let photos = p.filter((photo) => photo.user_id.toString() === userId)

    

     for (const photo of photos) {
      for (const comment of photo.comments) {
        const user = await User.findById(comment.user_id).lean()

        delete user.location
        delete user.description
        delete user.occupation
        delete user.__v

        comment.user = user;
        delete comment.user_id;
      }
      delete photo.__v
    }


    if (photos.length === 0) {
      return res.status(404).send('photos not found')
    }
    return res.json(photos);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

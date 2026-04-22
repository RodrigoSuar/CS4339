import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Used when you implement the TODO handlers below.
// eslint-disable-next-line no-unused-vars
import User from './schema/user.js';
// eslint-disable-next-line no-unused-vars
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project3';

// Enable CORS for frontend running on a different port
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'p3-secret',
  resave: false,
  saveUninitialized: false,
}));

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized');
  return next();
}

/**
 * POST /admin/login
 */
app.post('/admin/login', async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) return res.status(400).send('login_name and password are required');

  try {
    const user = await User.findOne({ login_name }).lean();
    if (!user) return res.status(400).send('Invalid login_name or password');

    const match = await bcrypt.compare(password, user.password_digest);
    if (!match) return res.status(400).send('Invalid login_name or password');

    req.session.userId = user._id.toString();

    const { password_digest, __v, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


/* POST /admin/logout
*/

app.post('/admin/logout', (req, res) => {
  if (!req.session.userId) {  return res.status(400).send('Not logged in'); }

  req.session.destroy((err) => {
    if (err) return res.status(500).send(err.message);
    return res.sendStatus(200);
  });
});


/** * POST /user
 * Creates a new user.
 */

app.post('/user', async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send('login_name, password, first_name, and last_name are required');
  }

  try {
    const existing = await User.findOne({ login_name }).lean();
    if (existing) return res.status(400).send('login_name already exists');

    const password_digest = await bcrypt.hash(password, 10);
    const user = await User.create({ login_name, password_digest, first_name, last_name, location, description, occupation });

    return res.status(201).json({ _id: user._id, first_name, last_name, login_name });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/admin/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(404).send('User not found');
    const { password_digest, __v, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.get('/user/list', requireAuth, async (req, res) => {
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
app.get('/user/:id', requireAuth, async (req, res) => {
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
app.get('/photosOfUser/:id', requireAuth, async (req, res) => {
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

app.post('/commentsOfPhoto/:photoId', requireAuth, async (req, res) => {
  const { photoId } = req.params;
  const { comment } = req.body;

  if (!comment || !comment.trim()) return res.status(400).send('Comment text is required');
  if (!isValidObjectId(photoId)) return res.status(400).send('Invalid photo id');

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).send('Photo not found');

    photo.comments.push({ comment: comment.trim(), user_id: req.session.userId, date_time: new Date() });
    await photo.save();

    return res.status(201).json(photo);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

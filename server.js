const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

const { User, Thought } = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Notedb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

mongoose.set('debug', true);

//////////////////////////////
// User Routes
//////////////////////////////

// GET All Users
app.get('/api/users', (req, res) => {
    User.find({})
    // Populate fills in the actual user data (from just the IDs in the friends array)  
    .populate('friends')
      .then(dbUsers => {
        res.json(dbUsers);
      })
      .catch(err => {
        res.json(err);
      });
});

// GET Single User by ID
app.get('/api/users/:id', (req, res) => {
    User.findById(req.params.id)
      .populate('friends')
      .then(dbUser => {
        res.json(dbUser);
      })
      .catch(err => {
        res.json(err);
      });
});

// POST New User
app.post('/api/users', ({ body }, res) => {
    User.create(body)
      .then(dbUser => {
        res.json(dbUser);
      })
      .catch(err => {
        res.json(err);
      });
});

// PUT - Update Existing User
app.put('/api/users/:id', ({ params, body }, res) => {
    User.findOneAndUpdate({ _id: params.id }, body, { new: true })
      .then(dbUser => {
        if (!dbUser) {
          res.json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUser);
      })
      .catch(err => {
        res.json(err);
      });
});

// DELETE Single User by ID
app.delete('/api/users/:id', ({ params }, res) => {
    User.findOneAndDelete({ _id: params.id })
      .then(dbUser => {
        if (!dbUser) {
          res.json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUser);
        // Bonus - Delete associated thoughts from this user
        Thought.find({username: dbUser.username}).remove();
      })
      .catch(err => {
        res.json(err);
      });
});
// End of User Routes

//////////////////////////////
// Friend Routes
//////////////////////////////

// POST - Add Friend to Existing User
app.post('/api/users/:id/friends/:friendId', ({ params, body }, res) => {
    User.findOneAndUpdate(
        { _id: params.id },
        {"$push": {friends: params.friendId}},
        { new: true }
      )
      .then(dbUser => {
        if (!dbUser) {
          res.json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUser);
      })
      .catch(err => {
        res.json(err);
      });
});


// Start server and listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

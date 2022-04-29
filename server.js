// Bring in dependencies
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Bring in User and Thought models
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
    .populate('thoughts')
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
      .populate('thoughts')
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
        
        // Bonus - Delete associated thoughts from this user
        Thought.remove({username: dbUser.username})
        .then(del => console.log(del)); // Use to see deletedCount

        res.status('200').json({message: 'User and associated thoughts successfully deleted!'});
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
        // addToSet method adds a single item to the array without allowing duplicates
        {"$addToSet": {friends: params.friendId}},
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

// DELETE - Remove Friend From Existing User
app.delete('/api/users/:id/friends/:friendId', ({ params, body }, res) => {
    User.findOneAndUpdate(
        { _id: params.id },
        // Pull method pulls a single item from the array
        {"$pull": {friends: params.friendId}},
        { new: true }
      )
      .then(dbUser => {
        if (!dbUser) {
          res.json({ message: 'No user found with this id!' });
          return;
        }
        res.status('200').json({message: 'Friend successfully deleted!'});
      })
      .catch(err => {
        res.json(err);
      });
});
// End of Friend Routes


//////////////////////////////
// Thought Routes
//////////////////////////////

// GET All Thoughts
app.get('/api/thoughts', (req, res) => {
    Thought.find({})
    // Populate fills in the actual reaction data (from just the IDs in the reactions array)
    .populate('reactions')
      .then(dbThoughts => {
        res.json(dbThoughts);
      })
      .catch(err => {
        res.json(err);
      });
});

// GET Single Thought by ID
app.get('/api/thoughts/:id', (req, res) => {
    Thought.findById(req.params.id)
      .populate('reactions')
      .then(dbThought => {
        res.json(dbThought);
      })
      .catch(err => {
        res.json(err);
      });
});

// POST New Thought
app.post('/api/thoughts', ({ body }, res) => {
    Thought.create(body)
        .then(({ _id, username }) =>
        // Update User model with new thought
        User.findOneAndUpdate(
            // Find User by username
            {username},
            // Push to array by the deconstructed id value
            { $push: { thoughts: _id } },
            { new: true }
        )
        )
        .then(dbUser => {
        res.json(dbUser);
        })
        .catch(err => {
        res.json(err);
        });
});

// PUT - Update Existing Thought
app.put('/api/thoughts/:id', ({ params, body }, res) => {
    Thought.findOneAndUpdate({ _id: params.id }, body, { new: true })
      .then(dbThought => {
        if (!dbThought) {
          res.json({ message: 'No thought found with this id!' });
          return;
        }
        res.json(dbThought);
      })
      .catch(err => {
        res.json(err);
      });
});

// DELETE Single Thought by ID
app.delete('/api/thoughts/:id', ({ params }, res) => {
    Thought.findOneAndDelete({ _id: params.id })
      .then(dbThought => {
        if (!dbThought) {
          res.json({ message: 'No thought record found with this id!' });
          return;
        }
        res.status('200').json({message: 'Thought successfully deleted!'});
      })
      .catch(err => {
        res.json(err);
      });
});
// End of Thought Routes


//////////////////////////////
// Reaction Routes
//////////////////////////////

// POST New Reaction in Thought Model
app.post('/api/thoughts/:thoughtId/reactions', ({ body, params }, res) => {
    Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $push: { reactions: body } },
        { new: true }
    )
    .then(dbThought => {
        res.json(dbThought);
        })
        .catch(err => {
        res.json(err);
        });
});

// DELETE Reaction by the reactionId
app.delete('/api/thoughts/:thoughtId/reactions/:reactionId', ({ params }, res) => {
    Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        // Pull method pulls a single item from the array
        { $pull: { reactions: { reactionId: params.reactionId } } },
        { new: true }
      )
      .then(dbThought => {
        if (!dbThought) {
          res.json({ message: 'No thought found with this id!' });
          return;
        }
        res.status('200').json({message: 'Reaction successfully deleted!'});
      })
      .catch(err => {
        res.json(err);
      });
});
// End of Reaction Routes


// Start server and listen
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

const { Schema, model } = require('mongoose');
// Bring in Reaction schema to use as an array in the Thought schema
const reactionSchema = require('./Reaction');

const thoughtSchema = new Schema({
  thoughtText: {
    type: String,
    required: 'Thought Text is Required',
    minlength: 1,
    maxlength: 280
  },

  createdAt: {
      type: Date,
      default: Date.now,
      // Getter method
      get: (date) => {
        if (date) return date.toISOString().split("T") [0];
      },
  },
  
  username: {
    type: String,
    required: 'Username is Required'
  },

  reactions: [reactionSchema],
},
{
    toJSON: {
      virtuals: true,
      getters: true
    },
    id: false
}
);

// Virtual
UserSchema.virtual('reactionCount').get(function() {
    return this.reactions.length;
  });

const User = model('User', UserSchema);

module.exports = User;
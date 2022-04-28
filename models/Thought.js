const { Schema, model } = require('mongoose');
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
      default: Date.now
  },
  
  username: {
    type: String,
    required: 'Username is Required'
  },

  reactions: [reactionSchema],
},
{
    toJSON: {
      virtuals: true
    },
    id: false
}
);

UserSchema.virtual('reactionCount').get(function() {
    return this.reactions.length;
  });

const User = model('User', UserSchema);

module.exports = User;
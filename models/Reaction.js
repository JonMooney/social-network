const { Schema, Types } = require('mongoose');

const reactionSchema = new Schema({
  reactionId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId()
  },

  reactionBody: {
      type: String,
      required: 'Reaction Body is Required',
      maxlength: 280
  },

  username: {
    type: String,
    required: 'Username is Required'
  },

  createdAt: {
      type: Date,
      default: Date.now,
  }
});

module.exports = noteSchema;
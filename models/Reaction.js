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
      // Getter method
      get: (date) => {
        if (date) return date.toISOString().split("T") [0];
      },
  }
},
{
    toJSON: {
      getters: true
    },
    id: false
}
);

module.exports = noteSchema;
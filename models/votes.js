/**
 * schema for votes collection.
 * votes are raised against an issues document.
 */

import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

const votesSchema = new mongoose.Schema({
  issueId: {
    type: ObjectId,
    required: true,
    index: true
  },
  voteCaster: {
    type: String,
    required: true,
    index: true
  },
  up: {
    type: Boolean,
    required: true,
    default: true
  },
  castDate: {
    type: Date,
    required: true,
    default: Date.now
  }
})

mongoose.model('votes', votesSchema)

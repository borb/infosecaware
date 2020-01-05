import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  fullname: {
    type: String,
    required: true
  },
  administrator: {
    type: Boolean,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
})

mongoose.model('users', usersSchema)

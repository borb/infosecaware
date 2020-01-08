import mongoose from 'mongoose'

const issuesSchema = new mongoose.Schema({
  authorEmail: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    index: true
  },
  sensitivity: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    required: true,
    default: false
  },
  accessLimited: {
    type: Boolean,
    required: true,
    default: false
  },
  accessEmailList: [String],
  tagList: [String]
})

mongoose.model('issues', issuesSchema)

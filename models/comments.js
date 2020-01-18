import mongoose from 'mongoose'

const ObjectId = mongoose.Schema.Types.ObjectId

const commentsSchema = new mongoose.Schema({
  issueId: {
    type: ObjectId,
    required: true,
    index: true
  },
  postedDate: {
    type: Date,
    index: true,
    default: Date.now
  },
  authorEmail: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  }
})

mongoose.model('comments', commentsSchema)

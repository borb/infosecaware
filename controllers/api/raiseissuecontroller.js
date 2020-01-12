import mongoose from 'mongoose'
import _ from 'lodash'

const post = (req, res) => {
  // populate new issue with data
  let issue = new (mongoose.model('issues'))()
  issue.authorEmail = req.authUser.email
  issue.title = req.body.postTitle
  issue.message = req.body.postBody
  issue.sensitivity = req.body.sharingSecrecy
  issue.anonymous = req.body.postAnonymity || false
  issue.accessLimited = req.body.enableLimitedAudience || false
  issue.accessEmailList = req.body.postAudience
    ? req.body.postAudience.split(/,+ */)
    : []
  issue.tagList = req.body.postTags
    ? req.body.postTags.split(/,+ */)
    : []

  issue.save((error) => {
    if (error) {
      res.status(500).json({
        success: false
      })
      return
    }

    res.json({
      success: true,
      issueId: issue._id
    })
  })
}

const getPostTags = (req, res) => {
  const issues = mongoose.model('issues')
  issues
    .find()
    .select('tagList -_id')
    .exec((error, results) => {
      res.json({
        success: true,
        postTags: _.union(...results.map((result) => result.tagList))
      })
    })
}

export default {
  "post": post,
  "getPostTags": getPostTags
}

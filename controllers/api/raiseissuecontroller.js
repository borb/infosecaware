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

const getPostMetadata = (req, res) => {
  const issues = mongoose.model('issues')
  const users = mongoose.model('users')
  issues
    .find()
    .select('tagList -_id')
    .exec((error, results) => {
      const tagList = _.union(...results.map((result) => result.tagList))
      users
        .find()
        .select('fullname email -_id')
        .exec((error, results) => {
          const userList = results.map((result) => {return {fullname: result.fullname, email: result.email}})
          res.json({
            success: true,
            postTags: tagList,
            userList: userList
          })
        })
    })
}

const getBoardData = (req, res) => {
  const issues = mongoose.model('issues')

  // we'll build up the filter from data pulled from req.body
  const filter = {}

  issues
    .aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'users',
          localField: 'authorEmail',
          foreignField: 'email',
          as: 'authorData'
        }
      },
      {
        $sort: {
          postedDate: -1
        }
      },
      {
        // @todo take pagination from req.body
        $skip: 0
      },
      {
        // @todo take pagination from req.body
        $limit: 20
      }
    ])
    .exec((error, results) => {
      results.map((result) => {
        result.listClass =
          result.sensitivity === 'safe' ? 'success' :
            (result.sensitivity === 'sensitive' ? 'warning' :
              (result.sensitivity === 'top-secret' ? 'danger' : 'primary')
            )

        if (result.anonymous) {
          result.authorData = [{fullname: '<redacted>'}]
          result.authorEmail = '<redacted>'
        }
      })
      res.json({
        success: true,
        posts: results
      })
    })
}

export default {
  "post": post,
  "getPostMetadata": getPostMetadata,
  "getBoardData": getBoardData
}

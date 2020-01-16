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

  const issueAggregate = [
    {
      $lookup: {
        from: 'users',
        localField: 'authorEmail',
        foreignField: 'email',
        as: 'authorData'
      }
    }
  ]

  // filter by authors
  if (req.body.filter.authors) {
    const authors = req.body.filter.authors.split(/,+ */)
    // match any of the provided authors ($or), not all ($and)!
    const match = {$match: {}}
    match.$match.$or = authors.map((author) => { return {authorEmail: author}})
    issueAggregate.push(match)
  }

  // filter by issue sensitivity
  if (req.body.filter.topsecret || req.body.filter.sensitive || req.body.filter.safe) {
    const match = {$match: {}}
    const sensitivitySet = []

    if (req.body.filter.topsecret)
      sensitivitySet.push('top-secret')

    if (req.body.filter.sensitive)
      sensitivitySet.push('sensitive')

    if (req.body.filter.safe)
      sensitivitySet.push('safe')

    if (sensitivitySet.length) {
      match.$match.sensitivity = {$in: sensitivitySet}
      issueAggregate.push(match)
    }
  }

  // filter by any of the specified tags
  if (req.body.filter.tags) {
    const tags = req.body.filter.tags.split(/,+ */)
    const match = {$match: {tagList: {$in: tags}}}
    issueAggregate.push(match)
  }

  // sort, skip and limit after matching
  [
    {
      $sort: {
        postedDate: -1
      }
    },
    {
      $skip: req.body.page ? ((req.body.page * 15) - 1) : 0
    },
    {
      $limit: 15
    }
  ].map((aggregatePattern) => issueAggregate.push(aggregatePattern))

  issues
    .aggregate(issueAggregate)
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
        posts: results,
        hasPrevious: req.body.page ? true : false,
        hasMore: (results.length < 15) ? false : true
      })
    })
}

export default {
  "post": post,
  "getPostMetadata": getPostMetadata,
  "getBoardData": getBoardData
}

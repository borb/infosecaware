import mongoose from 'mongoose'
import _ from 'lodash'

const ObjectId = mongoose.Types.ObjectId

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

  // initial aggregate setup: include author credentials, and don't load issues we aren't permitted to view
  const issueAggregate = [
    {
      $lookup: {
        from: 'users',
        localField: 'authorEmail',
        foreignField: 'email',
        as: 'authorData'
      }
    },
    {
      $lookup: {
        from: 'votes',
        let: {issueId: '$_id'},
        as: 'votes',
        pipeline: [
          {
            $group: {
              _id: '$up',
              count: {$sum: 1}
            }
          }
        ]
      }
    },
    {
      $match: {
        $or: [
          {accessLimited: false},
          {accessEmailList: req.authUser.email}
        ]
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
        // setup colourisation for list class
        result.listClass =
          result.sensitivity === 'safe' ? 'success' :
            (result.sensitivity === 'sensitive' ? 'warning' :
              (result.sensitivity === 'top-secret' ? 'danger' : 'primary')
            )

        // redact identity for anonymous posts
        if (result.anonymous) {
          result.authorData = [{fullname: '<redacted>'}]
          result.authorEmail = '<redacted>'
        }

        // consolidate vote data into a useful format
        let voteData = {
          up: 0,
          down: 0
        }

        result.votes.map((vote) => {
          if (vote._id === false)
            voteData.down = vote.count
          else
            voteData.up = vote.count
        })

        result.votes = voteData
      })
      res.json({
        success: true,
        posts: results,
        hasPrevious: req.body.page ? true : false,
        hasMore: (results.length < 15) ? false : true
      })
    })
}

const getIssue = (req, res) => {
  const issues = mongoose.model('issues')

  if (!req.params.issueId) {
    res.json({
      success: false,
      error: 'issue ID missing or malformed'
    })
    return
  }

  // initial aggregate setup: include author credentials, and don't load issues we aren't permitted to view
  issues
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'authorEmail',
          foreignField: 'email',
          as: 'authorData'
        },
      },
      {
        $lookup: {
          from: 'comments',
          let: {issueId: '$_id'},
          as: 'comments',
          pipeline: [
            {$sort: {postedDate: -1}},
            {$lookup: {
              from: 'users',
              localField: 'authorEmail',
              foreignField: 'email',
              as: 'authorData'
            }}
          ]
        }
      },
      {
        $match: {
          $or: [
            {accessLimited: false},
            {accessEmailList: req.authUser.email}
          ]
        }
      },
      {
        $match: {
          _id: new ObjectId(req.params.issueId)
        }
      }
    ])
    .exec((error, results) => {
      res.json({
        success: results.length ? true : false,
        post: results.length ? results[0] : {}
      })
    })
}

const postComment = (req, res) => {
  let comment = new (mongoose.model('comments'))()
  comment.issueId = new ObjectId(req.body.issueId)
  comment.authorEmail = req.authUser.email
  comment.comment = req.body.comment

  comment.save((error) => {
    if (error) {
      res.status(500).json({
        success: false
      })
      return
    }

    res.json({success: true})
  })
}

const getTagCounts = (req, res) => {
  const issues = mongoose.model('issues')
  issues.aggregate([
    {
      $match: {
        tagList: {$not: {$size: 0}}
      }
    },
    {$unwind: '$tagList'},
    {
      $group: {
        _id: {$toLower: '$tagList'},
        count: {$sum: 1}
      }
    },
    {
      $match: {
        count: {$gte: 1}
      }
    }
  ]).exec((error, results) => {
    res.json({
      success: true,
      tagData: results
    })
  })
}

const upVote = (req, res) => {
  const votes = mongoose.model('votes')
  votes.findOneAndDelete(
    {
      issueId: new ObjectId(req.params.issueId),
      voteCaster: req.authUser.email
    },
    (error, results) => {
      console.log({error: error, results: results})
      if (results === null) {
        let vote = new votes()
        vote.issueId = req.params.issueId
        vote.voteCaster = req.authUser.email
        vote.up = true

        vote.save((error) => {
          if (error) {
            res.status(500).json({
              success: false
            })
            return
          }

          res.json({success: true, vote: 'registered'})
        })
      } else
        res.json({success: true, vote: 'revoked'})
    }
  )
}

const downVote = (req, res) => {
  const votes = mongoose.model('votes')
  votes.findOneAndDelete(
    {
      issueId: new ObjectId(req.params.issueId),
      voteCaster: req.authUser.email
    },
    (error, results) => {
      console.log({error: error, results: results})
      if (results === null) {
        let vote = new votes()
        vote.issueId = req.params.issueId
        vote.voteCaster = req.authUser.email
        vote.up = false

        vote.save((error) => {
          if (error) {
            res.status(500).json({
              success: false
            })
            return
          }

          res.json({success: true, vote: 'registered'})
        })
      } else
        res.json({success: true, vote: 'revoked'})
    }
  )
}

const voteCount = (req, res) => {
  const votes = mongoose.model('votes')
  votes.aggregate([
    {
      $match: {
        issueId: new ObjectId(req.params.issueId)
      }
    },
    {
      $group: {
        _id: '$up',
        count: {$sum: 1}
      }
    }
  ]).exec((error, results) => {
    const voteCount = {
      up: 0,
      down: 0
    }

    // consolidate into a simplified format
    results.map((result) => {
      if (result._id === false)
        voteCount.down = result.count
      else
        voteCount.up = result.count
    })

    res.json({
      success: true,
      voteData: voteCount
    })
  })
}

export default {
  "post": post,
  "getPostMetadata": getPostMetadata,
  "getBoardData": getBoardData,
  "getIssue": getIssue,
  "postComment": postComment,
  "getTagCounts": getTagCounts,
  "upVote": upVote,
  "downVote": downVote,
  "voteCount": voteCount
}

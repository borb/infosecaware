/**
 * issue controller
 *
 * handles api operations related to fetching and creating issues, commenting on them,
 * and voting upon them.
 */

import mongoose from 'mongoose'
import _ from 'lodash'

const ObjectId = mongoose.Types.ObjectId

/**
 * create a new issue in the database
 */
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

  // save the issue and return the response to the client
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

/**
 * fetch metadata used in guiding creation of a new issue in the database.
 *
 * this will fetch user information - email addresses and real names, and
 * all tags used in current posts. since tags can be applied dynamically,
 * storing them in a separate collection seems illogical, so fetch and
 * union all of the tags in a unique list.
 */
const getPostMetadata = (req, res) => {
  const issues = mongoose.model('issues')
  const users = mongoose.model('users')

  // fetch chain; start by getting all tags and making a unique array of them
  issues
    .find()
    .select('tagList -_id')
    .exec((error, results) => {
      if (error) {
        res.status(500).json({
          success: false
        })
        return
      }

      const tagList = _.union(...results.map((result) => result.tagList))

      // now pull all user email addresses and names
      users
        .find()
        .select('fullname email -_id')
        .exec((error, results) => {
          if (error) {
            res.status(500).json({
              success: false
            })
            return
          }

          // return the product of both fetches
          res.json({
            success: true,
            postTags: tagList,
            userList: results
          })
        })
    })
}

/**
 * fetch a list of issues to format into a table of community posts.
 *
 * this incorporates a series of aggregate joins (think "LEFT JOIN" in sql parlance).
 * data on who posted the issue, and the number of votes is also fetched to prevent
 * additional database queries.
 *
 * a $match is injected into the aggregate pipeline to implement access control, so
 * that posts which are not permitted to be accessed are removed from the returned
 * data without affecting fetch counts; revoking after fetch would affect the board
 * rendering in that an inconsistent number of posts would exist on each page.
 *
 * pagination is also injected into the aggregate pipeline so we don't overfetch
 * information.
 *
 * lastly, anonymisation is implemented prior to returning the data. identities are
 * manually revoked by an array map. no revoked identities are transmitted over the
 * api.
 */
const getBoardData = (req, res) => {
  const issues = mongoose.model('issues')

  // initial aggregate setup: include author credentials, votes, and don't load
  // issues we aren't permitted to view
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
        localField: '_id',
        foreignField: 'issueId',
        as: 'votes'
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

  // filter by authors if the user has specified some
  if (req.body.filter.authors) {
    const authors = req.body.filter.authors.split(/,+ */)
    // match any of the provided authors ($or), not all ($and)!
    const match = {$match: {}}
    match.$match.$or = authors.map((author) => { return {authorEmail: author}})
    issueAggregate.push(match)
  }

  // filter by issue sensitivity, if specified
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

  // filter by any of the specified tags, if specified
  if (req.body.filter.tags) {
    const tags = req.body.filter.tags.split(/,+ */)
    const match = {$match: {tagList: {$in: tags}}}
    issueAggregate.push(match)
  }

  // sort, skip and limit after matching:
  // if injected into the aggregate pipeline BEFORE, the other filters act AFTER
  // the limit has been imposed, which results in fewer than expected results
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

  // run the fetch
  issues
    .aggregate(issueAggregate)
    .exec((error, results) => {
      if (error) {
        res.status(500).json({
          success: false
        })
        return
      }

      // rework results after successful fetch
      results.map((result) => {
        // setup colourisation for list class; ugly, but we only have three states
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

        // consolidate vote data into a useful format.
        // n.b. it was attempted to use $count in a sub-pipeline but the resulting
        // data failed to meet requirements, so we are manually counting by map here
        let voteData = {
          up: 0,
          down: 0
        }

        result.votes.map((vote) => {
          if (vote.up === false)
            voteData.down++
          else
            voteData.up++
        })

        result.votes = voteData
      })

      // send the data  back to the caller
      res.json({
        success: true,
        posts: results,
        // "cheating pagination": rather than count all records in a collection,
        // the presence and truthiness of a page number means there are previous
        // pages. if there are fewer than the page size number of records, there
        // must be no more pages. this has the downside of rendering a blank page
        // if the last page has exactly the pagesize number of records.
        // still less costly than a separate collection count after filtering!
        hasPrevious: req.body.page ? true : false,
        hasMore: (results.length < 15) ? false : true
      })
    })
}

/**
 * retrieve an issue from the database.
 *
 * use aggregate pipeline to fetch relevant subdata; author fullname, issue comments.
 */
const getIssue = (req, res) => {
  const issues = mongoose.model('issues')

  // check issue parameter
  if (!req.params.issueId) {
    res.json({
      success: false,
      error: 'issue ID missing or malformed'
    })
    return
  }

  // initial aggregate setup: include author credentials, and don't load issues we
  // aren't permitted to view
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
          let: {parentIssueId: '$_id'},
          as: 'comments',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$issueId', '$$parentIssueId']
                }
              }
            },
            {$sort: {postedDate: -1}},
            {
              $lookup: {
                from: 'users',
                localField: 'authorEmail',
                foreignField: 'email',
                as: 'authorData'
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
      },
      {
        $match: {
          _id: new ObjectId(req.params.issueId)
        }
      }
    ])
    .exec((error, results) => {
      if (error) {
        res.status(500).json({
          success: false
        })
        return
      }

      // return the resulting data
      res.json({
        success: results.length ? true : false,
        post: results.length ? results[0] : {}
      })
    })
}

/**
 * create a new comment on an issue.
 */
const postComment = (req, res) => {
  let comment = new (mongoose.model('comments'))()
  comment.issueId = new ObjectId(req.body.issueId)
  comment.authorEmail = req.authUser.email
  comment.comment = req.body.comment

  // write to the database
  comment.save((error) => {
    if (error) {
      res.status(500).json({
        success: false
      })
      return
    }

    // tell the caller we succeeded
    res.json({success: true})
  })
}

/**
 * tag cloud count fetch.
 *
 * this call fetches all tags and how many times they have been specified. the cloud
 * is rendered with larger counts featuring larger text, indicating tag popularity.
 */
const getTagCounts = (req, res) => {
  const issues = mongoose.model('issues')

  // use an aggregate pipeline to count at database side rather than here
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
    if (error) {
      res.status(500).json({
        success: false
      })
      return
    }

    // return our data result to the caller
    res.json({
      success: true,
      tagData: results
    })
  })
}

/**
 * "upvote" an issue.
 *
 * if a vote has already been cast, revoke it.
 */
const upVote = (req, res) => {
  const votes = mongoose.model('votes')

  // delete the vote, if it exists: don't panic if it doesn't find one
  votes.findOneAndDelete(
    {
      issueId: new ObjectId(req.params.issueId),
      voteCaster: req.authUser.email
    },
    (error, results) => {
      if (error) {
        res.status(500).json({
          success: false
        })
        return
      }

      // if no existing issue existed, create a new upvote
      if (results === null) {
        let vote = new votes()
        vote.issueId = req.params.issueId
        vote.voteCaster = req.authUser.email
        vote.up = true

        // save the new vote and respond to the api call
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

/**
 * "downvote" an issue.
 *
 * if a vote has already been cast, revoke that vote.
 */
const downVote = (req, res) => {
  const votes = mongoose.model('votes')

  // delete the vote, if it exists
  votes.findOneAndDelete(
    {
      issueId: new ObjectId(req.params.issueId),
      voteCaster: req.authUser.email
    },
    (error, results) => {
      if (error) {
        res.status(500).json({
          success: false
        })
        return
      }

      // if no vote existed prior to deletion, create a new downvote
      if (results === null) {
        let vote = new votes()
        vote.issueId = req.params.issueId
        vote.voteCaster = req.authUser.email
        vote.up = false

        // save the vote and respond to the api call
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

/**
 * count all votes for an issue.
 *
 * this is often called after a vote has been cast, to refresh the counts.
 */
const voteCount = (req, res) => {
  const votes = mongoose.model('votes')

  // use aggregate pipeline to group and count up and down votes
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
    if (error) {
      res.status(500).json({
        success: false
      })
      return
    }

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

    // send response to the api caller
    res.json({
      success: true,
      voteData: voteCount
    })
  })
}

/**
 * export our public methods to the route setup
 */
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

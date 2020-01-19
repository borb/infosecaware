/**
 * viewIssue controller frontend code.
 *
 * viewIssue occurs as a modal, which can be displayed upon the landing page or the
 * community board view. incorporating the viewIssue template in a page will aid
 * SPA requests to display issues without loading a new page.
 */

infosecawareApplication
  .controller('viewIssueController', ['$scope', '$http', function($scope, $http) {
    $scope.blankIssue = {}

    $scope.reset = function() {
      // clear issue data so the modal is effectively blank
      // this prevents failed api calls displaying old data
      $scope.issue = angular.copy($scope.blankIssue)
    }

    // load an issue from the api and push into an object
    // angular magic will render it in page
    $scope.loadIssue = function(issueId, nextAction) {
      $http.get('/api/v1/getIssue/' + issueId)
        .then(
          function(res) {
            // successful fetch
            $scope.issue = res.data.post
            // bubble through to the callback, executed after async finishes
            nextAction()
          },
          function() {
            // error during fetch
            console.error('failed to fetch post with id:', issueId)
          }
        )
    }

    // submit a comment against an issue
    $scope.submitComment = function() {
      // send the comment to the api
      $http.post('/api/v1/postComment', {
        issueId: $scope.issue._id,
        comment: $scope.comment
      })
        .then(
          function(res) {
            // successful post; refresh the issue to load new comment
            $scope.comment = ''
            $scope.loadIssue($scope.issue._id, function() {})
          },
          function() {
            // error posting comment
            console.error('failed to post comment on issue:', $scope.issue._id)
          }
        )
    }

    // pull votes from the api
    // useful after a vote has been cast, also for initial display
    $scope.updateVotes = function() {
      $http.get('/api/v1/voteCount/' + $scope.issue._id)
        .then(
          function(res) {
            // store vote data (don't worry about copy, it's read-only)
            $scope.votes = res.data.voteData
          },
          function() {
            // error getting vote update
            console.error('failed to get vote data for issue:', $scope.issue._id)
          }
        )
    }

    // upvote an issue by notifying the api
    $scope.upVote = function() {
      $http.get('/api/v1/upVote/' + $scope.issue._id)
        .then(
          function() {
            // upvote success; update vote count
            $scope.updateVotes()
          },
          function() {
            console.error('error casting upvote on issue:', $scope.issue._id)
          }
        )
    }

    // downvote an issue by notifying the api
    $scope.downVote = function() {
      $http.get('/api/v1/downVote/' + $scope.issue._id)
        .then(
          function() {
            // downvote success; update vote count
            $scope.updateVotes()
          },
          function() {
            console.error('error casting downvote on issue:', $scope.issue._id)
          }
        )
    }

    // listener for view events emitted by communityController frontend
    $scope.$on('issueViewer', function(event, issueId) {
      $scope.loadIssue(issueId, function() {
        $('#viewIssueModal').modal('show')

        // load the vote count for the thumbs
        $scope.updateVotes()
      })
    })

    // initial setup; empty votes, comment & reset
    $scope.votes = {
      up: 0,
      down: 0
    }
    $scope.comment = ''
    $scope.reset()
  }])

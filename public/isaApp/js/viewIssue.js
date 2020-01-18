infosecawareApplication
  .controller('viewIssueController', ['$scope', '$http', function($scope, $http) {
    $scope.blankIssue = {}

    $scope.reset = function() {
      // clear issue data so the modal is effectively blank
      $scope.issue = angular.copy($scope.blankIssue)
    }

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

    $scope.submitComment = function() {
      $http.post('/api/v1/postComment', {
        issueId: $scope.issue._id,
        comment: $scope.comment
      })
        .then(
          function(res) {
            // successful post
            $scope.comment = ''
            $scope.loadIssue($scope.issue._id, function() {})
          },
          function() {
            // error posting comment
            console.error('failed to post comment on issue:', $scope.issue._id)
          }
        )
    }

    $scope.updateVotes = function() {
      $http.get('/api/v1/voteCount/' + $scope.issue._id)
        .then(
          function(res) {
            $scope.votes = res.data.voteData
          },
          function() {
            // error getting vote update
            console.error('failed to get vote data for issue:', $scope.issue._id)
          }
        )
    }

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

    $scope.downVote = function() {
      $http.get('/api/v1/downVote/' + $scope.issue._id)
        .then(
          function() {
            // upvote success; update vote count
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

    $scope.votes = {
      up: 0,
      down: 0
    }
    $scope.comment = ''
    $scope.reset()
  }])

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

    // listener for view events emitted by communityController frontend
    $scope.$on('issueViewer', function(event, issueId) {
      $scope.loadIssue(issueId, function() {
        $('#viewIssueModal').modal('show')
      })
    })

    $scope.votes = {
      up: 0,
      down: 0
    }
    $scope.comment = ''
    $scope.reset()
  }])

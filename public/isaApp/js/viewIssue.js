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

    // listener for view events emitted by communityController frontend
    $scope.$on('issueViewer', function(event, issueId) {
      $scope.loadIssue(issueId, function() {
        $('#viewIssueModal').modal('show')
      })
    })

    $scope.reset()
  }])

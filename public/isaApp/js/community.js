angular.module('infosecaware', [])
  .controller('communityController', ['$scope', '$http', function($scope, $http) {
    $scope.noIssues = []

    $scope.fill = function(data) {
      $scope.issues = angular.copy(data)
    }

    $scope.update = function() {
      $http.get('/api/v1/getBoardData')
        .then(
          function(res) {
            // success
            $scope.fill(res.data.posts)
          },
          function() {
            // error
            console.log('failed to retrieve posts from server')
          }
        )
    }

    $scope.fill($scope.noIssues)
    $scope.update()
  }])

// load the tags and authors for filtering
setupAuthorTagSuggestions(
  document.getElementById('postTags'),
  document.getElementById('postAudience')
)

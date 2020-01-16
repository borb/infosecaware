angular.module('infosecaware', [])
  .controller('communityController', ['$scope', '$http', function($scope, $http) {
    $scope.empty = {posts: []}

    $scope.fill = function(data) {
      $scope.board = angular.copy(data)
    }

    $scope.update = function() {
      $http.post('/api/v1/getBoardData', {page: $scope.page, filter: $scope.filter})
        .then(
          function(res) {
            // success
            $scope.fill(res.data)
          },
          function() {
            // error
            console.log('failed to retrieve posts from server')
          }
        )
    }

    $scope.updateFilter = function() {
      $scope.page = 0
      $scope.update()
    }

    $scope.nextPage = function() {
      $scope.page++
      $scope.update()
    }

    $scope.previousPage = function() {
      $scope.page--
      $scope.update()
    }

    // setup defaults
    $scope.fill($scope.empty)
    $scope.page = 0
    $scope.filter = {
      sensitive: true,
      safe: true,
      topsecret: true
    }

    // call update to get our initial data
    $scope.update()
  }])

// load the tags and authors for filtering
setupAuthorTagSuggestions(
  document.getElementById('postTags'),
  document.getElementById('postAudience')
)

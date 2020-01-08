angular.module('infosecaware', [])
  .controller('raiseIssueController', ['$scope', '$http', function($scope, $http) {
    $scope.master = {}

    $scope.reset = function() {
      // clear form contents by copying master over 'post'
      $scope.post = angular.copy($scope.master)
    }

    $scope.submit = function(post) {
      // write post to api
      $http.post('/api/v1/raiseIssue', post)
        .then(
          function(data) {
            // success happened
            // @todo close modal & refresh background view
          },
          function(data) {
            // @todo handle errors helpfully
            console.error('raiseIssue http call failed', data)
          }
        )
    }

    $scope.reset()
  }])

angular.element(function() {
  angular.bootstrap(document, ['infosecaware'])
})

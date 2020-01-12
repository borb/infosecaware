angular.module('infosecaware', [])
  .controller('communityController', ['$scope', '$http', function($scope, $http) {
    $scope.master = {}
  }])

angular.element(function() {
  angular.bootstrap(document, ['infosecaware'])
})

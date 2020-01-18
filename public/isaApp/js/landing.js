infosecawareApplication
  .controller('landingController', ['$scope', '$http', function($scope, $http) {
    $scope.tagCloud = function() {
      $http.get('/api/v1/getTagCounts')
        .then(
          function(res) {
            // success
            $scope.tagData = res.data.tagData

            // display the cloud
            $(document).ready($(function () {
              $("#tagcloud a").tagcloud({
                color: {
                  start: '#1c5866',
                  end: '#661c49'
                }
              })
            }))
          },
          function() {
            console.log('failed to load tag cloud data')
          }
        )
    }

    $scope.tagData = []
    $scope.tagCloud()
  }])

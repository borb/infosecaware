/**
 * landing page controller frontend code.
 *
 * the landing page contains a tag cloud and view of the message board, however that
 * is rendered by the communityController.
 */

infosecawareApplication
  .controller('landingController', ['$scope', '$http', function($scope, $http) {
    // initiate the tag cloud by fetching tag count data from the api
    // we can relax about copies since the data is read only
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

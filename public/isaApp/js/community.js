/**
 * community controller frontend code.
 *
 * this is used in two places: the landing page, for rendering recent posts, and
 * within the community page for the more comprehensive issue board view.
 */

infosecawareApplication
  .controller('communityController', ['$scope', '$http', function($scope, $http) {
    $scope.empty = {posts: []}

    // method to copy data into our message board; direct assignment in javascript
    // copies by reference, so resets would not reset form contents
    $scope.fill = function(data) {
      $scope.board = angular.copy(data)
    }

    // fetch board data from the api; used in next/previous pages and filter updates
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

    // update filters; potentially this could land us on an invalid page, so reset
    // the currently viewed page back to the first
    $scope.updateFilter = function() {
      $scope.page = 0
      $scope.update()
    }

    // go up a page and get the next set of results
    $scope.nextPage = function() {
      $scope.page++
      $scope.update()
    }

    // go back a page and get the previous set of results
    $scope.previousPage = function() {
      $scope.page--
      $scope.update()
    }

    // use the event broadcast mechanism to signal to the issueController that we
    // want to view an issue in a modal (this will fail silently if the listener
    // has not been loaded, so ensure this is tested)
    $scope.openIssue = function(issueId) {
      $scope.$broadcast('issueViewer', issueId)
    }

    // initial setup: enable all forms of post, start at first page, empty board data
    $scope.setup = function() {
      $scope.fill($scope.empty)
      $scope.page = 0
      $scope.filter = {
        sensitive: true,
        safe: true,
        topsecret: true
      }
    }

    // listen for requests using event broadcast to update the board view
    // this is signalled from the raiseIssue controller in order to update the board
    // view in the background after a new issue has been posted (so it may be
    // displayed)
    $scope.$on('refreshIssueView', function() {
      // set the view to defaults so our new issue is displayed at the top
      $scope.setup()
      $scope.update()
    })

    // setup defaults
    $scope.setup()

    // call update to get our initial data
    $scope.update()
  }])

// load the tags and authors for filtering
setupAuthorTagSuggestions(
  document.getElementById('postTags'),
  document.getElementById('postAudience')
)

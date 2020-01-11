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
            // @todo refresh background view
            $scope.reset
            $('#raiseIssueModal').modal('hide')
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

// when the modal display event is triggered, load the tags & users from
// database then attach autosuggest
$('#raiseIssueModal').on('show.bs.modal', function(e) {
  // autosuggestions for the post tags
  var $http = angular.injector(['ng']).get('$http')
  $http.get('/api/v1/getPostTags')
    .then(
      function(res) {
        // success
        var instance = new AutoSuggest({
          caseSensitive: false,
          suggestions: [
            {
              trigger: '',
              values: res.data.postTags
            }
          ]
        })

        instance.addInputs(document.getElementById('postTags'))
      },
      function() {
        // failure
        console.log('network error: autopopulated post tags will not be available')
      }
    )
})

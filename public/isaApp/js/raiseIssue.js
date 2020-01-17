infosecawareApplication
  .controller('raiseIssueController', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    $scope.master = {}

    $scope.reset = function() {
      // clear form contents by copying master over 'post'
      $scope.post = angular.copy($scope.master)
    }

    $scope.submit = function(post) {
      var forms = document.getElementsByClassName('needs-validation')

      var failureCount = 0
      Array.prototype.filter.call(forms, function(form) {
        if (form.checkValidity() === false) {
          console.log('raiseIssue form failed validation')
          failureCount++
        }
        form.classList.add('was-validated')
      })

      // do not proceed to submit form if failures have occurred
      if (failureCount)
        return

      // write post to api
      $http.post('/api/v1/raiseIssue', post)
        .then(
          function(data) {
            // success happened
            $scope.reset()
            $('#raiseIssueModal').modal('hide')

            // trigger the issue view to update (if one is present onscreen)
            $rootScope.$broadcast('refreshIssueView')
          },
          function(data) {
            console.error('raiseIssue http call failed', data)
            window.alert('Failed to submit issue; Please wait and try again.')
          }
        )
    }

    $scope.reset()
  }])

// when the modal display event is triggered, load the tags & users from
// database then attach autosuggest
$('#raiseIssueModal').on('show.bs.modal', function() {
  setupAuthorTagSuggestions(
    document.getElementById('postTags'),
    document.getElementById('postAudience')
  )
})

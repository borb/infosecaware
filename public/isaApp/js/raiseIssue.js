/**
 * raise issue controller frontend code.
 *
 * this controller is used by the raiseIssue modal to validate and submit new issues
 * to the application.
 */

infosecawareApplication
  .controller('raiseIssueController', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    $scope.master = {}

    $scope.reset = function() {
      // clear form contents by copying master over 'post'
      $scope.post = angular.copy($scope.master)
    }

    // submit the newly created issue to the api
    $scope.submit = function(post) {
      // trigger the bootstrap form validation code to give friendly help
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
          function() {
            // success happened; clear the form so it's fresh for next time
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

    // initial setup; call reset method
    $scope.reset()
  }])

// when the modal display event is triggered, load the tags & users from
// database then attach autosuggest; we can perform this outside of an angular
// controller, so async helps it setup faster
$('#raiseIssueModal').on('show.bs.modal', function() {
  setupAuthorTagSuggestions(
    document.getElementById('searchPostTags'),
    document.getElementById('searchPostAudience')
  )
})

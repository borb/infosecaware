angular.module('infosecaware', [])
  .controller('raiseIssueController', ['$scope', '$http', function($scope, $http) {
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
            // @todo refresh background view (perhaps render issue?)
            $scope.reset
            $('#raiseIssueModal').modal('hide')
          },
          function(data) {
            console.error('raiseIssue http call failed', data)
            window.alert('Failed to submit issue; Please wait and try again.')
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
  $http.get('/api/v1/getPostMetadata')
    .then(
      function(res) {
        // success
        var postTagsInstance = new AutoSuggest({
          caseSensitive: false,
          suggestions: [
            {
              trigger: '',
              values: res.data.postTags
            }
          ]
        })

        // we could do this in the controller code, but the output would only
        // ever make sense to AutoSuggest; this is short, can do it here
        res.data.userList.map(function(elem) {
          elem.insertHtml = elem.insertText = elem.email
          delete elem.email
          elem.show = elem.fullname
          delete elem.fullname
          elem.on = [elem.insertText, elem.show]
        })

        var accessListInstance = new AutoSuggest({
          caseSensitive: false,
          suggestions: [
            {
              trigger: '',
              values: res.data.userList
            }
          ]
        })

        postTagsInstance.addInputs(document.getElementById('postTags'))
        accessListInstance.addInputs(document.getElementById('postAudience'))
      },
      function() {
        // failure
        console.log('network error: autopopulated post tags will not be available')
      }
    )
})

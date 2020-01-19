/**
 * bootstrap for browser-side code.
 *
 * instantiate the angular module, and create global functions for use elsewhere.
 * all browser-side code is pre-ES2015 for wider compatibility.
 */

angular.element(function() {
  angular.bootstrap(document, ['infosecaware'])
})

// setup the application so we can reuse it without redeclaring the module elsewhere
var infosecawareApplication = angular.module('infosecaware', ['ngSanitize'])

// register a filter that allows us to retain newlines when outputting text;
// this is used heavily in the comment facility
infosecawareApplication.filter('nl2br', ['$sanitize', function($sanitize) {
  return function(input) {
    return $sanitize(
      input
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/\n/g, '<br/>')
    )
  }
}])

// shared function to setup author and tag suggestions so they can be reused
var setupAuthorTagSuggestions = function(tagElem, authorElem) {
  // autosuggestions for the post tags; pull via api call
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

        if (tagElem)
          postTagsInstance.addInputs(tagElem)

        if (authorElem)
          accessListInstance.addInputs(authorElem)
      },
      function() {
        // failure
        console.log('network error: autopopulated post tags will not be available')
      }
    )
}


angular.element(function() {
  angular.bootstrap(document, ['infosecaware'])
})

var setupAuthorTagSuggestions = function(tagElem, authorElem) {
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

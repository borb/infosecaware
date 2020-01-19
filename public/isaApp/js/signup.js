/**
 * signup form code.
 *
 * this is not an angular module; we just call bootstrap validation.
 */

// signup form validation, based on example from the bootstrap documentation
(function() {
  window.addEventListener('load', function() {
    var forms = document.getElementsByClassName('needs-validation')
    Array.prototype.filter.call(forms, function(form) {
      // prevent form post if validation fails
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
  }, false)
})()

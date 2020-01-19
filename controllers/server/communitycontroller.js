/**
 * community controller.
 *
 * no functional methods - this is used simply to render the issue board template.
 */

const index = (req, res) => {
  res.render('community', {
    authUser: req.authUser
  })
}

export default index

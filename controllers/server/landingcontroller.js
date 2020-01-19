/**
 * landing page controller. the landing page appears directly after login.
 *
 * no functional methods - this is used simply to render the issue board template.
 */

const index = (req, res) => {
  res.render('landing', {
    'authUser': req.authUser
  })
}

export default index

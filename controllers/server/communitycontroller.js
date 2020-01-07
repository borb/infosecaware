const index = (req, res, next) => {
  res.render('community', {
    authUser: req.authUser
  })
}

export default index

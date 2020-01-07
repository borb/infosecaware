const index = (req, res, next) => {
  res.render('post', {
    authUser: req.authUser
  })
}

export default index

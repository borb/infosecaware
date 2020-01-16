const index = (req, res) => {
  res.render('community', {
    authUser: req.authUser
  })
}

export default index

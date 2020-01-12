const index = (req, res, next) => {
  res.render('landing', {
    'authUser': req.authUser
  })
}

export default index

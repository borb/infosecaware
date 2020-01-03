const index = (req, res, next) => {
  res.render('landing', {
    'email': 'myemail@address.com'
  })
}

export default index

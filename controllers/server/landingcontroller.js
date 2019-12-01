module.exports.index = (req, res, next) => {
  res.render('landing', {
    'email': 'myemail@address.com'
  })
}
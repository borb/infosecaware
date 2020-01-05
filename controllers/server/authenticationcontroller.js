import mongoose from 'mongoose'
import uuid from 'uuid'

const login = (req, res) => {
  const users = mongoose.model('users')
  users.findOne({email: req.body.email}, (error, user) => {
    if (error || !user || (user.password != req.body.password)) {
      // user not found
      res.render('index', {
        errors: {
          loginFailed: true
        },
        refill: req.body
      })
      return
    }

    // @todo: password hashing please
    // @todo: have a look at express-session?
    if (!error && user.password == req.body.password) {
      // user found and passwords match
      let loginSession = new (mongoose.model('loginSessions'))()
      loginSession.sessionId = uuid.v4()
      loginSession.email = req.body.email
      loginSession.save((error) => {
        if (error) {
          res.render('index', {
            errors: {
              databaseFailure: true
            }
          })
          return
        }

        // @todo: cookie expiration please
        res.cookie('loginSession', loginSession.sessionId)
          .redirect('/landing')
        })

      }
  })
}

const logout = (req, res) => {
  const loginSessions = mongoose.model('loginSessions')
  loginSessions.findOneAndDelete({sessionId: req.cookies.loginSession})
  res.clearCookie('loginSession')
     .redirect('/')
}

const isAuthenticated = (req, res, next) => {
  if (!req.cookies.loginSession) {
    // no or empty cookie
    res.redirect('/')
    return
  }

  const loginSessions = mongoose.model('loginSessions')
  loginSessions.findOne({sessionId: req.cookies.loginSession}, (error, loginSession) => {
    if (error || !loginSession) {
      // session not found or database error; treat as not logged in
      res.clearCookie('loginSession')
         .redirect('/')
      return
    }

    const users = mongoose.model('users')
    users.findOne({
      email: loginSession.email,
      enabled: true
    }, (error, user) => {
      if (error || !user) {
        // user not found or database error; treat as not logged in
        res.clearCookie('loginSession')
           .redirect('/')
        return
      }

      // session has been found, we good; update timestamp and carry on
      loginSession.lastActivityTime = Date.now()
      loginSession.save(() => {
        // head on to next route after mongo doc has been updated
        req.authUser = user
        next()
      })
    })
  })
}

export default {
  "login": login,
  "logout": logout,
  "isAuthenticated": isAuthenticated
}

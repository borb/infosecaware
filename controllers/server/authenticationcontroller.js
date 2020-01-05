import mongoose from 'mongoose'
import uuid from 'uuid'
import bcrypt from 'bcrypt'

const login = (req, res) => {
  const users = mongoose.model('users')
  users.findOne({email: req.body.email}, (error, user) => {
    if (error || !user) {
      // user not found
      res.render('index', {
        refill: {
          email: req.body.email
        },
        errors: {
          loginFailed: true
        },
        refill: req.body
      })
      return
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, user.password)

    if (!passwordMatch) {
      // password does not match
      res.render('index', {
        refill: {
          email: req.body.email
        },
        errors: {
          loginFailed: true
        }
      })
      return
    }

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
  })
}

const signup = (req, res, next) => {
  // pre-database lookup validation (saves a db hit if form data is bad)
  let errors = {}
  if (req.body.password !== req.body.repeatPassword)
    errors.passwordMismatch = true

  if (!req.body.email)
    errors.badEmail = true

  if (!req.body.password)
    errors.badPassword = true

  if (!req.body.repeatPassword)
    errors.badRepeatPassword = true

  if (Object.keys(errors).length) {
    res.render('index', {errors: errors})
    return
  }

  const users = mongoose.model('users')
  users.findOne({email: req.body.email}, (error, user) => {
    if (error) {
      res.render('index', {
        errors: {
          databaseFailure: true
        }
      })
      return
    }

    if (user) {
      res.render('index', {
        errors: {
          accountExists: true
        }
      })
      return
    }

    // there is no existing account; create one
    let newUser = new users()
    newUser.email = req.body.email
    newUser.fullname = req.body.fullname
    newUser.administrator = false
    newUser.password = bcrypt.hashSync(req.body.password, 10)
    newUser.enabled = true
    newUser.save((error) => {
      if (error) {
        res.render('index', {
          errors: {
            databaseFailure: true
          }
        })
        return
      }

      // awesome; we treat signup as middleware, so mark what we've done in request and call next
      req.accountCreation = true
      next()
    })
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
  "signup": signup,
  "logout": logout,
  "isAuthenticated": isAuthenticated
}

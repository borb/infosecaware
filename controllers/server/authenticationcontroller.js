/**
 * authentication controller.
 *
 * login, signup and logout are used as non-api based html rendering calls, whilst
 * 'isAuthenticated' is used as middleware to ensure that the user is logged in and
 * able to access the protected resource. also injects 'authUser' object into the
 * request object so that the authenticated user credentials can be accessed.
 */

import mongoose from 'mongoose'
import uuid from 'uuid'
import bcrypt from 'bcrypt'

/**
 * log the user in using the provided credentials.
 *
 * uses bcrypt password hashing to compare the provided password against the stored
 * hash.
 */
const login = (req, res) => {
  const users = mongoose.model('users')

  // pull the user data
  users.findOne({email: req.body.email}, (error, user) => {
    if (error || !user) {
      // user not found
      res.render('index', {
        errors: {
          loginFailed: true
        },
        refill: req.body
      })
      return
    }

    // compare password against the hash (dissects stored password to use the salt)
    const passwordMatch = bcrypt.compareSync(req.body.password, user.password)

    // check for mismatch; do not differentiate against invalid user, so we
    // do not reveal the difference between "no such user" and "incorrect password"
    if (!passwordMatch) {
      // password does not match
      res.render('index', {
        errors: {
          loginFailed: true
        },
        refill: req.body
      })
      return
    }

    // user found and passwords match; create a session in loginSessions collection
    let loginSession = new (mongoose.model('loginSessions'))()
    loginSession.sessionId = uuid.v4()
    loginSession.email = req.body.email
    loginSession.save((error) => {
      if (error) {
        res.render('index', {
          errors: {
            databaseFailure: true
          },
          refill: req.body
        })
        return
      }

      // set a cookie in the browser to authorise future calls
      res.cookie('loginSession', loginSession.sessionId)
        .redirect('/landing')
    })
  })
}

/**
 * sign up for a new account
 */
const signup = (req, res, next) => {
  // pre-database lookup validation (saves a db hit if form data is bad)
  // we do this in addition to browser-side validation so as to prevent
  // illegitimate api calls creating poorly constructed accounts
  let errors = {}
  if (req.body.password !== req.body.repeatPassword)
    errors.passwordMismatch = true

  if (!req.body.email)
    errors.badEmail = true

  if (!req.body.fullname)
    errors.badFullname = true

  if (!req.body.password)
    errors.badPassword = true

  if (!req.body.repeatPassword)
    errors.badRepeatPassword = true

  // extract object keys as an array to check for error presence
  if (Object.keys(errors).length) {
    res.render('index', {
      errors: {
        account: errors
      },
      refill: req.body
    })
    return
  }

  // check if the user already exists and fail if it does
  const users = mongoose.model('users')
  users.findOne({email: req.body.email}, (error, user) => {
    if (error) {
      res.render('index', {
        errors: {
          databaseFailure: true
        },
        refill: req.body
      })
      return
    }

    if (user) {
      res.render('index', {
        errors: {
          account: {
            accountExists: true
          },
          refill: req.body
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
          },
          refill: req.body
        })
        return
      }

      // awesome; we treat signup as middleware, so mark what we've done in request and call next
      req.accountCreation = true
      next()
    })
  })
}

/**
 * log out and clear the browser cookie. delete the login session.
 */
const logout = (req, res) => {
  const loginSessions = mongoose.model('loginSessions')
  loginSessions.findOneAndDelete({sessionId: req.cookies.loginSession})
  res.clearCookie('loginSession')
    .redirect('/')
}

/**
 * check session authentication by cookie.
 * THIS IS MIDDLEWARE AND SHOULD NOT BE CALLED AS A CONTROLLER!
 */
const isAuthenticated = (req, res, next) => {
  if (!req.cookies.loginSession) {
    // no or empty cookie
    res.redirect('/')
    return
  }

  // pull the session
  const loginSessions = mongoose.model('loginSessions')
  loginSessions.findOne({sessionId: req.cookies.loginSession}, (error, loginSession) => {
    if (error || !loginSession) {
      // session not found or database error; treat as not logged in
      res.clearCookie('loginSession')
        .redirect('/')
      return
    }

    // pull the user data for the authorised session
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
        // head on to next route after loginSession document has been updated
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

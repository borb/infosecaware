import express from 'express'

import indexpagecontroller from './server/indexpagecontroller.js'
import landingcontroller from './server/landingcontroller.js'
import communitycontroller from './server/communitycontroller.js'
import authenticationcontroller from './server/authenticationcontroller.js'

import raiseissuecontroller from './api/raiseissuecontroller.js'

const router = express.Router()

// @todo create a favicon and specify in link meta
// this mutes exceptions being displayed until we have completed that
router.get('/favicon.ico', (req, res) => {
  res.sendStatus(404)
})

// index page; it's unauthenticated, so a user can log in
router.get('/', indexpagecontroller)

// login and logout; logout requires an authenticated session
router
  .post('/login', authenticationcontroller.login)
  .post('/signup', authenticationcontroller.signup, authenticationcontroller.login)
  .get('/logout', authenticationcontroller.isAuthenticated, authenticationcontroller.logout)

// the landing page is hidden behind an authenticated session
router
  .get('/landing', authenticationcontroller.isAuthenticated, landingcontroller)
  .post('/landing', authenticationcontroller.isAuthenticated, landingcontroller)

// community view; requires authentication
router.get('/community', authenticationcontroller.isAuthenticated, communitycontroller)

// api calls (nested router so we don't have to keep writing full path)
const apiRouter = express.Router()
apiRouter
  .post('/raiseIssue', authenticationcontroller.isAuthenticated, raiseissuecontroller.post)
  .get('/getPostMetadata', authenticationcontroller.isAuthenticated, raiseissuecontroller.getPostMetadata)
  .get('/getBoardData', authenticationcontroller.isAuthenticated, raiseissuecontroller.getBoardData)

router.use('/api/v1', apiRouter)

export default router

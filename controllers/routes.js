import express from 'express'

import indexpagecontroller from './server/indexpagecontroller.js'
import landingcontroller from './server/landingcontroller.js'
import communitycontroller from './server/communitycontroller.js'
import authenticationcontroller from './server/authenticationcontroller.js'

import issuecontroller from './api/issuecontroller.js'

const router = express.Router()

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
  .post('/raiseIssue', authenticationcontroller.isAuthenticated, issuecontroller.post)
  .get('/getPostMetadata', authenticationcontroller.isAuthenticated, issuecontroller.getPostMetadata)
  .post('/getBoardData', authenticationcontroller.isAuthenticated, issuecontroller.getBoardData)
  .get('/getIssue/:issueId', authenticationcontroller.isAuthenticated, issuecontroller.getIssue)
  .post('/postComment', authenticationcontroller.isAuthenticated, issuecontroller.postComment)

router.use('/api/v1', apiRouter)

export default router

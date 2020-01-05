import express from 'express'

import indexpagecontroller from './server/indexpagecontroller.js'
import landingcontroller from './server/landingcontroller.js'
import communitycontroller from './server/communitycontroller.js'
import postcontroller from './server/postcontroller.js'
import authenticationcontroller from './server/authenticationcontroller.js'

const router = express.Router()

// index page; it's unauthenticated, so a user can log in
router.get('/', indexpagecontroller)

// login and logout; logout requires an authenticated session
router.post('/login', authenticationcontroller.login)
router.get('/logout', authenticationcontroller.isAuthenticated, authenticationcontroller.logout)

// the landing page is hidden behind an authenticated session
router
    .get('/landing', authenticationcontroller.isAuthenticated, landingcontroller)
    .post('/landing', authenticationcontroller.isAuthenticated, landingcontroller)

// community view; requires authentication
router.get('/community', authenticationcontroller.isAuthenticated, communitycontroller)

// @todo likely to be converted to an api call; post message, requires authentication
router.get('/post', authenticationcontroller.isAuthenticated, postcontroller)

export default router

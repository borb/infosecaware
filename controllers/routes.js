import express from 'express'

import indexpagecontroller from './server/indexpagecontroller.js'
import landingcontroller from './server/landingcontroller.js'
import communitycontroller from './server/communitycontroller.js'
import postcontroller from './server/postcontroller.js'
import authenticationcontroller from './server/authenticationcontroller.js'

const router = express.Router()

router.get('/', indexpagecontroller)

router.post('/login', authenticationcontroller.login)
router.get('/logout', authenticationcontroller.logout)

router
    .get('/landing', landingcontroller)
    .post('/landing', landingcontroller)

router.get('/community', communitycontroller)

router.get('/post', postcontroller)

export default router

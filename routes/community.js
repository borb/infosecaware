import express from 'express'
import communitycontroller from '../controllers/server/communitycontroller.js'

const router = express.Router()
router.get('/', communitycontroller)

export default router

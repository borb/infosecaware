import express from 'express'
import postcontroller from '../controllers/server/postcontroller.js'

const router = express.Router()

router.get('/', postcontroller)

export default router

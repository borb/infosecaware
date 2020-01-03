import express from 'express'
import indexpagecontroller from '../controllers/server/indexpagecontroller.js'

const router = express.Router()

router.get('/', indexpagecontroller)

export default router

import express from 'express'
import { updateProfileHandler, userProfileHandler } from './handler'
import { authenticateToken } from '../../middleware/auth'
const router = express.Router()

router.get('/user-profile', authenticateToken, userProfileHandler)
router.patch('/update-profile', authenticateToken, updateProfileHandler)
export default router

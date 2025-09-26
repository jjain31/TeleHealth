import express from 'express'
import passport from 'passport'
const router = express.Router()
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Success! User is in req.user
        res.json({ success: true, user: req.user })
    },
)

export default router

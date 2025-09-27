import express from 'express'
import passport from 'passport'
import { callbackHandler, failureHandler, successHandler } from './handler'
const router = express.Router()
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
)
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/oauth/google/failure',
        session: false,
    }),
    callbackHandler,
)
router.get('/google/success', successHandler)
router.get('/google/failure', failureHandler)
export default router

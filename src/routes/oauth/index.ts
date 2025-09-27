import express from 'express'
import passport from 'passport'
import { callbackHandler, failureHandler, successHandler } from './handler'

const router = express.Router()

/**
 * @swagger
 * /oauth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     description: Redirects user to Google OAuth consent screen to authenticate with their Google account
 *     tags: [OAuth Authentication]
 *     parameters:
 *       - in: query
 *         name: redirect
 *         schema:
 *           type: string
 *         description: Optional redirect URL after successful authentication
 *         example: "http://localhost:3001/dashboard"
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 *         headers:
 *           Location:
 *             description: Google OAuth authorization URL
 *             schema:
 *               type: string
 *               example: "https://accounts.google.com/oauth2/auth?client_id=..."
 *       500:
 *         description: OAuth configuration error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "OAuth configuration error"
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: "Google OAuth client not configured"
 *     security: []
 */
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
)

/**
 * @swagger
 * /oauth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Processes the OAuth callback from Google after user authentication. Creates or links user account and generates JWT tokens.
 *     tags: [OAuth Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google OAuth
 *         example: "4/0AX4XfWi..."
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error code if authentication failed
 *         example: "access_denied"
 *     responses:
 *       302:
 *         description: Redirects to frontend with authentication result
 *         headers:
 *           Location:
 *             description: Frontend URL with success/error parameters
 *             schema:
 *               type: string
 *               example: "http://localhost:3001/dashboard?auth=success&provider=google"
 *           Set-Cookie:
 *             description: HTTP-only cookies with JWT tokens (if successful)
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - "accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=900"
 *                 - "refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800"
 *       400:
 *         description: Invalid OAuth callback parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid OAuth callback"
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: "Missing authorization code"
 *       401:
 *         description: OAuth authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "OAuth authentication failed"
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: "User denied access"
 *       500:
 *         description: Internal server error during OAuth processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication server error"
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 *     security: []
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/oauth/google/failure',
        session: false,
    }),
    callbackHandler,
)

/**
 * @swagger
 * /google/success:
 *   get:
 *     summary: OAuth authentication success page
 *     description: Success endpoint for Google OAuth authentication. Typically used for debugging or as a fallback success page.
 *     tags: [OAuth Authentication]
 *     responses:
 *       200:
 *         description: OAuth authentication was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Google OAuth authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                       example: "google"
 *                     authenticated:
 *                       type: boolean
 *                       example: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-27T10:30:00.000Z"
 *                 error:
 *                   type: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security: []
 */
router.get('/google/success', successHandler)

/**
 * @swagger
 * /oauth/google/failure:
 *   get:
 *     summary: OAuth authentication failure page
 *     description: Failure endpoint for Google OAuth authentication. Handles cases where OAuth authentication fails or is cancelled by user.
 *     tags: [OAuth Authentication]
 *     parameters:
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error code describing the failure reason
 *         example: "access_denied"
 *       - in: query
 *         name: error_description
 *         schema:
 *           type: string
 *         description: Human-readable error description
 *         example: "The user denied the request"
 *     responses:
 *       200:
 *         description: OAuth authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Google OAuth authentication failed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                       example: "google"
 *                     error:
 *                       type: string
 *                       example: "access_denied"
 *                     description:
 *                       type: string
 *                       example: "User cancelled the authentication process"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-27T10:30:00.000Z"
 *                 error:
 *                   type: string
 *                   example: "OAuth authentication was cancelled or failed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security: []
 */
router.get('/google/failure', failureHandler)

export default router

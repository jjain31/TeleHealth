import logger from '../../config/logger'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import { error, success } from '../../utils/response'
import { Request, Response } from 'express'
export const callbackHandler = (req: Request, res: Response) => {
    try {
        const user = req.user as any
        const tokenpayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        }
        const accesstoken = generateAccessToken(tokenpayload)
        const refreshtoken = generateRefreshToken(tokenpayload)
        logger.info('OAuth login successful', { userId: user.id, email: user.email })
        return success(
            res,
            'Authentication successful',
            {
                accesstoken,
                refreshtoken,
                user: { id: user.id, email: user.email, role: user.role },
            },
            200,
        )
    } catch (err: any) {
        logger.error('OAuth login failed', { details: err.message })
        return error(res, 'Authentication failed', { details: err.message }, 401)
    }
}
export const successHandler = (req: Request, res: Response) => {
    return success(res, 'OAuth login successful', { user: req.user }, 200)
}
export const failureHandler = (req: Request, res: Response) => {
    return error(res, 'OAuth login failed', null, 401)
}

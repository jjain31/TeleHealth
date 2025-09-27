import logger from '../../config/logger'
import { Request, Response } from 'express'
import { success, errors } from '../../utils/response'
import { UserService } from '../../services/user/userService'
import { updateProfileSchema } from './validation'
export const userProfileHandler = async (req: Request, res: Response) => {
    try {
        const userToken = req.jwtUser
        const user = await UserService.getUserById(userToken!.userId)
        console.log(user)
        return success(res, 'User profile fetched successfully', { user }, 200)
    } catch (error: any) {
        if (error.message === 'User not found') {
            return error(res, 'User not found', null, 404)
        }
        logger.error('Error in userProfileHandler:', error)
        return errors(res, 'Internal server error', error.message, 500)
    }
}
export const updateProfileHandler = async (req: Request, res: Response) => {
    try {
        const validateUser = updateProfileSchema.safeParse(req.body)
        if (!validateUser.success) {
            const error = validateUser.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))
            logger.error('Validation errors in updateProfileHandler:', error)
            return errors(res, 'Validation failed', error, 400)
        }
        const data = validateUser.data
        if (data.email) {
            const user = await UserService.getUserByEmail(data.email)
            if (user) return errors(res, 'Email already in use', null, 400)
        }
        const userToken = req.jwtUser
        console.log(userToken)
        const user = await UserService.updateUserProfile(userToken!.userId, data)
        return success(res, 'User profile updated successfully', { user }, 200)
    } catch (error: any) {
        logger.error('Error in updateProfileHandler:', error)
        return errors(res, 'Internal server error', error.message, 500)
    }
}

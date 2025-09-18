import { Response } from 'express'

export const success = (res: Response, message = 'Success', data?: any, status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data,
        error: null,
    })
}

export const error = (res: Response, message = 'Error', error?: any, status = 500) => {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error,
    })
}

module.exports = { success, error }

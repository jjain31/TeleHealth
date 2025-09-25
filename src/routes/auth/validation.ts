import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        ),

    name: z.string().min(1, 'Name is required').trim(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export const loginSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginSchema>
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

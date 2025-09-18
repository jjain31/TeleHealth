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

    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional().default('PATIENT'),
})

export type RegisterInput = z.infer<typeof registerSchema>

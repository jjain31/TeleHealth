import z from 'zod'

export const updateProfileSchema = z.object({
    email: z.string().email().max(100).optional(),
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().max(255).optional(),
})
export type UpdateProfileData = z.infer<typeof updateProfileSchema>

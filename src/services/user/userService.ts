import prisma from '../../config/prisma'
import bcrypt from 'bcryptjs'
import logger from '../../config/logger'

export interface CreateUserData {
    email: string
    password: string
    name: string
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}

export interface UserResponse {
    id: number
    email: string
    name: string
    role: string
    createdAt: Date
}

export class UserService {
    static async createUser(userData: CreateUserData): Promise<UserResponse> {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email.toLowerCase() },
            })

            if (existingUser) {
                throw new Error('User with this email already exists')
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 12)

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: userData.email.toLowerCase(),
                    password: hashedPassword,
                    name: userData.name.trim(),
                    role: userData.role,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
            })

            logger.info('User created successfully', {
                userId: user.id,
                email: user.email,
                role: user.role,
            })

            return user
        } catch (error: any) {
            logger.error('Error creating user:', error)
            throw error
        }
    }

    static async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })
    }
}

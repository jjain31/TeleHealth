import prisma from '../../config/prisma'
import bcrypt from 'bcryptjs'
import logger from '../../config/logger'
import { error } from '../../utils/response'

export interface CreateUserData {
    email: string
    password: string
    name: string
}

export interface UserResponse {
    id: number
    email: string
    name: string
    createdAt: Date
    role: string
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
                    name: userData.name.trim().toLowerCase(),
                    role: 'PATIENT', // Default role is PATIENT
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
                role: 'PATIENT',
            })

            return user
        } catch (error: any) {
            logger.error('Error creating user:', error)
            throw error
        }
    }
    static async getUserByEmailAndPassword(
        email: string,
        password: string,
    ): Promise<UserResponse> {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    role: true,
                    password: true,
                },
            })
            if (!user) {
                throw new Error('User not found')
            }
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                throw new Error('Invalid password')
            }
            return user
        } catch (err: any) {
            logger.error('Error fetching user by email:', err)
            throw err
        }
    }
}

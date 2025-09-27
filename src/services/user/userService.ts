import prisma from '../../config/prisma'
import bcrypt from 'bcryptjs'
import logger from '../../config/logger'

export interface CreateUserData {
    email: string
    password: string
    name: string
}

export interface UserResponse {
    id: number
    email: string
    name: string
    role: string
}
export interface UserDetails {
    id: number
    email: string
    name: string
    googleId?: string
    avatar?: string
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
                    role: true,
                    password: true,
                },
            })
            if (!user) {
                throw new Error('User not found')
            }
            if (!user.password) {
                throw new Error(
                    'User password not set. You may have logged in through OAuth.',
                )
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
    static async getUserById(id: number): Promise<UserDetails> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    googleId: true,
                    avatar: true,
                },
            })
            if (!user) {
                throw new Error('User not found')
            }
            return {
                ...user,
                googleId: user.googleId ?? undefined,
                avatar: user.avatar ?? undefined,
            }
        } catch (error: any) {
            logger.error('Error fetching user by ID:', error)
            throw error
        }
    }
    static async getUserByEmail(email: string): Promise<string | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                },
            })
            return user ? user.id.toString() : null
        } catch (error: any) {
            logger.error('Error fetching user by email:', error)
            throw error
        }
    }
    static async updateUserProfile(
        userId: number,
        data: Partial<UserDetails>,
    ): Promise<UserDetails> {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    googleId: true,
                    avatar: true,
                },
            })
            return {
                ...user,
                googleId: user.googleId ?? undefined,
                avatar: user.avatar ?? undefined,
            }
        } catch (error: any) {
            logger.error('Error updating user profile:', error)
            throw error
        }
    }
}

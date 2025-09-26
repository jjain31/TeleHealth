import passport, { Profile } from 'passport'
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20'
import prisma from './prisma'

export default function configurePassport() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
            },
            async (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done: VerifyCallback,
            ) => {
                try {
                    let user = await prisma.user.findUnique({
                        where: { googleId: profile.id },
                    })

                    if (!user) {
                        const email = profile.emails?.[0].value
                        if (!email) {
                            return done(
                                new Error('No email found in Google profile'),
                                undefined,
                            )
                        }
                        user = await prisma.user.create({
                            data: {
                                googleId: profile.id,
                                email: email,
                                name: profile.displayName || 'No Name',
                                avatar: profile.photos?.[0].value,
                            },
                        })
                    }

                    return done(null, user)
                } catch (error) {
                    return done(error as Error, undefined)
                }
            },
        ),
    )
}

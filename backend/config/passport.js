import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleUser = {
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value,
                    name: profile.displayName,
                };

                return done(null, googleUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.use(
    "google-link",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_LINK_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleUser = {
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value,
                    name: profile.displayName,
                };

                return done(null, googleUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

export default passport;
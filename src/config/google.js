const passport = require("passport");
const User = require("../user/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("user profile is: ", profile);
    }
  )
);

const UserService = require("../user/user.service");

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const id = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePhoto = profile.photos[0].value;
      const source = "google";

      const getUserByEmail =
  (User) =>
  async ({ email }) => {
    return await User.findOne({
      email,
    });
  };

      const currentUser = getUserByEmail({
        email,
      })

      if (!currentUser) {
        const newUser = await UserService.addGoogleUser({
          id,
          email,
          firstName,
          lastName,
          profilePhoto,
        });
        return done(null, newUser);
      }

      if (currentUser.source != "google") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }

      currentUser.lastVisited = new Date();
      return done(null, currentUser);
    }
  )
);

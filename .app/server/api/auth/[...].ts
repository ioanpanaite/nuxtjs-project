import { NuxtAuthHandler } from "#auth";
import bcrypt from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { LoginType, Status } from "~/lib/constant";
import CoreUsersModel from "~/server/models/CoreUsers.model";

interface Credentials {
  email: string;
  password: string;
}

export default NuxtAuthHandler({
  // secret needed to run nuxt-auth in production mode (used to encrypt data)
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 Day
  },
  providers: [
    // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
    CredentialsProvider.default({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      async authorize(credentials: any) {
        try {
          const { email, password } = credentials as Credentials

          // Get admin collection
          const admin = await CoreUsersModel.findOne({ email: email });

          if (!admin) {
            throw new Error('No admin found!');
          } else if (admin.loginType !== LoginType.CREDENTIAL) {
            throw new Error('Could not log you in!');
          } else if (admin.status !== Status.ACTIVE) {
            throw new Error('Admin account is not available!');
          }

          const isValid = await bcrypt.compare(password, admin.password)
          if (!isValid) {
            throw new Error('Could not log you in!');
          }

          return {
            id: admin._id.toString(),
            name: admin.username,
            email: email
          };

        } catch (error) {
          console.log(error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account?.provider === "google") {
        try {
          const email = profile?.email
          const coreUser = await CoreUsersModel.findOne({ email: email })
          if (!coreUser) {
            await CoreUsersModel.create({
              email: email,
              status: Status.PENDING,
              fullname: `${profile?.family_name} ${profile?.given_name}`,
              username: profile?.given_name,
              twofactorEnabled: false,
              picture: profile?.image,
              loginType: account?.provider
            })
            return false
          }

          if (coreUser.loginType === LoginType.CREDENTIAL) return false

          // User should wait admin approv
          return coreUser?.status === Status.ACTIVE ? true : false;
        } catch (err) {
          console.log("Google Signin Debug: ", err)
          return false
        }
      }

      return true
    },
  },
})

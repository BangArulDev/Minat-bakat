import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Cari user berdasarkan email ATAU username dari database Prisma
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.username },
              { username: credentials.username }
            ],
            // Jika userType (role) dikirim, maka cocokkan. Jika tidak, abaikan.
            ...(credentials.userType && { role: credentials.userType.toUpperCase() })
          },
          include: {
            teacherProfile: true,
            studentProfile: true
          }
        });

        if (!user) return null;

        // Cek password hash dengan bcrypt
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) return null;

        // Tentukan nama lengkap berdasarkan role
        const fullName = user.teacherProfile?.fullName 
                      || user.studentProfile?.fullName 
                      || "Pengguna";

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: fullName,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama kali, 'user' tersedia
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Masukkan properti token ke dalam session agar bisa diakses di klien
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});

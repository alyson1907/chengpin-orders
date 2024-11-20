import { User, Role, UserRoles } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const secret = process.env.JWT_SECRET || 'default-secret-chengpin'
export type TokenContent = Partial<User> & { roles: Partial<Role>[] } & { userRoles?: UserRoles[] }

const createToken = (user: TokenContent) => {
  delete user.userRoles
  delete user.password
  const now = Math.floor(Date.now() / 1000)
  return jwt.sign({ user, iat: now }, secret)
}

const validateToken = (token: string) => {
  const decoded = jwt.verify(token, secret) as TokenContent
  return decoded
}

const validatePassword = (user: User, receivedPassword: string) => {
  const expectedPassword = user.password
  return bcrypt.compareSync(receivedPassword, expectedPassword)
}

const jwtModule = {
  createToken,
  validateToken,
  validatePassword,
}

export default jwtModule

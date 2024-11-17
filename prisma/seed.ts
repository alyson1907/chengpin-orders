import { Role, User } from '@prisma/client'
import prisma from './prisma'
import * as bcrypt from 'bcrypt'

const saltRounds = 8

const seedRoles = () => {
  const adminRole = {
    role: 'ADMIN',
  }
  return prisma.role.upsert({ where: { role: 'ADMIN' }, update: adminRole, create: adminRole })
}

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    console.error('No initial ADMIN_USERNAME or ADMIN_PASSWORD set on environment variables')
    process.exit(1)
  }

  const adminInfo = { username, password: bcrypt.hashSync(password, saltRounds) }
  return prisma.user.upsert({
    where: { username: adminInfo.username },
    update: adminInfo,
    create: adminInfo,
  })
}

const seedAdminRole = (role: Role, admin: User) => {
  const userRole = {
    role: { connect: { id: role.id } },
    user: { connect: { id: admin.id } },
  }
  return prisma.userRoles.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: role.id } },
    update: userRole,
    create: userRole,
  })
}

const seed = async () => {
  const role = await seedRoles()
  const admin = await seedAdmin()
  return seedAdminRole(role, admin)
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

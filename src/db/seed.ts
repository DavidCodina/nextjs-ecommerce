// ❌ import { PrismaClient } from '@prisma/client'
// ❌ import { PrismaClient } from '@/generated/prisma'
import { prisma } from '@/db/prisma'
import sampleData from './sample-data'
import { hash } from '@/lib/encrypt'

/* ========================================================================

======================================================================== */
// To run this script do: npx tsx ./src/db/seed

async function main() {
  // ❌ const prisma = new PrismaClient()
  await prisma.product.deleteMany() // ⚠️ Destructive!
  await prisma.account.deleteMany()
  // ⚠️ The Session model is not needed since our Credentials is using a JWT strategy.
  // await prisma.session.deleteMany()

  // ⚠️ model VerificationToken has been removed for the moment.
  // await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  await prisma.product.createMany({ data: sampleData.products })

  const users = []

  for (let i = 0; i < sampleData.users.length; i++) {
    users.push({
      ...sampleData.users[i],
      password: await hash(sampleData.users[i].password)
    })
    // console.log(
    //   sampleData.users[i].password,
    //   await hash(sampleData.users[i].password)
    // );
  }

  await prisma.user.createMany({ data: users })

  const createdUsers = await prisma.user.findMany()
  const firstUser = createdUsers[0]
  const firstUserRole = firstUser.role

  console.log('Database seeded successfully!', {
    firstUserRole,
    type: typeof firstUserRole
  })
}

main()

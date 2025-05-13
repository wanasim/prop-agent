import { db } from "../src/server/db";

async function main() {
  let user = await db.user.findFirst();
  if (!user) {
    user = await db.user.create({
      data: {
        id: "cmal8jhcz0000c9bdbh3v6emy",
        name: "Test User",
        email: "test@test.com",
      },
    });
  }
  const id = user.id;

  await db.property.createMany({
    data: [
      {
        name: "Test Property 1",
        ownerId: id,
      },
      {
        name: "Test Property 2",
        ownerId: id,
      },
      {
        name: "Test Property 3",
        ownerId: id,
      },
      {
        name: "Test Property 4",
        ownerId: id,
      },
      {
        name: "Test Property 5",
        ownerId: id,
      },
      {
        name: "Test Property 6",
        ownerId: id,
      },
      {
        name: "Test Property 7",
        ownerId: id,
      },
      {
        name: "Test Property 8",
        ownerId: id,
      },
      {
        name: "Test Property 9",
        ownerId: id,
      },
      {
        name: "Test Property 10",
        ownerId: id,
      },
      {
        name: "Test Property 11",
        ownerId: id,
      },
      {
        name: "Test Property 12",
        ownerId: id,
      },
      {
        name: "Test Property 13",
        ownerId: id,
      },
      {
        name: "Test Property 14",
        ownerId: id,
      },
      {
        name: "Test Property 15",
        ownerId: id,
      },
      {
        name: "Test Property 16",
        ownerId: id,
      },
      {
        name: "Test Property 17",
        ownerId: id,
      },
    ],
  });

  const tenantData = [
    { name: "Test User 1", email: "test1@test.com" },
    { name: "Test User 2", email: "test2@test.com" },
    { name: "Test User 3", email: "test3@test.com" },
    { name: "Test User 4", email: "test4@test.com" },
    { name: "Test User 5", email: "test5@test.com" },
    { name: "Test User 6", email: "test6@test.com" },
    { name: "Test User 7", email: "test7@test.com" },
    { name: "Test User 8", email: "test8@test.com" },
    { name: "Test User 9", email: "test9@test.com" },
    { name: "Test User 10", email: "test10@test.com" },
  ];

  // Create users one by one to handle duplicates
  const createdTenants = [];
  for (const data of tenantData) {
    try {
      const user = await db.user.create({
        data: {
          ...data,
          userType: "TENANT",
        },
      });
      createdTenants.push(user);
    } catch (error) {
      console.log("RUNNING ERROR LOGIC  ");
      // If user already exists, find and add them
      const existingUser = await db.user.findFirst({
        where: { email: data.email },
      });
      console.log("EXISTING USER ", existingUser);
      if (existingUser) {
        createdTenants.push(existingUser);
      }
    }
  }

  console.log(`Found ${createdTenants.length} tenants to connect`);

  // Only proceed if we have tenants to connect
  if (createdTenants.length > 0) {
    const property = await db.property.findFirst();
    await db.property.update({
      where: { id: property?.id },
      data: {
        tenants: {
          connect: createdTenants.map((tenant) => ({
            id: tenant.id,
          })),
        },
      },
    });
  } else {
    console.log("No tenants were created or found to connect to the property");
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

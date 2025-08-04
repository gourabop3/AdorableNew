"use server";

import { getUser } from "@/auth/stack-auth";
import { connectToDatabase, db } from "@/lib/mongodb";

export async function getUserApps() {
  const user = await getUser();
  await connectToDatabase();

  const userApps = await db.appUsers.findMany({ userId: user.userId });

  return userApps.map(appUser => ({
    id: appUser.appId._id.toString(),
    name: appUser.appId.name,
    description: appUser.appId.description,
    gitRepo: appUser.appId.gitRepo,
    createdAt: appUser.appId.createdAt,
    permissions: appUser.permissions,
  }));
}

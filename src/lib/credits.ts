import { connectToDatabase, db } from '@/lib/mongodb';

export async function getUserCredits(userId: string): Promise<number> {
  await connectToDatabase();
  
  const user = await db.users.findById(userId);
  return user?.credits || 0;
}

export async function deductCredits(userId: string, amount: number, description: string): Promise<number> {
  await connectToDatabase();
  
  const user = await db.users.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  const newCredits = user.credits - amount;
  
  await db.users.update(userId, { credits: newCredits });
  
  // Record the transaction
  await db.creditTransactions.create({
    userId,
    amount: -amount,
    description,
    type: 'usage',
  });

  return newCredits;
}

export async function addCredits(userId: string, amount: number, description: string): Promise<number> {
  await connectToDatabase();
  
  const user = await db.users.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newCredits = user.credits + amount;
  
  await db.users.update(userId, { credits: newCredits });
  
  // Record the transaction
  await db.creditTransactions.create({
    userId,
    amount,
    description,
    type: 'bonus',
  });

  return newCredits;
}

export async function checkCredits(userId: string, required: number): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits >= required;
}
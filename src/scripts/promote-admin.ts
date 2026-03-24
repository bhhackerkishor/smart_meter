import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { User } from '../lib/db/models/User';

dotenv.config({ path: '.env.local' });

async function promoteAdmin(email: string) {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Success: ${email} is now an ADMIN.`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Promotion Error:', error);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx ts-node src/scripts/promote-admin.ts <email>');
  process.exit(1);
}

promoteAdmin(email);

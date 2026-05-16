import { AppDataSource } from './data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding database...');

  const userRepo = AppDataSource.getRepository('User');

  // Super admin
  const existing = await userRepo.findOne({ where: { email: 'admin@voipplatform.com' } });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@123456', 12);
    await userRepo.save({
      email: 'admin@voipplatform.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: hash,
      role: 'super_admin',
      status: 'active',
      isEmailVerified: true,
      walletBalance: 100,
    });
    console.log('✅ Super admin created: admin@voipplatform.com / Admin@123456');
  }

  // Demo user
  const demo = await userRepo.findOne({ where: { email: 'demo@voipplatform.com' } });
  if (!demo) {
    const hash = await bcrypt.hash('Demo@123456', 12);
    await userRepo.save({
      email: 'demo@voipplatform.com',
      firstName: 'Demo',
      lastName: 'User',
      passwordHash: hash,
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      walletBalance: 25,
    });
    console.log('✅ Demo user created: demo@voipplatform.com / Demo@123456');
  }

  await AppDataSource.destroy();
  console.log('🎉 Seeding complete!');
}

seed().catch(console.error);

/**
 * EduManage — Database Seed Script
 * Creates the default admin account
 *
 * Run with: npm run seed
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'edumanage',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  const userRepo = AppDataSource.getRepository('users');

  const existing = await userRepo.findOne({ where: { email: 'admin@edumanage.edu' } });
  if (existing) {
    console.log('ℹ️  Admin user already exists — skipping seed');
    await AppDataSource.destroy();
    return;
  }

  const hashed = await bcrypt.hash('admin123', 10);
  await userRepo.save({
    name: 'Alex Johnson',
    email: 'admin@edumanage.edu',
    password: hashed,
    role: 'admin',
  });

  console.log('✅ Admin user created:');
  console.log('   Email:    admin@edumanage.edu');
  console.log('   Password: admin123');
  console.log('   Role:     admin');

  await AppDataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

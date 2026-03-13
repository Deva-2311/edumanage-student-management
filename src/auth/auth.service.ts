import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Register a new user (admin or student)
  async register(name: string, email: string, password: string, role: UserRole, studentId?: number) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      name,
      email,
      password: hashed,
      role,
      studentId: studentId ?? null,
    });
    await this.userRepo.save(user);
    return { message: 'User registered successfully' };
  }

  // Login and return JWT token
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role, studentId: user.studentId };
    const token = this.jwtService.sign(payload);

    return { token, role: user.role, name: user.name, studentId: user.studentId };
  }

  // Find user by ID
  async findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  // Get all users
  async findAll() {
    return this.userRepo.find({ select: ['id', 'name', 'email', 'role', 'studentId', 'created_at'] });
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  // Delete a user by ID (admin only)
  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
  }

  // Update user details
  async updateUser(id: number, updates: Partial<Pick<User, 'name' | 'role'>>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updates);
    return this.userRepo.save(user);
  }

  // Reset a user's password by email (no auth token required — used from login page)
  async resetPassword(email: string, newPassword: string, role: UserRole) {
    const user = await this.userRepo.findOne({ where: { email, role } });
    if (!user) throw new NotFoundException('No account found with that email for this portal');
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.userRepo.save(user);
    return { message: 'Password reset successfully' };
  }
}
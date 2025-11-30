import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ){}
  
  async validateUser(email: string, pass: string): Promise<any> {
    const user =  await this.prisma.user.findUnique({ where: { email }});
    if (user && await bcrypt.compare(pass, user.password)){
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }

  async register(email: string, pass: string, name: string, username: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        username: username,
      },
    });
    const {password, ...result} = user;
    return result;
  }
}
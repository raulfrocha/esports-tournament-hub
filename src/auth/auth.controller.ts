import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário (PLAYER padrão)' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  async register(@Body() body: { email: string; password: string; name: string; username: string }) {
    const user = await this.authService.register(body.email, body.password, body.name, body.username);
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Autentica o usuário e retorna o token JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido, retorna access_token.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }
}
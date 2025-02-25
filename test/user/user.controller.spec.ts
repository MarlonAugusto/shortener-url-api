import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../src/auth/auth.guard';
import { AuthInterceptor } from '../../src/auth/auth.interceptor';
import { Request } from 'express';
import { UserEntity } from 'src/user/models/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AuthInterceptor)
      .useValue({ intercept: () => { } })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  const mockUserEntity: UserEntity = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    active: true,
    urls: [],
  };

  describe('userInfo', () => {
    it('deve retornar as informações do usuário quando o token JWT é válido e o usuário existe', async () => {
      const cookie = 'valid-jwt-token';
      const userId = 1;
      const user = { id: userId, name: 'Test User', email: 'test@example.com' };

      const req = {
        cookies: { jwt: cookie },
      } as Request;


      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: userId });


      jest.spyOn(userService, 'getById').mockResolvedValue(mockUserEntity);

      const result = await controller.userInfo(req);

      expect(result).toEqual({ id: user.id, name: user.name, email: user.email });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(cookie);
      expect(userService.getById).toHaveBeenCalledWith(userId);
    });

    it('deve retornar null quando o usuário não é encontrado', async () => {
      const cookie = 'valid-jwt-token';
      const userId = 1;

      const req = {
        cookies: { jwt: cookie },
      } as Request;


      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: userId });


      jest.spyOn(userService, 'getById').mockResolvedValue(null);

      const result = await controller.userInfo(req);

      expect(result).toBeNull();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(cookie);
      expect(userService.getById).toHaveBeenCalledWith(userId);
    });
  });
});
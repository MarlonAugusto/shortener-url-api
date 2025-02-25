import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../src/user/models/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  describe('getByEmail', () => {
    it('deve retornar um usuário quando o e-mail é válido e existe no banco de dados', async () => {
      const userEmail = 'test@example.com';
      const user = { id: 1, email: userEmail, name: 'Test User' };


      userRepository.findOneBy = jest.fn().mockResolvedValue(user);

      const result = await service.getByEmail(userEmail);

      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
    });

    it('deve lançar BadRequestException quando o e-mail não é fornecido', async () => {
      const userEmail = '';

      await expect(service.getByEmail(userEmail)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getById', () => {
    it('deve retornar um usuário quando o ID é válido e existe no banco de dados', async () => {
      const userId = '1';
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };


      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.getById(userId);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: Number(userId) } });
    });

    it('deve retornar null quando o ID não é fornecido', async () => {
      const userId = '';

      const result = await service.getById(userId);

      expect(result).toBeNull();
    });

  });
});
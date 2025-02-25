import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEntity } from '../../src/shortener/models/url.entity';
import { UserEntity } from '../../src/user/models/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShortenUrlDTO } from '../../src/shortener/dto/shortenUrl.dto';
import { ShortenerService } from 'src/shortener/shortener.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let urlRepository: Repository<UrlEntity>;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: getRepositoryToken(UrlEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    urlRepository = module.get<Repository<UrlEntity>>(getRepositoryToken(UrlEntity));
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  describe('shortenUrl', () => {
    it('deve encurtar uma URL com sucesso quando a URL original é fornecida', async () => {
      const shortenUrlDTO: ShortenUrlDTO = {
        originalUrl: 'https://example.com',
      };
      const shortUrl = '7ACB70';
      const newUrl = {
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl,
        user: undefined,
      };

      urlRepository.create = jest.fn().mockReturnValue(newUrl);
      urlRepository.save = jest.fn().mockResolvedValue(newUrl);

      const result = await service.shortenUrl(shortenUrlDTO);

      expect(result).toEqual({
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: `http://localhost:${process.env.API_PORT}/${shortUrl}`,
        user: 'Not authenticated',
      });

      expect(urlRepository.create).toHaveBeenCalledWith({
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: expect.any(String),
        user: undefined,
      });

      expect(urlRepository.save).toHaveBeenCalledWith(newUrl);
    });

    it('deve lançar BadRequestException se a URL original não for fornecida', async () => {
      const shortenUrlDTO: ShortenUrlDTO = {
        originalUrl: '',
      };

      await expect(service.shortenUrl(shortenUrlDTO)).rejects.toThrow(BadRequestException);
    });

    it('deve associar a URL encurtada a um usuário, se o userId for fornecido', async () => {
      const shortenUrlDTO: ShortenUrlDTO = {
        originalUrl: 'https://example.com',
        userId: 1,
      };
      const shortUrl = 'ABC123';
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      const newUrl = {
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl,
        user,
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      urlRepository.create = jest.fn().mockReturnValue(newUrl);
      urlRepository.save = jest.fn().mockResolvedValue(newUrl);

      const result = await service.shortenUrl(shortenUrlDTO);

      expect(result).toEqual({
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: `http://localhost:${process.env.API_PORT}/${shortUrl}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: shortenUrlDTO.userId });
      expect(urlRepository.create).toHaveBeenCalledWith({
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: expect.any(String),
        user,
      });
      expect(urlRepository.save).toHaveBeenCalledWith(newUrl);
    });
  });

  describe('getOriginalUrlAndIncrementClicks', () => {
    it('deve retornar a URL original e incrementar o número de cliques', async () => {
      const shortUrl = 'ABC123';
      const urlEntity = {
        originalUrl: 'https://example.com',
        shortUrl,
        clicks: 0,
        active: true,
      };

      urlRepository.findOne = jest.fn().mockResolvedValue(urlEntity);
      urlRepository.save = jest.fn().mockResolvedValue(urlEntity);

      const result = await service.getOriginalUrlAndIncrementClicks(shortUrl);

      expect(result).toEqual(urlEntity);
      expect(urlRepository.findOne).toHaveBeenCalledWith({ where: { shortUrl, active: true } });
      expect(urlRepository.save).toHaveBeenCalledWith({ ...urlEntity, clicks: 1 });
    });

    it('deve retornar null se a URL encurtada não for encontrada ou estiver inativa', async () => {
      const shortUrl = 'ABC123';

      urlRepository.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.getOriginalUrlAndIncrementClicks(shortUrl);

      expect(result).toBeNull();
      expect(urlRepository.findOne).toHaveBeenCalledWith({ where: { shortUrl, active: true } });
    });
  });

  describe('getUserUrls', () => {
    it('deve retornar as URLs encurtadas de um usuário', async () => {
      const userId = 1;
      const urls = [
        {
          id: 1,
          originalUrl: 'https://example.com',
          shortUrl: 'ABC123',
          clicks: 0,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      urlRepository.find = jest.fn().mockResolvedValue(urls);

      const result = await service.getUserUrls(userId);

      expect(result).toEqual([
        {
          id: urls[0].id,
          originalUrl: urls[0].originalUrl,
          shortUrl: `http://localhost:${process.env.API_PORT}/${urls[0].shortUrl}`,
          clicks: urls[0].clicks,
          createdAt: urls[0].createdAt,
          modifiedAt: urls[0].modifiedAt,
        },
      ]);
      expect(urlRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId }, active: true },
        select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt'],
      });
    });

    it('deve retornar uma mensagem se o usuário não tiver URLs encurtadas', async () => {
      const userId = 1;

      urlRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.getUserUrls(userId);

      expect(result).toBe("User doesn't have shortened URLs");
      expect(urlRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId }, active: true },
        select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt'],
      });
    });
  });

  describe('deleteUrl', () => {
    it('deve marcar uma URL como inativa', async () => {
      const userId = 1;
      const urlId = 1;
      const url = {
        id: urlId,
        originalUrl: 'https://example.com',
        shortUrl: 'ABC123',
        active: true,
        modifiedAt: new Date(),
      };

      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      urlRepository.save = jest.fn().mockResolvedValue(url);

      const result = await service.deleteUrl(userId, urlId);

      expect(result).toEqual({
        message: 'Shortened URL has been successfully deleted',
        shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
        originalUrl: url.originalUrl,
      });
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({
        ...url,
        active: false,
        modifiedAt: expect.any(Date),
      });
    });

    it('deve lançar BadRequestException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      const userId = 1;
      const urlId = 1;

      urlRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.deleteUrl(userId, urlId)).rejects.toThrow(BadRequestException);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
      });
    });
  });

  describe('updateUrl', () => {
    it('deve atualizar a URL original', async () => {
      const userId = 1;
      const urlId = 1;
      const newOriginalUrl = 'https://newexample.com';
      const url = {
        id: urlId,
        originalUrl: 'https://example.com',
        shortUrl: 'ABC123',
        active: true,
        modifiedAt: new Date(),
      };

      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      urlRepository.save = jest.fn().mockResolvedValue(url);

      const result = await service.updateUrl(userId, urlId, newOriginalUrl);

      expect(result).toEqual({
        message: 'Shortened URL has been successfully updated.',
        shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
        originalUrl: newOriginalUrl,
      });
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({
        ...url,
        originalUrl: newOriginalUrl,
        modifiedAt: expect.any(Date),
      });
    });

    it('deve lançar BadRequestException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      const userId = 1;
      const urlId = 1;
      const newOriginalUrl = 'https://newexample.com';

      urlRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.updateUrl(userId, urlId, newOriginalUrl)).rejects.toThrow(BadRequestException);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
      });
    });
  });

  describe('getUrlById', () => {
    it('deve retornar uma URL específica', async () => {
      const userId = 1;
      const urlId = 1;
      const url = {
        id: urlId,
        originalUrl: 'https://example.com',
        shortUrl: 'ABC123',
        clicks: 0,
        createdAt: new Date(),
        modifiedAt: new Date(),
        activated: true,
      };

      urlRepository.findOne = jest.fn().mockResolvedValue(url);

      const result = await service.getUrlById(userId, urlId);

      expect(result).toEqual({
        id: url.id,
        originalUrl: url.originalUrl,
        shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
        modifiedAt: url.modifiedAt,
      });
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
        select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt'],
      });
    });

    it('deve lançar NotFoundException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      const userId = 1;
      const urlId = 1;

      urlRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getUrlById(userId, urlId)).rejects.toThrow(NotFoundException);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, user: { id: userId }, active: true },
        select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt'],
      });
    });
  });
});
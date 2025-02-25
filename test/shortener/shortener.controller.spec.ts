import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from '../../src/shortener/shortener.controller';
import { ShortenerService } from '../../src/shortener/shortener.service';
import { AuthGuard } from '../../src/auth/auth.guard';
import { NotFoundException } from '@nestjs/common';
import { ShortenUrlDTO } from '../../src/shortener/dto/shortenUrl.dto';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let shortenerService: ShortenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        {
          provide: ShortenerService,
          useValue: {
            shortenUrl: jest.fn(),
            getUserUrls: jest.fn(),
            deleteUrl: jest.fn(),
            updateUrl: jest.fn(),
            getUrlById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ShortenerController>(ShortenerController);
    shortenerService = module.get<ShortenerService>(ShortenerService);
  });
  const reqNull = { user: null };

  describe('shortenUrl', () => {
    it('deve encurtar uma URL com sucesso quando o usuário está autenticado', async () => {
      const shortenUrlDTO: ShortenUrlDTO = {
        originalUrl: 'https://example.com',
        userId: 1
      };
      const req = { user: { id: 1 } };
      const expectedResult = { id: 1, shortUrl: 'abc123' };

      shortenerService.shortenUrl = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.shortenUrl(shortenUrlDTO, req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.shortenUrl).toHaveBeenCalledWith({ ...shortenUrlDTO, userId: 1 });
    });

    it('deve encurtar uma URL com sucesso quando o usuário não está autenticado', async () => {
      const shortenUrlDTO: ShortenUrlDTO = {
        originalUrl: 'https://example.com',
      };
      const req = { user: null };
      const expectedResult = { id: 1, shortUrl: 'abc123' };

      shortenerService.shortenUrl = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.shortenUrl(shortenUrlDTO, req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.shortenUrl).toHaveBeenCalledWith({ ...shortenUrlDTO, userId: null });
    });

  });
  describe('getUrls', () => {
    it('deve retornar as URLs do usuário quando o usuário está autenticado', async () => {
      const req = { user: { id: 1 } };
      const expectedResult = [{ id: 1, shortUrl: 'abc123' }];

      shortenerService.getUserUrls = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.getUrls(req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.getUserUrls).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se o usuário não estiver autenticado', async () => {

      await expect(controller.getUrls(reqNull)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUrl', () => {
    it('deve deletar uma URL com sucesso quando o usuário está autenticado', async () => {
      const req = { user: { id: 1 } };
      const urlId = 1;
      const expectedResult = { message: 'URL deleted' };

      shortenerService.deleteUrl = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.deleteUrl(urlId, req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.deleteUrl).toHaveBeenCalledWith(1, urlId);
    });

  });

  describe('updateUrl', () => {
    it('deve atualizar uma URL com sucesso quando o usuário está autenticado', async () => {
      const req = { user: { id: 1 } };
      const urlId = 1;
      const newOriginalUrl = 'https://newexample.com';
      const expectedResult = { id: 1, originalUrl: newOriginalUrl };

      shortenerService.updateUrl = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.updateUrl(urlId, newOriginalUrl, req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.updateUrl).toHaveBeenCalledWith(1, urlId, newOriginalUrl);
    });

  });

  describe('getUrlById', () => {
    it('deve retornar uma URL específica quando o usuário está autenticado', async () => {
      const req = { user: { id: 1 } };
      const urlId = 1;
      const expectedResult = { id: 1, shortUrl: 'abc123' };

      shortenerService.getUrlById = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.getUrlById(urlId, req);

      expect(result).toEqual(expectedResult);
      expect(shortenerService.getUrlById).toHaveBeenCalledWith(1, urlId);
    });

  });
});
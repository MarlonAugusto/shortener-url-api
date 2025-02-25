import { Test, TestingModule } from '@nestjs/testing';
import { RedirectController } from '../../src/shortener/redirect.controller';
import { ShortenerService } from '../../src/shortener/shortener.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UrlEntity } from '../../src/shortener/models/url.entity';
import { UserEntity } from 'src/user/models/user.entity';

describe('RedirectController', () => {
    let controller: RedirectController;
    let shortenerService: ShortenerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RedirectController],
            providers: [
                {
                    provide: ShortenerService,
                    useValue: {
                        getOriginalUrlAndIncrementClicks: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<RedirectController>(RedirectController);
        shortenerService = module.get<ShortenerService>(ShortenerService);
    });


    const mockUserEntity: UserEntity = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        active: true,
        urls: [],
    };

    const urlEntity: UrlEntity = {
        id: 1,
        originalUrl: 'https://example.com',
        shortUrl: 'http://localhost:8000/2D0A1',
        clicks: 0,
        user: mockUserEntity,
        createdAt: new Date(),
        modifiedAt: new Date(),
        active: true,
    };

    describe('redirectToOriginal', () => {
        it('deve redirecionar para a URL original quando a URL encurtada existe', async () => {
            const shortUrl = 'abc123';
            const originalUrl = 'https://example.com';

            jest.spyOn(shortenerService, 'getOriginalUrlAndIncrementClicks').mockResolvedValue(urlEntity);

            const res = {
                redirect: jest.fn().mockImplementation((url) => url),
            } as unknown as Response;

            const result = await controller.redirectToOriginal(shortUrl, res);

            expect(res.redirect).toHaveBeenCalledWith(originalUrl);
            expect(result).toBe(originalUrl);
            expect(shortenerService.getOriginalUrlAndIncrementClicks).toHaveBeenCalledWith(shortUrl);
        });

        it('deve lançar NotFoundException quando a URL encurtada não existe', async () => {
            const shortUrl = 'abc123';

            jest.spyOn(shortenerService, 'getOriginalUrlAndIncrementClicks').mockResolvedValue(null);

            const res = {
                redirect: jest.fn(),
            } as unknown as Response;

            await expect(controller.redirectToOriginal(shortUrl, res)).rejects.toThrow(NotFoundException);
            expect(shortenerService.getOriginalUrlAndIncrementClicks).toHaveBeenCalledWith(shortUrl);
        });
    });
});
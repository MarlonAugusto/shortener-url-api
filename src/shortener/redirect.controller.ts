import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { Response } from 'express';

@Controller()
export class RedirectController {
    constructor(private shortenerService: ShortenerService) {}

    @Get(':shortUrl')
    async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
        const urlEntity = await this.shortenerService.getOriginalUrlAndIncrementClicks(shortUrl);
        if (!urlEntity) {
            throw new NotFoundException('Shortened URL not found');
        }
        return res.redirect(urlEntity.originalUrl);
    }
}

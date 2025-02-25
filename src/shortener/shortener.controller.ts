import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Request, Res, UseGuards } from '@nestjs/common';
import { ShortenUrlDTO } from './dto/shortenUrl.dto';
import { ShortenerService } from './shortener.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('short/url')
export class ShortenerController {
    constructor(
        private shortenerService: ShortenerService
    ) { }

    @UseGuards(AuthGuard)
    @Post()
    async shortenUrl(@Body() body: ShortenUrlDTO, @Request() req) {
        const userId = req.user?.id || null;

        return this.shortenerService.shortenUrl({ ...body, userId });
    }

    @UseGuards(AuthGuard)
    @Get()
    async getUrls(@Request() req) {

        const userId = req.user?.id;
        if (!userId) {
            throw new NotFoundException('User not authenticated');
        }

        return this.shortenerService.getUserUrls(userId);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteUrl(@Param('id') id: number, @Request() req) {
        const userId = req.user.id;
        if (!userId) {
            throw new NotFoundException('User not authenticated');
        }
        return this.shortenerService.deleteUrl(userId, id);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateUrl(
        @Param('id') id: number,
        @Body('originalUrl') newOriginalUrl: string,
        @Request() req
    ) {
        const userId = req.user.id;
        if (!userId) {
            throw new NotFoundException('User not authenticated');
        }
        return this.shortenerService.updateUrl(userId, id, newOriginalUrl);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getUrlById(
        @Param('id') id: number,
        @Request() req
    ) {
        const userId = req.user.id;
        if (!userId) {
            throw new NotFoundException('User not authenticated');
        }
        return this.shortenerService.getUrlById(userId, id);
    }
}

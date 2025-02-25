import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEntity } from './models/url.entity';
import { Repository } from 'typeorm';
import { ShortenUrlDTO } from './dto/shortenUrl.dto';
import { randomUUID } from 'crypto';
import { UserEntity } from 'src/user/models/user.entity';

@Injectable()
export class ShortenerService {
    constructor(
        @InjectRepository(UrlEntity) private readonly urlRepository: Repository<UrlEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) { }

    async shortenUrl({ originalUrl, userId }: ShortenUrlDTO) {
        if (!originalUrl) throw new BadRequestException("Original URL is required");

        const generateShortId = (length: number): string => {
            return randomUUID().replace(/-/g, '').substring(0, length).toUpperCase();
        };
        const shortUrl = generateShortId(6);

        let user: UserEntity | undefined;
        let userData: { id: number; name: string; email: string } | string = "Not authenticated";

        if (userId) {
            user = await this.userRepository.findOneBy({ id: userId }) || undefined;
        }
        if (user) {
            userData = {
                id: user.id,
                name: user.name,
                email: user.email,
            };
        }
        const newUrl = this.urlRepository.create({
            originalUrl,
            shortUrl,
            user
        });

        await this.urlRepository.save(newUrl);

        return {
            originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${newUrl.shortUrl}`,
            user: userData
        };
    }

    async getOriginalUrlAndIncrementClicks(shortUrl: string) {
        const urlEntity = await this.urlRepository.findOne({ where: { shortUrl, active: true } });

        if (!urlEntity)
            return null;


        urlEntity.clicks += 1;
        await this.urlRepository.save(urlEntity);

        return urlEntity;
    }

    async getUserUrls(userId) {
        const urls = await this.urlRepository.find({
            where: { user: { id: userId }, active: true },
            select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt']
        });

        const formattedUrls = urls.map(url => ({
            id: url.id,
            originalUrl: url.originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            clicks: url.clicks,
            createdAt: url.createdAt,
            modifiedAt: url.modifiedAt
        }));

        return urls.length > 0 ? formattedUrls : `User doesn't have shortened URLs`;
    }

    async deleteUrl(userId: number, urlId: number) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
        });

        if (!url)
            throw new BadRequestException('URL not found or does not belong to the user');

        url.active = false;
        url.modifiedAt = new Date();

        await this.urlRepository.save(url);

        return {
            message: `Shortened URL has been successfully deleted`,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            originalUrl: url.originalUrl
        };
    }

    async updateUrl(userId: number, urlId: number, newOriginalUrl: string) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
        });

        if (!url)
            throw new BadRequestException('URL not found or does not belong to the user');

        url.originalUrl = newOriginalUrl;
        url.modifiedAt = new Date();

        await this.urlRepository.save(url);

        return {
            message: "Shortened URL has been successfully updated.",
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            originalUrl: url.originalUrl
        };
    }

    async getUrlById(userId: number, urlId: number) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
            select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'modifiedAt']
        });
    
        if (!url) {
            throw new NotFoundException('URL not found or does not belong to the user');
        }
    
        return {
            id: url.id,
            originalUrl: url.originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            clicks: url.clicks,
            createdAt: url.createdAt,
            modifiedAt: url.modifiedAt
        };
    }
    
}

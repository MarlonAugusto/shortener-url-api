import { Module } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';
import { UrlEntity } from './models/url.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RedirectController } from './redirect.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity, UserEntity]),
    AuthModule],
  providers: [ShortenerService],
  controllers: [ShortenerController, RedirectController],
  exports: [ShortenerService],
})
export class ShortenerModule { }

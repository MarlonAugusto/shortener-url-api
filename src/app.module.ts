import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ShortenerModule } from './shortener/shortener.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule, 
    DatabaseModule, 
    ShortenerModule, 
    UserModule],
})
export class AppModule { }

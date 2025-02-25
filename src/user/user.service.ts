import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,

    ) { }
    async getByEmail(userEmail: string) {
        if (!userEmail) throw new BadRequestException("Email field is empty");

        const user = this.userRepository.findOneBy({ email: userEmail });

        if (!user) throw new NotFoundException("Email does not exist");
        return user;
    }

    async getById(userId: string) {
        if (!userId) return null;

        const user = this.userRepository.findOne({ where: { id: Number(userId) } });

        if (!user) throw new NotFoundException("Id does not exist");
        return user;
    }
}

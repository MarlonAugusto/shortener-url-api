import { UrlEntity } from "src/shortener/models/url.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({default: true})
    active: boolean;

    @OneToMany(() => UrlEntity, (url) => url.user, { cascade: true })
    urls: UrlEntity[];
}
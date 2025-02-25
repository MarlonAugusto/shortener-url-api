import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from 'src/user/models/user.entity';

@Entity('urls')
export class UrlEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    originalUrl: string;

    @Column({ unique: true })
    shortUrl: string;

    @Column({ default: 0 })
    clicks: number;

    @ManyToOne(() => UserEntity, (user) => user.urls, { nullable: true, onDelete: 'CASCADE' })
    user?: UserEntity;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modifiedAt: Date;

    @Column({ default: true })
    active: boolean;
}

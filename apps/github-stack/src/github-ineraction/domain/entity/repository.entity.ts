import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../../users/domain/entity/user.entity";
import { Release } from "./release.entity";

@Entity()
export class GitRepository {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  repoId: number;

  @Column()
  name: string;

  @Column()
  full_name: string;

  @Column()
  html_url: string;

  @Column()
  description: string;

  @Column()
  language: string;

  @Column()
  stargazers_count: number;

  @Column()
  watchers_count: number;

  @Column()
  forks_count: number;

  @ManyToOne(() => User, (user) => user.repositories)
  user: User;

  @OneToMany(() => Release, (release) => release.repository, {
    cascade: true,
  })
  release: Release[];
}

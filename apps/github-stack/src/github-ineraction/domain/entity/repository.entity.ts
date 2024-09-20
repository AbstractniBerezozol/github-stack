import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../../users/domain/entity/user.entity'
import { release } from 'os'
import { LatestReleases } from './release.entity'

@Entity()
export class GitRepository {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  repoId: number

  @Column()
  name: string

  @Column()
  full_name: string

  @Column()
  html_url: string

  @Column()
  description: string

  @Column()
  language: string

  @Column()
  stargazers_count: number

  @Column()
  watchers_count: number

  @Column()
  forks_count: number

  @Column({ nullable: true })
  latestRelease: string

  @ManyToOne(() => User, (user) => user.repositories)
  user: User

  @ManyToOne(() => LatestReleases, release => release.gitRepoId)
  gitRepoId: number;
}

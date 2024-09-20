import { ApiProperty } from "@nestjs/swagger";
import { Column, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GitRepository } from "./repository.entity";

export class LatestReleases {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => GitRepository, (gitRepoId) => gitRepoId.repoId )
  gitRepoId: number;
  @Column()
  release: string;
  @Column({type: 'date'})
  release_date: Date;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GitRepository } from "./repository.entity";

export class Release {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(
    () => GitRepository,
    (gitRepository) => gitRepository.latestRelease
  )
  cascade: true;
  @Column()
  release: string;
  @Column({ type: "date" })
  release_date: Date;
}

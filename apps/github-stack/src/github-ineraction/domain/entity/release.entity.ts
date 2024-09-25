import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GitRepository } from "./repository.entity";
@Entity()
export class Release {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  cascade: true;
  @Column()
  release: string;
  @Column({ type: "date" })
  release_date: Date;
  @ManyToOne(() => GitRepository, (repository) => repository.release, {eager: true})
  repository: GitRepository;
}

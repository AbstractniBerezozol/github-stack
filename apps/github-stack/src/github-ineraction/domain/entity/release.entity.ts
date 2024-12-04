import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GitRepository } from "./repository.entity";
@Entity()
export class Release {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  release: string;
  @Column({ type: "date" })
  release_date: Date;
  @ManyToOne(() => GitRepository, (repository) => repository.releases, {
    eager: true,
  })
  repository: GitRepository;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { GitRepository } from "../../../github-ineraction/domain/entity/repository.entity";
import { UserRole } from "../enum/roles.enum";

@Entity()
@Unique("unique_username", ["username"])
@Unique("unique_email", ["email"])
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @OneToMany(() => GitRepository, (repository) => repository.user, {
    cascade: true,
  })
  repositories: GitRepository[];
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ default: false })
  deleted: boolean;
}

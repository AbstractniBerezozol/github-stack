import { Injectable } from "@nestjs/common";
import { GithubIneractionService } from "./github-ineraction.service";
import { User } from "../../users/domain/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GitRepository } from "../domain/entity/repository.entity";

@Injectable()
export class GitrepositoryService {
  constructor(
    private readonly gitInter: GithubIneractionService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>
  ) {}

  async WatchlistQueryExample(user: User): Promise<GitRepository[]> {
    return this.gitRepository
      .createQueryBuilder("git_repository")
      .innerJoin("git_repository.user", "user")
      .where("user.username= :username", { username: user.username })
      .getMany();
  }
}

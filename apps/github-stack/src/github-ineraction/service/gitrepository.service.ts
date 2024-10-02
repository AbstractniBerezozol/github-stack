import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GitRepository } from "../domain/entity/repository.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class GitrepositoryService {
  constructor(
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>
  ) {}
  async WatchlistQueryExample(user: any) {
    return this.gitRepository
      .createQueryBuilder("git_repository")
      .innerJoin("git_repository.user", "user")
      .where("user.username= :username", { username: user.username })
      .getMany();
  }
}

import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GitRepository } from "../domain/entity/repository.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../users/domain/entity/user.entity";

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

  async CheckForSameRepositories(gitRep: any, usersGitRep: any) {
    if (
      this.gitRepository.find({ where: gitRep.repoId }) ==
      this.gitRepository.find({ where: usersGitRep.repoId })
    ) {
      console.error("Already added!");
    }
  }
}

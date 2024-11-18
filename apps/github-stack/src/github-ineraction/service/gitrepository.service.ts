import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GitRepository } from "../domain/entity/repository.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../users/domain/entity/user.entity";
import { Release } from "../domain/entity/release.entity";

@Injectable()
export class GitrepositoryService {
  constructor(
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
    @InjectRepository(Release)
    private readonly releaseRep: Repository<Release>
  ) {}
  async watchlistQueryExample(user: any) {
    return this.gitRepository
      .createQueryBuilder("git_repository")
      .innerJoin("git_repository.user", "user")
      .where("user.username= :username", { username: user.username })
      .getMany();
  }

  async checkForSameRepositories(gitRepId: any) {
    const repositories = await this.gitRepository.find();
    const addedRepository = repositories.some(
      (repo) => repo.id === gitRepId.repoId
    );
    if (addedRepository) {
      console.error("Already added!");
    }
  }

  async checkForReleaseStored(listOfReleases: any, repo: any) {
    if (listOfReleases === null) {
      const storeLastRelease = this.releaseRep.create({
        release: "No release yet",
        release_date: new Date(),
        repository: repo,
      });
      repo.releases = [storeLastRelease];

      storeLastRelease.repository = repo;
      this.releaseRep.save(storeLastRelease);
      this.gitRepository.save(repo.releases);
    }
  }

  async checkForDefaultRelease(latestRelease: any) {
    if (latestRelease == null || latestRelease == undefined) {
      return;
    }
  }
}

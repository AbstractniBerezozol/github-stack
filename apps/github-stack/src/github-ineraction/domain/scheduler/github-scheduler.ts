import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SendingEmailService } from "../../service/sending-email.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { User } from "../../../users/domain/entity/user.entity";
import { GitRepository } from "../entity/repository.entity";
import { Release } from "../entity/release.entity";

@Injectable()
export class GitHubScheduler {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly sendingEmailService: SendingEmailService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
    @InjectRepository(Release)
    private readonly releaseRep: Repository<Release>
  ) {}

  private readonly githubApiUrl = "https://api.github.com";

  async getLatestReliase(gitRepository: GitRepository) {
    const token = this.configService.get<string>("GITHUB_TOKEN");

    const headers = {
      Authorization: `token ${token}`,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.githubApiUrl}/repos/${gitRepository.full_name}/releases/latest`,
          {
            headers,
          }
        )
      );

      return response.data.name;
    } catch (error) {
      console.log(
        `For repository ${gitRepository.full_name} latest reliase is not found`
      );
    }
  }

  async checkForUpdates() {
    const repositories = await this.gitRepository.find({ relations: ["user"] });
    for (const repo of repositories) {
      const latestRelease = await this.getLatestReliase(repo);
      const releaseChecking = repo.releases.forEach((release) => {
        if (release.release != latestRelease) {
          this.releaseRep.create({
            release: latestRelease,
            release_date: new Date(),
            repository: repo,
          });
          this.gitRepository.save(repo.releases);
          this.sendingNotification(repo);
          return releaseChecking;
        }
      });
    }
  }
  async sendingNotification(repo: GitRepository) {
    const subject = "Here is update from your list!";
    const text = `Hello, it is update ${repo.name} from your Watchlist!!!`;
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: repo.user.email,
      subject: subject,
      text: text,
    };

    await this.sendingEmailService.sendEmailWithBackoff(letter);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.checkForUpdates();
  }

  @Cron("0 0 1 * *")
  async handleMonthSummary() {
    const users = await this.userRep.find({
      relations: ["repositories", "repositories.releases"],
    });
    for (const user of users) {
      await this.sendingEmailService.sendMonthSummary(user);
    }
  }
}

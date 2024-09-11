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

@Injectable()
export class GitHubScheduler {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly sendingEmailService: SendingEmailService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>
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
      const release = await this.getLatestReliase(repo);
      if (repo.latestRelease != release) {
        repo.latestRelease = release;
        this.gitRepository.save(repo);
        await this.sendingNotification(repo);
      }
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

    await this.sendingEmailService.sendingEmail(letter);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.checkForUpdates();
  }

  @Cron("0 0 1 * *")
  async handleMonthSummary() {
    const users = await this.userRep.find({ relations: ["repositories"] });
    for (const user of users) {
      await this.sendingEmailService.sendMonthSummary(user);
    }
  }
}

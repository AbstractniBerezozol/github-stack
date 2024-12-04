import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { EmailMessagingService } from "../../../github-gateway/gateway-logic/github.gateway";
import { User } from "../../../users/domain/entity/user.entity";
import { GitrepositoryService } from "../../service/gitrepository.service";
import { SendingEmailService } from "../../service/sending-email.service";
import { Release } from "../entity/release.entity";
import { GitRepository } from "../entity/repository.entity";

@Injectable()
export class GitHubScheduler {
  constructor(
    //checking
    private readonly emailMessagingService: EmailMessagingService,
    //end
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly emailService: SendingEmailService,
    private readonly gitServ: GitrepositoryService,
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
      console.error(error);
    }
  }

  async checkForUpdates() {
    const repositories = await this.gitRepository.find({
      relations: ["user", "releases"],
    });
    console.log("checking for updates");
    for (const repo of repositories) {
      const latestRelease = await this.getLatestReliase(repo);
      if (!latestRelease) {
        return;
      } else if (!repo.releases?.length && latestRelease) {
        this.gitServ.releaseStore(latestRelease, repo);
        this.sendNotification(repo);
      }
    }
  }
  async sendNotification(repo: GitRepository) {
    const subject = "Here is update from your list!";
    const text = `Hello, it is update ${repo.name} from your Watchlist!!!`;
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: repo.user.email,
      subject: subject,
      text: text,
    };

    await this.emailService.sendEmailWithBackoff(letter);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    // await this.emailMessagingService.checkingDoesItWork({
    //   something: "Hello World!",
    // });

    await this.emailService.sendMessageThroughRedis();

    await this.checkForUpdates();
  }

  @Cron("0 0 1 * *")
  async handleMonthSummary() {
    const users = await this.userRep.find({
      relations: ["repositories", "repositories.releases"],
    });
    for (const user of users) {
      await this.emailService.sendMonthSummary(user);
    }
  }
}

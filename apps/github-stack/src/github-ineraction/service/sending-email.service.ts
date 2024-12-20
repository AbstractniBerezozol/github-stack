import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { lastValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { EmailMessagingService } from "../../github-gateway/gateway-logic/github.gateway";
import { User } from "../../users/domain/entity/user.entity";
import { GitRepository } from "../domain/entity/repository.entity";
import { EmailData } from "../domain/interface/email.interface";

@Injectable()
export class SendingEmailService {
  private readonly logger = new Logger(SendingEmailService.name);
  private maxAttempts = 5;
  private defaultDelay = 1000;
  private maxDelay = 16000;

  constructor(
    private readonly httpService: HttpService,
    private readonly emailMessagingService: EmailMessagingService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRep: Repository<GitRepository>
  ) {}

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async sendEmail(data: EmailData): Promise<string> {
    try {
      const url = "http://localhost:3001/sendingTestingEmail/messageRequest";
      const response = this.httpService.post(url, data);
      return lastValueFrom(response).then((res) => res.data);
    } catch (error) {
      this.logger.error(`Failed to send email`);
      throw new Error("Failed to send Email");
    }
  }

  async sendEmailWithBackoff(email: EmailData): Promise<EmailData> {
    let attempts = 0;
    const pattern = { cmd: "send-email" };

    while (attempts <= this.maxAttempts) {
      try {
        this.emailMessagingService.handleMessage(pattern, email);
        this.logger.log("Email sent");
        return;
      } catch (error) {
        attempts++;

        const delay = Math.min(
          this.defaultDelay * Math.pow(2, attempts),
          this.maxDelay
        );
        this.logger.warn(`Retry ${attempts} failed. Retrying in ${delay} ms`);

        if (attempts >= this.maxAttempts) {
          this.logger.error("Time exceed");
          throw new Error("Failed to send an Email");
        }
        await this.sleep(delay);
      }
    }
  }
  async sendMonthSummary(user: User) {
    const repositoriesSummary = [];
    for (const repo of user.repositories) {
      const repoSummary = `${repo.name}`;
      const releaseSummary = repo.releases
        .map(
          (release) =>
            `This release is ${release.release}, released on ${release.release_date}`
        )
        .join("\n");

      const summary = repoSummary + releaseSummary;
      repositoriesSummary.push(summary);
    }

    const subject = "Here is your month summary";
    const text = `Hello, please, here is your monthly summary activity:\n\n${repositoriesSummary}`;
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: user.email,
      subject: subject,
      text: text,
    };
    await this.sendEmailWithBackoff(letter);
  }

  async sendNewPassword(email: string, password: string) {
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: email,
      subject: "New Password",
      text: `Greetings! Here is your new password: ${password}`,
    };
    await this.sendEmailWithBackoff(letter);
  }

  async sendMessageThroughRedis() {
    const letter = "Hello, I am Bob";
    const pattern = "send-redis-message";
    await this.emailMessagingService.checkingRedis(pattern, letter);
  }
}

import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { EmailData } from "../domain/interface/email.interface";
import { lastValueFrom } from "rxjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/domain/entity/user.entity";
import { GitRepository } from "../domain/entity/repository.entity";
import { release } from "os";

@Injectable()
export class SendingEmailService {
  private readonly logger = new Logger(SendingEmailService.name);
  private maxAttempts = 5;
  private defaultDelay = 1000;
  private maxDelay = 16000;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRep: Repository<GitRepository>
  ) {}

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async sendingEmail(data: EmailData): Promise<string> {
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
    while (attempts <= this.maxAttempts) {
      try {
        await this.sendingEmail(email);
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
    const summary = user.repositories
      .map((repo) => {
        return repo.release.map(
          (release) =>
            ` Here is your Github releases: ${release.release}, released on ${
              release.release_date
            }`
        );
      })
      .join("\n\n");

    const subject = "Here is your month summary";
    const text = `Hello, please, here is your monthly summary activity:\n\n${summary}`;
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
}

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { EmailData } from "../domain/interface/email.interface";
import { lastValueFrom } from "rxjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/domain/entity/user.entity";
import { GitHubScheduler } from "../domain/scheduler/github-scheduler";

@Injectable()
export class SendingEmailService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>
  ) {}

  async sendingEmail(data: EmailData): Promise<string> {
    const url = "http://localhost:3001/sendingTestingEmail/messageRequest";
    const response = this.httpService.post(url, data);
    return lastValueFrom(response).then((res) => res.data);
  }

  async sendMonthSummary(user: User) {
    const summary = user.repositories
      .map((repo) => `- ${repo.name}`)
      .join("\n");
    const subject = "Here is your month summary";
    const text = `Hello, please, here is your monthly summary activity:\n\n${summary}`;
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: user.email,
      subject: subject,
      text: text,
    };
    await this.sendingEmail(letter);
  }

  async sendNewPassword(email: string, password: string) {
    const letter = {
      from: "aleksandr.zolotarev@abstract.rs",
      to: email,
      subject: "New Password",
      text: `Greetings! Here is your new password: ${password}`,
    };
    await this.sendingEmail(letter);
  }
}

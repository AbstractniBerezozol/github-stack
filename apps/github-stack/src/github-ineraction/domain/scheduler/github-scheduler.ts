import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SendingEmailService } from '../../service/sending-email.service'

@Injectable()
export class GitHubScheduler {
  constructor(private readonly sendingEmailService: SendingEmailService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.sendingEmailService.checkForUpdates()
  }

  @Cron('0 0 1 * *')
  async handleMonthSummary() {
    await this.sendingEmailService.sendMonthSummary()
  }
}

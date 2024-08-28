import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { EmailData } from '../domain/interface/email.interface'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { GitRepository } from '../domain/entity/repository.entity'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../users/domain/entity/user.entity'

@Injectable()
export class SendingEmailService {
  private readonly githubApiUrl = 'https://api.github.com'
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
  ) {}

  async sendingEmail(data: EmailData): Promise<string> {
    const url = 'http://localhost:3001/sendingTestingEmail/messageRequest'
    const response = this.httpService.post(url, data)
    return lastValueFrom(response).then((res) => res.data)
  }

  async getLatestReliase(gitRepository: GitRepository) {
    const token = this.configService.get<string>('GITHUB_TOKEN')

    const headers = {
      Authorization: `token ${token}`,
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.githubApiUrl}/repos/${gitRepository.full_name}/releases/latest`,
          {
            headers,
          },
        ),
      )

      return response.data.name
    } catch (error) {
      console.log(
        `For repository ${gitRepository.full_name} latest reliase is not found`,
      )
    }
  }

  async checkForUpdates() {
    const repositories = await this.gitRepository.find({ relations: ['user'] })
    for (const repo of repositories) {
      const release = await this.getLatestReliase(repo)
      if (repo.latestRelease != release) {
        repo.latestRelease = release
        this.gitRepository.save(repo)
        const subject = 'Here is update from your list!'
        const text = `Hello, it is update ${repo.name} from your Watchlist!!!`
        const letter = {
          from: 'aleksandr.zolotarev@abstract.rs',
          to: repo.user.email,
          subject: subject,
          text: text,
        }

        await this.sendingEmail(letter)
      }
    }
  }

  async sendMonthSummary() {
    const users = await this.userRep.find({ relations: ['repositories'] })
    for (const user of users) {
      const summary = user.repositories
        .map((repo) => `- ${repo.name} `)
        .join('\n')
      const subject = 'Here is your month summary'
      const text = `Hello, please, here is your monthly summary activity:\n\n${summary}`
      const letter = {
        from: 'aleksandr.zolotarev@abstract.rs',
        to: user.email,
        subject: subject,
        text: text,
      }
      await this.sendingEmail(letter)
    }
  }

  async sendNewPassword(email: string, password: string) {

    const letter = {
      from: 'aleksandr.zolotarev@abstract.rs',
      to: email,
      subject: 'New Password',
      text: `Greetings! Here is your new password: ${password}`,
    }
    await this.sendingEmail(letter)
  }
}

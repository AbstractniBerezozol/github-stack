import { HttpService } from '@nestjs/axios'
import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom, from, lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SearchBy } from '../domain/enum/repository.enum'
import { GitRepository } from '../domain/entity/repository.entity'
import { User } from '../../users/domain/entity/user.entity'

@Injectable()
export class GithubIneractionService {
  private readonly githubApiUrl = 'https://api.github.com'

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
  ) {}

  async searchRepositories(
    searchBy: SearchBy,
    name: string,
    owner: string,
  ): Promise<any> {
    let query: string

    switch (searchBy) {
      case SearchBy.name:
        query = `name:${name}`
        break

      case SearchBy.description:
        query = `description:${name}`
        break

      case SearchBy.topics:
        query = `topics:${name}`
        break

      case SearchBy.readme:
        query = `readme:${name}`
        break

      case SearchBy.repoOwner:
        query = `"repo:${owner}/${name}"`
        break

      default:
        throw new BadRequestException('Something went wrong')
    }

    const url = `${this.githubApiUrl}/search/repositories?q=${query}`
    try {
      const response = await this.httpService.get(url).toPromise()
      return response.data.items
    } catch (error) {
      console.error('error searching reps', error)
      throw new HttpException('Error searching', 500)
    }
  }

  async addRepository(repoId: number, user: User): Promise<GitRepository[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN')
    const headers = {
      Authorization: `token ${token}`,
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repositories/${repoId}`, {
          headers,
        }),
      )

      const repo = response.data
      const newRepo = this.gitRepository.create({
        repoId: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        latestRelease: repo.latestRelease,
        user,
      })

      await this.gitRepository.save(newRepo)

      return this.gitRepository.find({
        where: { user: { username: user.username } },
      })
    } catch (error) {
      console.error('New error here', error)
      throw new Error('{{Salam Slavjanam}}')
    }
  }

  async deleteRepository(repoId: number): Promise<void> {
    const repository = await this.gitRepository.findOne({
      where: { repoId: repoId },
    })
    if (!repository) {
      throw new HttpException('not found', 404)
    }
    await this.gitRepository.remove(repository)
  }

  async getWatchlist(user: User): Promise<GitRepository[]> {
    return this.gitRepository
      .createQueryBuilder('git_repository')
      .innerJoin('git_repository.user', 'user')
      .where('user.username= :username', { username: user.username })
      .getMany()
  }
}

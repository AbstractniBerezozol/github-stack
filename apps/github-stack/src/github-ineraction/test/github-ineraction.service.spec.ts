import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../../users/domain/entity/user.entity'
import { GitRepository } from '../domain/entity/repository.entity'
import { GithubIneractionService } from '../service/github-ineraction.service'
import { SearchBy } from '../domain/enum/repository.enum'
import { HttpException } from '@nestjs/common'
import { of } from 'rxjs'
import { EmailData } from '../domain/interface/email.interface'
import { AxiosResponse } from 'axios'
import { SendingEmailService } from '../service/sending-email.service'

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
}

enum mockSearchBy {
  name = 'name',
  description = 'description',
  topics = 'topics',
  readme = 'readme',
  repoOwner = 'repoOwner',
}

const mockConfigService = {
  get: jest.fn().mockReturnValue('mocked_github_token'),
}

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  findOneOrFail: jest.fn(),
  createQueryBuilder: jest.fn(),
}

describe('GithubIneractionService', () => {
  let sendingEmailService: SendingEmailService
  let githubInteractionService: GithubIneractionService
  let httpService: HttpService
  let configService: ConfigService
  let userRepostory: Repository<User>
  let gitRepository: Repository<GitRepository>

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubIneractionService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        {
          provide: getRepositoryToken(GitRepository),
          useValue: mockRepository,
        },
      ],
    }).compile()

    githubInteractionService = module.get<GithubIneractionService>(
      GithubIneractionService,
    )
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
    userRepostory = module.get<Repository<User>>(getRepositoryToken(User))
    gitRepository = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(githubInteractionService).toBeDefined()
  })

  describe('searchRepositories', () => {
    it('should search repositories by name', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: 'repo1' },
            { id: 2, name: 'repo2' },
          ],
        },
      }
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse),
      })

      const result = await githubInteractionService.searchRepositories(
        SearchBy.name,
        'repo1',
        '',
      )
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.github.com/search/repositories?q=name:repo1',
      )
      expect(result).toEqual(mockResponse.data.items)
    })
    it('should handle errors during repos search', async () => {
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject('API ERROR'),
      })
      await expect(
        githubInteractionService.searchRepositories(SearchBy.name, 'repo1', ''),
      ).rejects.toThrowError(HttpException)
    })
  })

  describe('addRepository', () => {
    it('should add repository to the watchlist', async () => {
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        roles: ['default'],
        repositories: [],
        deletedDate: undefined,
        deleted: false,
      }
      const mockRepoId = 12345
      const mockResponse = {
        data: {
          id: mockRepoId,
          name: 'mockingRepository',
          full_name: 'alexander/mockingRepository',
          html_url: 'https://github.com/alexander/mockingRepository',
          description: 'Here is test repository for something incredible',
          language: 'TypeScript',
          stargazers_count: 103,
          watchers_count: 6,
          forks_count: 10509,
          latestRelease: 'v1.7.19',
        },
      }

      mockHttpService.get.mockReturnValue(of(mockResponse))

      mockRepository.find.mockResolvedValue([mockRepository])
      mockRepository.create.mockReturnValue({ id: 1, repoId: mockRepoId })
      mockRepository.save.mockResolvedValue({ id: 1, repoId: mockRepoId })

      const result = await githubInteractionService.addRepository(
        mockRepoId,
        mockUser,
      )
      expect(result.length).toBeGreaterThan(0)
      expect(mockRepository.save).toHaveBeenCalled()
    })
    it('should handle errors during repos adding', async () => {
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        roles: ['default'],
        repositories: [],
        deletedDate: undefined,
        deleted: false,
      }
      const mockRepoId = 12345
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject('API ERROR'),
      })
      mockRepository.findOne.mockRejectedValue(mockUser)

      await expect(
        githubInteractionService.addRepository(mockRepoId, mockUser),
      ).rejects.toThrowError()
    })
  })

  describe('deleteRepository', () => {
    it('should delete Repository from users watchlist', async () => {
      const mockRepoId = 12345
      const mockRepositoryDelete: GitRepository = {
        id: 1,
        repoId: mockRepoId,
        user: {
          id: 1,
          username: 'Coco',
          password: 'Coco123',
          email: 'Coco@singimail.rs',
          roles: ['default'],
          repositories: [],
          deletedDate: undefined,
          deleted: false,
        },
        name: '',
        full_name: '',
        html_url: '',
        description: '',
        language: '',
        stargazers_count: 0,
        watchers_count: 0,
        forks_count: 0,
        latestRelease: '',
      }
      mockRepository.findOne.mockResolvedValue(mockRepositoryDelete)

      await githubInteractionService.deleteRepository(mockRepoId)
      expect(mockRepository.remove).toHaveBeenCalled()
    })
    it('should throw an erroe if repository is not found', async () => {
      const mockRepoId = 123
      mockRepository.findOne.mockResolvedValue(undefined)

      await expect(
        githubInteractionService.deleteRepository(mockRepoId),
      ).rejects.toThrowError(HttpException)
    })
  })

  describe('getWatchliist', () => {
    it('should return user watchlist', async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      }
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        roles: ['default'],
        repositories: [],
      } as User

      const queryBuilder: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockedRepository),
      }

      jest
        .spyOn(gitRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder)

      const result = await githubInteractionService.getWatchlist(mockUser)

      expect(gitRepository.createQueryBuilder).toHaveBeenCalledWith(
        'git_repository',
      )
      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        'git_repository.user',
        'user',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.username= :username',
        { username: mockUser.username },
      )
      expect(queryBuilder.getMany).toHaveBeenCalled()
      expect(result).toEqual(mockedRepository)

      // mockRepository.find.mockResolvedValue(mockUser.repositories);

      // const result = await githubInteractionService.getWatchlist(mockUser);
      // expect(result).toEqual(mockUser.repositories);
      // expect(mockRepository.find).toHaveBeenCalledWith({
      //   where: { user: mockUser },
      // });
    })
  })

//   describe('getLatestReliase', () => {
//     it('should find latest reliase from repository', async () => {
//       const mockRepository: GitRepository = {
//         id: 1,
//         name: 'mockingRepository',
//         full_name: 'alexander/mockingRepository',
//         html_url: 'https://github.com/alexander/mockingRepository',
//         description: 'Here is test repository for something incredible',
//         language: 'TypeScript',
//         stargazers_count: 103,
//         watchers_count: 6,
//         forks_count: 10509,
//         latestRelease: 'v1.7.19',
//         repoId: 23,
//         user: new User(),
//       }
//       const mockResponse = { data: { name: 'v2.1.23' } }
//       mockHttpService.get.mockReturnValue(of(mockResponse))

//       const result =
//         await githubInteractionService.getLatestReliase(mockRepository)
//       expect(result).toEqual('v2.1.23')
//     })

//     it('should handle errors during getting the last reliase', async () => {
//       const mockRepository: GitRepository = {
//         id: 1,
//         name: 'mockingRepository',
//         full_name: 'alexander/mockingRepository',
//         html_url: 'https://github.com/alexander/mockingRepository',
//         description: 'Here is test repository for something incredible',
//         language: 'TypeScript',
//         stargazers_count: 103,
//         watchers_count: 6,
//         forks_count: 10509,
//         latestRelease: 'v1.7.19',
//         repoId: 23,
//         user: new User(),
//       }
//       mockHttpService.get.mockReturnValue({
//         toPromise: () => Promise.reject('API ERROR'),
//       })

//       const result =
//         await githubInteractionService.getLatestReliase(mockRepository)
//       expect(result).toBeUndefined()
//     })
//   })

//   describe('checkForUpdates', () => {
//     it('should notify if updates were found', async () => {
//       const mockUser = {
//         id: 1,
//         username: 'Coco',
//         password: 'Coco123',
//         email: 'Coco@singimail.rs',
//         roles: ['default'],
//         repositories: [],
//       } as User
//       const mockedRepository: GitRepository = {
//         id: 1,
//         name: 'mockingRepository',
//         full_name: 'alexander/mockingRepository',
//         html_url: 'https://github.com/alexander/mockingRepository',
//         description: 'Here is test repository for something incredible',
//         language: 'TypeScript',
//         stargazers_count: 103,
//         watchers_count: 6,
//         forks_count: 10509,
//         latestRelease: 'v1.7.19',
//         repoId: 23,
//         user: mockUser,
//       } as GitRepository
//       mockUser.repositories = [mockedRepository]

//       jest.spyOn(gitRepository, 'find').mockResolvedValue([mockedRepository])
//       jest
//         .spyOn(githubInteractionService, 'getLatestReliase')
//         .mockResolvedValue('v1.7.20')
//       const saveSpy = jest
//         .spyOn(gitRepository, 'save')
//         .mockResolvedValue(mockedRepository)

//       const sendDataSpy = jest
//         .spyOn(githubInteractionService, 'sendDataToAnotherApi')
//         .mockResolvedValue('OK')

//       await githubInteractionService.checkForUpdates()

//       expect(gitRepository.find).toHaveBeenCalledWith({ relations: ['user'] })
//       expect(
//         githubInteractionService.getLatestReliase,
//       ).toHaveBeenLastCalledWith(mockedRepository)
//       expect(saveSpy).toHaveBeenCalledWith({
//         ...mockedRepository,
//         latestRelease: 'v1.7.20',
//       })
//       expect(sendDataSpy).toHaveBeenCalledWith({
//         from: 'aleksandr.zolotarev@abstract.rs',
//         to: mockUser.email,
//         subject: 'Here is update from your list!',
//         text: `Hello, it is update ${mockedRepository.name} from your Watchlist!!!`,
//       })
//     })

//     it('should not notify if updates were not found', async () => {
//       const mockUser = {
//         id: 1,
//         username: 'Coco',
//         password: 'Coco123',
//         email: 'Coco@singimail.rs',
//         roles: ['default'],
//         repositories: [],
//       } as User
//       const mockedRepository: GitRepository = {
//         id: 1,
//         name: 'mockingRepository',
//         full_name: 'alexander/mockingRepository',
//         html_url: 'https://github.com/alexander/mockingRepository',
//         description: 'Here is test repository for something incredible',
//         language: 'TypeScript',
//         stargazers_count: 103,
//         watchers_count: 6,
//         forks_count: 10509,
//         latestRelease: 'v1.7.19',
//         repoId: 23,
//         user: mockUser,
//       }
//       mockUser.repositories = [mockedRepository]

//       jest.spyOn(gitRepository, 'find').mockResolvedValue([mockedRepository])
//       jest
//         .spyOn(githubInteractionService, 'getLatestReliase')
//         .mockResolvedValue('v1.7.19')
//       const saveSpy = jest
//         .spyOn(gitRepository, 'save')
//         .mockResolvedValue(mockedRepository)

//       const sendDataSpy = jest
//         .spyOn(githubInteractionService, 'sendDataToAnotherApi')
//         .mockResolvedValue('OK')

//       await githubInteractionService.checkForUpdates()

//       expect(gitRepository.find).toHaveBeenCalledWith({ relations: ['user'] })
//       expect(githubInteractionService.getLatestReliase).toHaveBeenCalledWith(
//         mockedRepository,
//       )
//       expect(saveSpy).not.toHaveBeenCalled()
//       expect(sendDataSpy).not.toHaveBeenCalled()
//     })
//   })

//   describe('sendMonthSummary', () => {
//     it('should send monthly summary to users', async () => {
//       const mockedRepository: GitRepository = {
//         id: 1,
//         name: 'mockingRepository',
//         full_name: 'alexander/mockingRepository',
//         html_url: 'https://github.com/alexander/mockingRepository',
//         description: 'Here is test repository for something incredible',
//         language: 'TypeScript',
//         stargazers_count: 103,
//         watchers_count: 6,
//         forks_count: 10509,
//         latestRelease: 'v1.7.19',
//         repoId: 23,
//         user: new User(),
//       }
//       const mockUser = {
//         id: 1,
//         username: 'Coco',
//         password: 'Coco123',
//         email: 'Coco@singimail.rs',
//         roles: ['default'],
//         repositories: [mockedRepository],
//         deletedDate: undefined,
//         deleted: false,
//       }
//       jest.spyOn(userRepostory, 'find').mockResolvedValue([mockUser])
//       const sendDataSpy = jest
//         .spyOn(githubInteractionService, 'sendDataToAnotherApi')
//         .mockResolvedValue('OK')

//       await githubInteractionService.sendMonthSummary()

//       expect(userRepostory.find).toHaveBeenCalledWith({
//         relations: ['repositories'],
//       })
//       expect(sendDataSpy).toHaveBeenCalledWith({
//         from: 'aleksandr.zolotarev@abstract.rs',
//         to: mockUser.email,
//         subject: 'Here is your month summary',
//         text: `Hello, please, here is your monthly summary activity:\n\n- ${mockedRepository.name} `,
//       })
//     })

//     it('should handle errors during summary sending', async () => {
//       mockRepository.find.mockRejectedValue(new Error('Database error'))

//       await expect(
//         githubInteractionService.sendMonthSummary(),
//       ).rejects.toThrowError(Error)
//     })
//   })

//   describe('sendDataToAnotherApi', () => {
//     it('should send data to another API and returns response', async () => {
//       const mockData: EmailData = {
//         from: 'aleksandr.zolotarev@abstract.rs',
//         to: 'Testing@gmail.com',
//         subject: 'Here is update from your list!',
//         text: 'Hello there!!! Here is your update!',
//       }

//       const mockResponse = { data: 'Success' }

//       const axiosRes: AxiosResponse<unknown, any> = {
//         data: mockResponse,
//         status: 0,
//         statusText: '',
//         headers: undefined,
//         config: undefined,
//       }

//       jest.spyOn(httpService, 'post').mockReturnValue(of(axiosRes))

//       const result =
//         await githubInteractionService.sendDataToAnotherApi(mockData)

//       expect(httpService.post).toHaveBeenCalledWith(
//         'http://localhost:3001/sendingTestingEmail/messageRequest',
//         mockData,
//       )
//       expect(result).toEqual({ data: 'Success' })
//     })
//   })
// })
})
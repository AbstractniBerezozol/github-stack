import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UnauthorizedException } from '@nestjs/common'
import { User } from '../../users/domain/entity/user.entity'
import { UsersService } from '../../users/service/users.service'
import { AuthService } from '../service/auth.service'
import { CreateUserDto } from '../../users/domain/dto/create-user.dto'

const mockUserService = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
}
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockAccessToken'),
}
describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        AuthService,
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })
  describe('login', () => {
    it('should throw an exception if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null)
      await expect(
        authService.login({ username: 'Coco', password: 'Coco123' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw an exception if password is wrong', async () => {
      const user = { username: 'Coco', password: 'Coco123' }
      mockUserService.findOne.mockResolvedValue(user)
      jest.spyOn(bcrypt, 'compare').mockReturnValueOnce(false)
      await expect(
        authService.login({ username: 'Coco', password: 'garantija' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it(' should return jwt token for logging', async () => {
      const user = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        repositories: [],
      } as User
      mockUserService.findOne.mockResolvedValue(user)
      jest.spyOn(bcrypt, 'compare').mockReturnValueOnce(true)

      const result = await authService.login({
        username: 'Coco',
        password: 'Coco123',
      })
      expect(result).toHaveProperty('access_token')
      const { password: password2, ...res } = user
      expect(jwtService.sign).toHaveBeenCalledWith(res)
    })
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@gmail.com',
        roles: [],
      }
      const expectedUser = { ...createUserDto, id: 2 }
      mockUserService.create.mockResolvedValue(expectedUser)

      const result = await authService.register(createUserDto)

      expect(result).toEqual(expectedUser)
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto)
    })
  })
})

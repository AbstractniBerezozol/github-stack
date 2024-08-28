import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles } from '../../auth/domain/decorator/roles.decorator'
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard'
import { GitRepository } from '../domain/entity/repository.entity'
import { SearchBy } from '../domain/enum/repository.enum'
import { GithubIneractionService } from '../service/github-ineraction.service'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { UserRole } from '../../users/domain/enum/roles.enum'
import { SendingEmailService } from '../service/sending-email.service'

@UseGuards(LocalAuthGuard)
@ApiTags('github-interaction')
@Controller('github-interaction')
export class GithubInteractionController {
  constructor(
    private readonly githubService: GithubIneractionService,
    private readonly sendingEmailService: SendingEmailService,
  ) {}

  @Get('search/repos/:value')
  async searchRepositories(
    @Query('searchBy') searchBy: SearchBy,
    @Param('value') value: string,
    @Query('owner') owner: string,
  ) {
    return this.githubService.searchRepositories(searchBy, value, owner)
  }

  @UseGuards(RolesGuard)
  @Get('watchlist')
  @Roles([UserRole.ADMIN])
  async getWatchlist(@Request() req): Promise<GitRepository[]> {
    return this.githubService.getWatchlist(req.user)
  }

  @UseGuards(RolesGuard)
  @Get('send-test-email')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async sendEmail(@Query('email') email: string) {
    email = 'aleksandr.zolotarev@abstract.rs'
    return this.sendingEmailService.sendMonthSummary()
  }

  @Post('send-data-to-another-api')
  async sendToAnotherApiData() {
    return this.sendingEmailService.checkForUpdates()
  }

  @Post('add-repository/:repoId')
  async addRepositoryToWatchlist(
    @Param('repoId') repoId: number,
    @Request() req,
  ) {
    return this.githubService.addRepository(repoId, req.user)
  }

  @Delete('delete-repository/:repoId')
  async deleteRepository(@Param('repoId') repoId: number) {
    return this.githubService.deleteRepository(repoId)
  }
}

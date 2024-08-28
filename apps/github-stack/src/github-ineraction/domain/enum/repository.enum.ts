import { ApiProperty } from '@nestjs/swagger'
export enum SearchBy {
  name = 'name',
  description = 'description',
  topics = 'topics',
  readme = 'readme',
  repoOwner = 'repoOwner',
}

import { Column } from 'typeorm'
import { GitRepository } from './repository.entity'

export class latestReleases {
  @Column()
  release: string
  @Column()
  release_date: Date
}

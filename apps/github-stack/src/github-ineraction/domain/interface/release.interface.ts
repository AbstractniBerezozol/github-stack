import { GitRepository } from "../entity/repository.entity";

export interface releaseData {
  id: number;
  release: string;
  release_date: Date;
  repository: GitRepository;
}

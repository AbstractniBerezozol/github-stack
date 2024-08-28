import { Test, TestingModule } from '@nestjs/testing'
import { SendingEmailService } from '../service/sending-email.service'

describe('SendingEmailService', () => {
  let service: SendingEmailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendingEmailService],
    }).compile()

    service = module.get<SendingEmailService>(SendingEmailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

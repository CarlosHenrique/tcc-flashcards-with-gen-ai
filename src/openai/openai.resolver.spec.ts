import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiResolver } from './openai.resolver';

describe('OpenAiResolver', () => {
  let resolver: OpenAiResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAiResolver],
    }).compile();

    resolver = module.get<OpenAiResolver>(OpenAiResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

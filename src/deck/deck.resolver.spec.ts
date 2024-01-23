import { Test, TestingModule } from '@nestjs/testing';
import { DeckResolver } from './deck.resolver';

describe('DeckResolver', () => {
  let resolver: DeckResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeckResolver],
    }).compile();

    resolver = module.get<DeckResolver>(DeckResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

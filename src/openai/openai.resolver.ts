import { Resolver } from '@nestjs/graphql';
import { OpenAiService } from './openai.service';

@Resolver()
export class OpenAiResolver {
  constructor(private readonly chatService: OpenAiService) {}
}

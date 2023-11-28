import { DynamicModule, Global, Module } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { OpenAiOptions } from './entities/openai.entity';

@Global()
@Module({})
export class OpenAiModule {
  public static register(options: OpenAiOptions): DynamicModule {
    return {
      module: OpenAiModule,
      providers: [
        {
          provide: 'OPEN_AI_OPTIONS',
          useValue: options,
        },
        {
          provide: 'OPEN_AI_CONNECTION',
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          useFactory: (config: OpenAiOptions, service: OpenAiService) => {
            return service.connect(config);
          },
          inject: ['OPEN_AI_OPTIONS', OpenAiService],
        },
        OpenAiService,
      ],
      exports: [OpenAiService],
    };
  }
}

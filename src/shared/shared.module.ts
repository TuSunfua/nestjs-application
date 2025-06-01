import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiConfigService } from '@/shared/services/api-config.service';
import { ValidatorService } from '@/shared/services/validator.service';
import { GeneratorService } from '@/shared/services/generator.service';

const providers: Provider[] = [ApiConfigService, ValidatorService, GeneratorService];

@Global()
@Module({
    providers,
    imports: [CqrsModule],
    exports: [...providers, CqrsModule],
})
export class SharedModule {}

import { SetMetadata } from '@nestjs/common';

export const SKIP_IP_CHECK_KEY = 'SKIP_IP_CHECK';
export const SkipIpCheck = () => SetMetadata(SKIP_IP_CHECK_KEY, true);

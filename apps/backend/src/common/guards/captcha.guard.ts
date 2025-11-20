import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaGuard implements CanActivate {
  private readonly logger = new Logger(CaptchaGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const captchaEnabled = this.configService.get<boolean>('CAPTCHA_ENABLED', false);

    if (!captchaEnabled) {
      this.logger.debug('Captcha validation skipped (disabled in config)');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const captchaToken = request.body?.captchaToken;

    if (!captchaToken) {
      throw new BadRequestException('Captcha token is required');
    }

    const isValid = await this.verifyCaptchaToken();

    if (!isValid) {
      throw new BadRequestException('Invalid captcha token');
    }

    return true;
  }

  private async verifyCaptchaToken(): Promise<boolean> {
    const secretKey = this.configService.get<string>('CAPTCHA_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn('Captcha secret key not configured, accepting all tokens');
      return true;
    }

    this.logger.debug('Captcha verification hook (to be implemented with actual service)');
    return true;
  }
}

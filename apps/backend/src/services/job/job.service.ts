import { Injectable, Logger } from '@nestjs/common';

export interface JobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
}

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async enqueue<T = any>(jobName: string, data: T, options?: JobOptions): Promise<void> {
    this.logger.log(`Enqueuing job: ${jobName} with options: ${JSON.stringify(options)}`);

    if (options?.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }

    this.logger.log(`Job ${jobName} executed immediately (queue not implemented yet)`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async enqueueEmailJob(emailData: any, options?: JobOptions): Promise<void> {
    return this.enqueue('send-email', emailData, options);
  }
}

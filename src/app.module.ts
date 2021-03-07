import { Module } from '@nestjs/common';
import { UtilizationController } from './utilization/utilization.controller';
import { CrawlerService } from './utilization/crawler.service';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  imports: [PuppeteerModule.forRoot()],
  controllers: [UtilizationController],
  providers: [CrawlerService],
})
export class AppModule {}

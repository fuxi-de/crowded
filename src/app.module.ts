import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler/crawler.controller';
import { CrawlerService } from './crawler/crawler.service';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  imports: [PuppeteerModule.forRoot()],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class AppModule {}

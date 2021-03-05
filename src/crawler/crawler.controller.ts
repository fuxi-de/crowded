import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import shop from './shop.interface';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get()
  async crawl(): Promise<Array<shop>> {
    const resultList = await this.crawlerService.crawl();
    return resultList;
  }
}

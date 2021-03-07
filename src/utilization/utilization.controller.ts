import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { CrawlerService } from './crawler.service';
import shop from './shop.interface';

@Controller('utilization')
export class UtilizationController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get()
  async findAllForRegion(@Req() request: Request): Promise<Array<shop>> {
    const { region, searchString } = request.query;

    const resultList = await this.crawlerService.crawl(
      region as string,
      searchString as string,
    );
    return resultList;
  }
}

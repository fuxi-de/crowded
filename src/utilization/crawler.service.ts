import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import { InjectBrowser } from 'nest-puppeteer';
import shop from './shop.interface';

@Injectable()
export class CrawlerService {
  private baseUrl = 'https://www.google.de/maps/place';
  private resultSelector = 'div.section-result';
  private openPages = 0;
  private readonly logger = new Logger('crawlerService');

  constructor(@InjectBrowser() private readonly browser: Browser) {
    this.browser = browser;
  }

  async crawl(
    region: string,
    searchString: string,
  ): Promise<Array<shop> | undefined> {
    const page = await this.browser.newPage();
    const itemList = await this.buildItemList(
      page,
      `${this.baseUrl}/${region}`,
      searchString,
    );
    const url = page.url();
    const resultList = [];
    if (itemList !== undefined) {
      await Promise.all(
        itemList.map(async (_item, index) => {
          try {
            if (this.browser) {
              const newPage = await this.browser.newPage();
              this.openPages++;
              await newPage.goto(url, {
                waitUntil: 'networkidle2',
              });
              const currentItem = await newPage.$(
                `.section-result:nth-of-type(${index + 1})`,
              );
              if (currentItem) {
                const shopItem = await this.resolveShopItem(
                  currentItem,
                  newPage,
                );
                resultList.push(shopItem);
              }
              await newPage.close();
              this.openPages--;
              await this.tryDestruction();
            }
          } catch (e) {
            this.logger.error(e);
          }
        }),
      );
      return resultList;
    }
    return undefined;
  }

  async tryDestruction() {
    if (this.openPages === 0) {
      this.logger.log('destroying Browser');
      return await this.browser?.close();
    }
    this.logger.log('continuing');
  }

  async buildItemList(
    page: puppeteer.Page,
    path: string,
    searchString: string,
  ): Promise<puppeteer.ElementHandle<Element>[]> {
    try {
      await page.goto(path, { waitUntil: 'networkidle2' });
      const searchBar = await page.$('input#searchboxinput');
      const searchButton = await page.$('button#searchbox-searchbutton');
      await searchBar?.click({ clickCount: 3 });
      await searchBar?.type(searchString);
      await searchButton?.click();
      await page.waitForNavigation();
      await page.waitForSelector(this.resultSelector);
      const itemList = await page.$$(this.resultSelector);
      return itemList;
    } catch (error) {
      this.logger.error('error while building itemList occured:', error);
      return error;
    }
  }

  async resolveShopItem(
    item: puppeteer.ElementHandle<Element>,
    page: puppeteer.Page,
  ) {
    const popTimesSelector = 'div.section-popular-times-live-description';
    const nameSelector = '.section-hero-header-title-title';
    const addressSelector = "button[data-item-id='address']";
    try {
      await item.click();
      await page.waitForSelector(nameSelector);
      const currentUtilization = await this.resolveItemText(
        popTimesSelector,
        page,
      );
      const name = await this.resolveItemText(nameSelector, page);
      const address = await this.resolveItemText(addressSelector, page);
      const shopItem: shop = {
        name,
        address,
        currentUtilization,
      };
      return shopItem;
    } catch (error) {
      this.logger.error('error while resolving shopItem occured:', error);
      return error;
    }
  }

  async resolveItemText(
    selector: string,
    page: puppeteer.Page,
  ): Promise<string> {
    try {
      const element = await page.$(selector);
      const content = await page.evaluate((el) => el.textContent, element);
      return content.trim();
    } catch (e) {
      this.logger.error('error while resolving item Text', e);
      return '';
    }
  }
}

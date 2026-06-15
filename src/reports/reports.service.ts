import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  async generatePdf(templateName: string, data: any): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), 'views', 'reports', `${templateName}.ejs`);
    
    try {
      // Render EJS to HTML
      const html = (await ejs.renderFile(templatePath, data)) as string;
      
      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Failed to generate PDF for template ${templateName}`, error);
      throw error;
    }
  }
}

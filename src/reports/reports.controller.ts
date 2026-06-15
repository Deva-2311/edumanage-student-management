import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { StudentService } from '../students/student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private studentService: StudentService,
  ) {}

  @Get('student/:id/transcript')
  async downloadTranscript(@Param('id') id: string, @Res() res: Response) {
    const student = await this.studentService.findOne(+id);
    
    const pdfBuffer = await this.reportsService.generatePdf('transcript', { student });
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="transcript_${student.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }
}

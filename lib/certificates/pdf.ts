import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type CertificatePdfInput = {
  certNo: string;
  trainee: string;
  course: string;
  issueDate: string;
  expiry: string;
  score: number;
  status: string;
};

export async function buildCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);

  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.12, 0.18, 0.28),
    borderWidth: 2,
    color: rgb(0.98, 0.99, 1),
  });

  page.drawText('KARMASETU', {
    x: 60,
    y: height - 90,
    size: 34,
    font: titleFont,
    color: rgb(0.04, 0.14, 0.24),
  });

  page.drawText('AI Integrated Industrial Training Portal', {
    x: 62,
    y: height - 112,
    size: 10,
    font: bodyFont,
    color: rgb(0.26, 0.36, 0.46),
  });

  page.drawText('Certificate of Completion', {
    x: 60,
    y: height - 180,
    size: 26,
    font: titleFont,
    color: rgb(0.05, 0.11, 0.19),
  });

  page.drawText('Awarded to', {
    x: 60,
    y: height - 220,
    size: 12,
    font: bodyFont,
    color: rgb(0.35, 0.43, 0.51),
  });

  page.drawText(input.trainee, {
    x: 60,
    y: height - 255,
    size: 24,
    font: titleFont,
    color: rgb(0.0, 0.45, 0.55),
  });

  page.drawText('for successfully completing', {
    x: 60,
    y: height - 285,
    size: 12,
    font: bodyFont,
    color: rgb(0.35, 0.43, 0.51),
  });

  page.drawText(input.course, {
    x: 60,
    y: height - 320,
    size: 16,
    font: titleFont,
    color: rgb(0.07, 0.16, 0.27),
  });

  const rows: Array<[string, string]> = [
    ['Certificate No', input.certNo],
    ['Issue Date', input.issueDate],
    ['Expiry', input.expiry],
    ['Status', input.status],
  ];

  let y = height - 390;
  for (const [label, value] of rows) {
    page.drawText(`${label}:`, {
      x: 60,
      y,
      size: 11,
      font: titleFont,
      color: rgb(0.15, 0.24, 0.34),
    });

    page.drawText(value, {
      x: 190,
      y,
      size: 11,
      font: bodyFont,
      color: rgb(0.2, 0.29, 0.39),
    });

    y -= 24;
  }

  page.drawText('Authorized by KARMASETU', {
    x: width - 270,
    y: 70,
    size: 11,
    font: titleFont,
    color: rgb(0.08, 0.14, 0.23),
  });

  page.drawText('This document is generated from secure training records.', {
    x: 60,
    y: 40,
    size: 9,
    font: bodyFont,
    color: rgb(0.45, 0.52, 0.6),
  });

  return pdf.save();
}

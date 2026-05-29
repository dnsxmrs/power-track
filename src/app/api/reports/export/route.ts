import { NextResponse } from 'next/server';
import { getReportsData } from '@/app/_actions/reports/getreports';
import { prisma } from '@/lib/prisma';

function csvEscape(v: any) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'trends'; // trends|overdue
  const format = (url.searchParams.get('format') || 'csv').toLowerCase(); // csv|pdf|html

  try {
    if (type === 'overdue') {
      // find subscriptions with nextDueDate in the past (overdue)
      const now = new Date();
      const subs = await prisma.clientSubscription.findMany({
        where: { nextDueDate: { lt: now }, status: 'active' },
        select: { id: true, user: { select: { id: true, name: true, email: true } }, nextDueDate: true, monthlyPrice: true },
        orderBy: { nextDueDate: 'asc' },
      });

      if (format === 'csv') {
        const header = ['subscriptionId', 'userId', 'userName', 'userEmail', 'nextDueDate', 'monthlyPrice'];
        const rows = [header.join(',')];
        for (const s of subs) {
          rows.push([
            csvEscape(s.id),
            csvEscape(s.user?.id),
            csvEscape(s.user?.name),
            csvEscape(s.user?.email),
            csvEscape(s.nextDueDate?.toISOString() ?? ''),
            csvEscape(s.monthlyPrice),
          ].join(','));
        }
        const body = rows.join('\n');
        return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="overdue_subscriptions.csv"' } });
      }

      // HTML / Printable view
      const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Overdue Subscriptions</title>
<style>body{font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:#0f172a;background:#0b1220;padding:24px} .card{background:#071124;color:#e6eef8;padding:18px;border-radius:12px;box-shadow:0 8px 30px rgba(2,6,23,0.6)} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:left;font-size:13px} th{color:#a8c1d9} caption{font-size:18px;font-weight:600;margin-bottom:6px} .hint{margin-top:12px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.03);color:#cfe8ff;font-size:13px}</style>
</head><body>
<div class="card"><h1>Overdue Subscriptions</h1><p>Generated: ${new Date().toLocaleString()}</p>
<div class="hint">If you want a PDF, open this page in your browser and use <strong>Print → Save as PDF</strong>. Server-side PDF generation is available if Playwright is installed and the environment flag <code>EXPORT_USE_BROWSER_PDF=true</code> is set.</div>
<table><thead><tr><th>Subscription</th><th>User</th><th>Next Due</th><th>Monthly Price</th></tr></thead><tbody>
${subs.map(s=>`<tr><td>${s.id}</td><td>${s.user?.name ?? s.user?.email ?? '—'}</td><td>${s.nextDueDate?.toLocaleDateString() ?? '—'}</td><td>₱${s.monthlyPrice}</td></tr>`).join('')}
</tbody></table></div></body></html>`;

      // If PDF requested, attempt server-side PDF generation using Puppeteer.
      if (format === 'pdf') {
        try {
          // @ts-ignore - optional dependency
          const puppeteer = await import('puppeteer');
          const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
          const page = await browser.newPage();
          await page.setContent(html, { waitUntil: 'networkidle0' });
          const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
          await browser.close();
          return new NextResponse(pdfBuffer as unknown as ArrayBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="overdue_subscriptions.pdf"' } });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Puppeteer PDF generation failed:', err);
          const msg = 'Server PDF generation failed. Install puppeteer and required system dependencies, then retry.';
          return new NextResponse(msg, { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
      }

      // non-PDF: return printable HTML (kept for manual printing)
      return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': 'attachment; filename="overdue_subscriptions.html"' } });
    }

    // default: trends export
    const reports = await getReportsData();
    const trends = reports.dailyTrends || [];

    if (format === 'csv') {
      const header = ['date', 'applicationsCreated', 'subscriptionsCreated', 'paymentsVerified', 'newClients'];
      const rows = [header.join(',')];
      for (const r of trends) {
        rows.push([csvEscape(r.date), csvEscape(r.applicationsCreated), csvEscape(r.subscriptionsCreated), csvEscape(r.paymentsVerified), csvEscape(r.newClients)].join(','));
      }
      const body = rows.join('\n');
      return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="admin_trends.csv"' } });
    }

    // HTML export (printable). Server-side PDF generation available when Playwright is installed.
    const colors = { applications: '#00d4ff', subscriptions: '#6366f1', payments: '#10b981', newClients: '#f59e0b' };
    const rowsHtml = trends.map(t => `<tr><td>${t.date}</td><td>${t.applicationsCreated}</td><td>${t.subscriptionsCreated}</td><td>${t.paymentsVerified}</td><td>${t.newClients}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Trends</title>
<style>body{font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:#0f172a;background:#fff;padding:24px} .card{background:#fff;color:#0b1220;padding:18px;border-radius:12px;border:1px solid #e6eef8} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:left;font-size:13px} th{color:#64748b} caption{font-size:18px;font-weight:600;margin-bottom:6px} .hint{margin-top:12px;padding:10px;border-radius:8px;background:#f1f5f9;color:#0b1220;font-size:13px}</style>
</head><body><div class="card"><h1>Admin Trends — Last 30 days</h1><p>Generated: ${new Date().toLocaleString()}</p>
<div class="hint">To get a PDF, open this page and choose <strong>Print → Save as PDF</strong>. For a downloadable server-generated PDF set <code>EXPORT_USE_BROWSER_PDF=true</code> and install Playwright.</div>
<table><thead><tr><th>Date</th><th>Applications</th><th>Subscriptions</th><th>Payments Verified</th><th>New Clients</th></tr></thead><tbody>${rowsHtml}</tbody></table></div></body></html>`;

    if (format === 'pdf') {
      try {
        // @ts-ignore - optional dependency
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        return new NextResponse(pdfBuffer as unknown as ArrayBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="admin_trends.pdf"' } });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Puppeteer PDF generation failed:', err);
        const msg = 'Server PDF generation failed. Install puppeteer and required system dependencies, then retry.';
        return new NextResponse(msg, { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    }

    return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': 'attachment; filename="admin_trends.html"' } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

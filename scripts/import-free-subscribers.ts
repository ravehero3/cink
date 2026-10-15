/**
 * Import FREE DOWNLOAD subscribers from Mailchimp/BeatStars CSV export.
 * Usage: npx tsx scripts/import-free-subscribers.ts
 */
import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import path from 'path';

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(
  process.env.CSV_PATH ||
  '/Users/voodoo808/Downloads/audience_export_d2f83d6160/subscribed_email_audience_export_d2f83d6160.csv'
);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const rl = createInterface({ input: createReadStream(CSV_PATH) });

  let headers: string[] = [];
  let total = 0;
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const batchSize = 100;
  const batch: { email: string; group: string; firstName?: string }[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    for (const row of batch) {
      try {
        await prisma.newsletterSubscriber.upsert({
          where: { email: row.email },
          create: { email: row.email, group: row.group, firstName: row.firstName },
          update: { group: row.group, firstName: row.firstName },
        });
        imported++;
      } catch (err: any) {
        if (err?.code === 'P2002') {
          skipped++;
        } else {
          console.error(`Error for ${row.email}:`, err?.message);
          errors++;
        }
      }
    }
    batch.length = 0;
  };

  for await (const rawLine of rl) {
    // Strip \r from Windows line endings
    const line = rawLine.replace(/\r/g, '').trim();
    if (!line) continue;

    if (headers.length === 0) {
      headers = parseCSVLine(line).map((h) => h.replace(/^"|"$/g, ''));
      continue;
    }

    total++;
    const cols = parseCSVLine(line);
    const emailIdx = headers.indexOf('Email Address');
    const firstIdx = headers.indexOf('First Name');

    const email = (cols[emailIdx] || '').replace(/^"|"$/g, '').toLowerCase().trim();
    const firstName = (cols[firstIdx] || '').replace(/^"|"$/g, '').trim() || undefined;

    if (!email || !email.includes('@')) {
      skipped++;
      continue;
    }

    batch.push({ email, group: 'free', firstName });

    if (batch.length >= batchSize) {
      await flush();
      process.stdout.write(`\rProcessed ${total} rows, imported ${imported}...`);
    }
  }

  await flush();
  console.log(`\n\nDone!`);
  console.log(`Total rows: ${total}`);
  console.log(`Imported/updated: ${imported}`);
  console.log(`Skipped (invalid): ${skipped}`);
  console.log(`Errors: ${errors}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});

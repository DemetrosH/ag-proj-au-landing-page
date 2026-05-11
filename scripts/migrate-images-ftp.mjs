/**
 * migrate-images-ftp.mjs
 * Downloads portrait images via FTP from WordPress server → uploads to Sanity CDN
 */

import * as ftp from 'basic-ftp';
import { createClient } from '@sanity/client';
import { Writable } from 'stream';

const FTP_HOST = '138.197.174.208';
const FTP_USER = 'agent-1';
const FTP_PASS = '7XKjj*ADJ9tqP!D';

const SANITY_PROJECT_ID = 'gzkag8mw';
const SANITY_DATASET    = 'production';
const SANITY_TOKEN      = 'skTKUKIdo7Z0VVsRLjGOBG3fxYfMfmfiHfx5xAto1aryTGlUwPSMQMuSh0x6Qz6QzCNDcll6E5tCKYYHYIpibH8LIVhJaPJov6GADS3ETR5908emVDxfWcDqLUXEoekfIZAo6jLcEnqGS02u84oJZzN4vSrh2LcRyuxNRFzrmJx7prCYcGyi';

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset:   SANITY_DATASET,
  apiVersion: '2024-05-01',
  token:     SANITY_TOKEN,
  useCdn:    false,
});

// Hard-coded list of members still missing Sanity images
const MISSING = [
  { _id: '10ee0c3b-b390-431f-96e5-557db53cd2bc', name: 'Christian Couture',   url: 'https://artefacturbain.ca/wp-content/uploads/2023/04/Christian-Couture.jpg' },
  { _id: '82e1d0f6-a08b-4fe6-993c-6156de6c6c71', name: 'Damien Checoury',     url: 'https://artefacturbain.ca/wp-content/uploads/2024/11/Damien-Checoury.jpg' },
  { _id: 'df93474c-526c-4db3-aa04-d5cbbc4458d3', name: 'Eli Blouin Rondeau',  url: 'https://artefacturbain.ca/wp-content/uploads/2023/04/Eli-Blouin-Rondeau-scaled.jpg' },
  { _id: 'b74aa7bc-d20e-47e1-b89b-4088b0d6c139', name: 'Elysanne Tremblay',   url: 'https://artefacturbain.ca/wp-content/uploads/2023/04/Elysanne-Tremblay.jpg' },
  { _id: '06e9f7ec-9088-4618-a818-1ba50b10c210', name: 'Félicia Corbeil',     url: 'https://artefacturbain.ca/wp-content/uploads/2024/04/Felicia-Corbeil.jpg' },
  { _id: 'cfaf5495-d1a4-4d15-9c8c-d6228736db95', name: 'Geneviève Tessier',   url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Genevieve-Tessier.jpg' },
  { _id: '2f755e39-dc79-46f8-ad5d-03432695fbc8', name: 'Irène St-Amand',      url: 'https://artefacturbain.ca/wp-content/uploads/2024/04/Irene-St-Amand.jpg' },
  { _id: '1252485b-69e2-4b67-93fa-bd1c9db85c05', name: 'Jeanne Couture',      url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Jeanne-Couture.jpg' },
  { _id: '0f5140a0-66d9-4fbb-ab2d-091ad323af61', name: 'Laurie Juteau',       url: 'https://artefacturbain.ca/wp-content/uploads/2024/04/Laurie-Juteau.jpg' },
  { _id: '3d7f0ac8-fec7-4316-9f08-063cda4eb094', name: 'Marie-Anne Paradis',  url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Marie-Anne-Paradis.jpg' },
  { _id: '6595d992-9969-497c-a6c8-c65a42759224', name: 'Véronique Marengère', url: 'https://artefacturbain.ca/wp-content/uploads/2024/04/Veronique-Marengere.jpg' },
  { _id: '6e0fbedd-e31d-4b00-90e2-c21a8ec7d5c5', name: 'Éloïse Plamondon-Pagé', url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Eloise-Plamondon-Page.jpg' },
  { _id: '45f56832-5988-4710-9127-f7227398efdd', name: 'Émile Couture',       url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Emile-Couture.jpg' },
  { _id: 'b4d3c7a5-bfe2-46b1-bf9b-fc45471d0e78', name: 'Émilie Paquette',    url: 'https://artefacturbain.ca/wp-content/uploads/2023/03/Emilie-Paquette.jpg' },
];

function yearMonth(url) {
  const m = url.match(/uploads\/(\d{4})\/(\d{2})\//);
  return m ? { year: m[1], month: m[2] } : { year: '2023', month: '03' };
}

function baseFilename(url) {
  return url.split('/').pop();
}

// All filename variants to try
function filenameCandidates(url) {
  const base = baseFilename(url);
  return [
    base,
    base.replace(/\.jpg$/i, '-scaled.jpg'),
    base.replace(/\.jpg$/i, '-1-scaled.jpg'),
    base.replace(/-scaled\.jpg$/i, '.jpg'),
    base.toLowerCase(),
    base.toLowerCase().replace('.jpg', '-scaled.jpg'),
  ].filter((v, i, a) => a.indexOf(v) === i); // dedupe
}

async function ftpDownload(client, remotePath) {
  const chunks = [];
  const ws = new Writable({
    write(chunk, _enc, cb) { chunks.push(chunk); cb(); }
  });
  await client.downloadTo(ws, remotePath);
  return Buffer.concat(chunks);
}

async function tryDownload(client, wpRoot, member) {
  const { year, month } = yearMonth(member.url);
  const filenames = filenameCandidates(member.url);

  // First: try the exact year/month
  for (const fn of filenames) {
    const path = `${wpRoot}/wp-content/uploads/${year}/${month}/${fn}`;
    try {
      const buf = await ftpDownload(client, path);
      if (buf.length > 1000) return { buf, filename: fn, path };
    } catch (_) {}
  }

  // Second: search all year/month combos ±2 years
  const years = [year, String(+year - 1), String(+year + 1), String(+year - 2), String(+year + 2)];
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  for (const y of years) {
    for (const mo of months) {
      if (y === year && mo === month) continue;
      for (const fn of filenames) {
        const path = `${wpRoot}/wp-content/uploads/${y}/${mo}/${fn}`;
        try {
          const buf = await ftpDownload(client, path);
          if (buf.length > 1000) return { buf, filename: fn, path };
        } catch (_) {}
      }
    }
  }

  return null;
}

async function main() {
  const ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = false;

  try {
    console.log(`🔌 Connecting to FTP ${FTP_HOST}...`);
    await ftpClient.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
    console.log('✓ Connected\n');

    // Detect WordPress root
    const rootList = await ftpClient.list('/');
    console.log('Root contents:', rootList.map(f => f.name).join(', '));

    let wpRoot = '';
    for (const entry of rootList) {
      if (entry.type === 2 && ['public_html','www','htdocs','web','html'].includes(entry.name)) {
        wpRoot = '/' + entry.name;
        break;
      }
    }
    // Verify wp-content exists there
    try {
      await ftpClient.list(`${wpRoot}/wp-content`);
    } catch {
      // Try root directly
      try {
        await ftpClient.list('/wp-content');
        wpRoot = '';
      } catch {
        // Search one level deeper
        for (const entry of rootList) {
          if (entry.type !== 2) continue;
          try {
            await ftpClient.list(`/${entry.name}/wp-content`);
            wpRoot = '/' + entry.name;
            break;
          } catch {}
        }
      }
    }

    console.log(`\n📁 WordPress root: "${wpRoot || '/'}" \n`);

    let success = 0, failed = 0;

    for (const member of MISSING) {
      console.log(`\n👤 ${member.name}`);

      const result = await tryDownload(ftpClient, wpRoot, member);
      if (!result) {
        console.log(`   ❌ Image not found anywhere on server`);
        failed++;
        continue;
      }

      const { buf, filename, path } = result;
      console.log(`   ✓ Found: ${path} (${buf.length} bytes)`);

      process.stdout.write('   ⬆️  Uploading to Sanity... ');
      const asset = await sanity.assets.upload('image', buf, {
        contentType: 'image/jpeg',
        filename,
      });
      console.log(`✓ ${asset._id}`);

      await sanity.patch(member._id).set({
        image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }).commit();
      console.log(`   ✅ Patched`);
      success++;

      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Migrated: ${success} / ${MISSING.length}`);
    console.log(`❌ Not found on FTP: ${failed}`);
    console.log('─'.repeat(50));

  } finally {
    ftpClient.close();
    console.log('\nFTP connection closed.');
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });

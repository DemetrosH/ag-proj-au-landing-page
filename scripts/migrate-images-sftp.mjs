/**
 * migrate-images-sftp.mjs
 * Connects via SFTP (SSH port 22) to WordPress server,
 * finds portrait images, uploads to Sanity CDN, patches documents.
 */

import { createClient } from '@sanity/client';
import { Client as SshClient } from 'ssh2';

const SFTP_HOST = '138.197.174.208';
const SFTP_USER = 'agent-1';
const SFTP_PASS = '7XKjj*ADJ9tqP!D';
const SFTP_PORT = 22;

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

const MISSING = [
  { _id: '10ee0c3b-b390-431f-96e5-557db53cd2bc', name: 'Christian Couture',      url: 'wp-content/uploads/2023/04/Christian-Couture.jpg' },
  { _id: '82e1d0f6-a08b-4fe6-993c-6156de6c6c71', name: 'Damien Checoury',        url: 'wp-content/uploads/2024/11/Damien-Checoury.jpg' },
  { _id: 'df93474c-526c-4db3-aa04-d5cbbc4458d3', name: 'Eli Blouin Rondeau',     url: 'wp-content/uploads/2023/04/Eli-Blouin-Rondeau-scaled.jpg' },
  { _id: 'b74aa7bc-d20e-47e1-b89b-4088b0d6c139', name: 'Elysanne Tremblay',      url: 'wp-content/uploads/2023/04/Elysanne-Tremblay.jpg' },
  { _id: '06e9f7ec-9088-4618-a818-1ba50b10c210', name: 'Félicia Corbeil',        url: 'wp-content/uploads/2024/04/Felicia-Corbeil.jpg' },
  { _id: 'cfaf5495-d1a4-4d15-9c8c-d6228736db95', name: 'Geneviève Tessier',      url: 'wp-content/uploads/2023/03/Genevieve-Tessier.jpg' },
  { _id: '2f755e39-dc79-46f8-ad5d-03432695fbc8', name: 'Irène St-Amand',         url: 'wp-content/uploads/2024/04/Irene-St-Amand.jpg' },
  { _id: '1252485b-69e2-4b67-93fa-bd1c9db85c05', name: 'Jeanne Couture',         url: 'wp-content/uploads/2023/03/Jeanne-Couture.jpg' },
  { _id: '0f5140a0-66d9-4fbb-ab2d-091ad323af61', name: 'Laurie Juteau',          url: 'wp-content/uploads/2024/04/Laurie-Juteau.jpg' },
  { _id: '3d7f0ac8-fec7-4316-9f08-063cda4eb094', name: 'Marie-Anne Paradis',     url: 'wp-content/uploads/2023/03/Marie-Anne-Paradis.jpg' },
  { _id: '6595d992-9969-497c-a6c8-c65a42759224', name: 'Véronique Marengère',    url: 'wp-content/uploads/2024/04/Veronique-Marengere.jpg' },
  { _id: '6e0fbedd-e31d-4b00-90e2-c21a8ec7d5c5', name: 'Éloïse Plamondon-Pagé', url: 'wp-content/uploads/2023/03/Eloise-Plamondon-Page.jpg' },
  { _id: '45f56832-5988-4710-9127-f7227398efdd', name: 'Émile Couture',          url: 'wp-content/uploads/2023/03/Emile-Couture.jpg' },
  { _id: 'b4d3c7a5-bfe2-46b1-bf9b-fc45471d0e78', name: 'Émilie Paquette',       url: 'wp-content/uploads/2023/03/Emilie-Paquette.jpg' },
];

// ── SFTP helpers ──────────────────────────────────────────────────────────────

function connectSftp() {
  return new Promise((resolve, reject) => {
    const conn = new SshClient();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);
        resolve({ conn, sftp });
      });
    });
    conn.on('error', reject);
    conn.connect({ host: SFTP_HOST, port: SFTP_PORT, username: SFTP_USER, password: SFTP_PASS });
  });
}

function sftpReadFile(sftp, path) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = sftp.createReadStream(path);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function sftpList(sftp, path) {
  return new Promise((resolve, reject) => {
    sftp.readdir(path, (err, list) => {
      if (err) return reject(err);
      resolve(list);
    });
  });
}

function sftpStat(sftp, path) {
  return new Promise((resolve, reject) => {
    sftp.stat(path, (err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

// ── Find WordPress root ───────────────────────────────────────────────────────

async function findWpRoot(sftp) {
  // Try common hosting structures
  const candidates = [
    '/var/www/html',
    '/var/www/artefacturbain.ca',
    '/var/www/html/artefacturbain.ca',
    '/home/agent-1/public_html',
    '/home/agent-1/www',
    '/srv/www',
    '/public_html',
    '/www',
  ];

  // Also try listing home dir
  try {
    const home = await sftpList(sftp, '/home/agent-1');
    home.forEach(e => console.log('  ~/:', e.filename));
  } catch (_) {}

  try {
    const root = await sftpList(sftp, '/');
    console.log('Root:', root.map(e => e.filename).join(', '));
  } catch (_) {}

  for (const path of candidates) {
    try {
      await sftpStat(sftp, `${path}/wp-content`);
      console.log(`✓ WordPress found at: ${path}`);
      return path;
    } catch (_) {}
  }

  // Last resort: search /var/www
  try {
    const varwww = await sftpList(sftp, '/var/www');
    for (const entry of varwww) {
      const p = `/var/www/${entry.filename}`;
      try {
        await sftpStat(sftp, `${p}/wp-content`);
        console.log(`✓ WordPress found at: ${p}`);
        return p;
      } catch (_) {}
    }
  } catch (_) {}

  throw new Error('Could not locate WordPress root. wp-content not found.');
}

// ── Generate filename candidates ──────────────────────────────────────────────

function candidates(relativePath) {
  const parts = relativePath.split('/');
  const ym = `${parts[2]}/${parts[3]}`;
  const base = parts[4];
  return [
    base,
    base.replace(/\.jpg$/i, '-scaled.jpg'),
    base.replace(/-scaled\.jpg$/i, '.jpg'),
    base.replace(/\.jpg$/i, '-1-scaled.jpg'),
    base.toLowerCase(),
    base.toLowerCase().replace('.jpg', '-scaled.jpg'),
  ].filter((v, i, a) => a.indexOf(v) === i);
}

function yearMonth(relativePath) {
  const parts = relativePath.split('/');
  return { year: parts[2], month: parts[3] };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔌 Connecting to SFTP ${SFTP_HOST}:${SFTP_PORT}...`);
  const { conn, sftp } = await connectSftp();
  console.log('✓ Connected via SSH/SFTP\n');

  let wpRoot;
  try {
    wpRoot = await findWpRoot(sftp);
  } catch (e) {
    console.error(e.message);
    conn.end();
    return;
  }

  let success = 0, failed = 0;

  for (const member of MISSING) {
    console.log(`\n👤 ${member.name}`);
    const { year, month } = yearMonth(member.url);
    const fnames = candidates(member.url);

    let found = null;

    // Try exact location first
    for (const fn of fnames) {
      const path = `${wpRoot}/wp-content/uploads/${year}/${month}/${fn}`;
      try {
        const buf = await sftpReadFile(sftp, path);
        if (buf.length > 5000) { found = { buf, fn, path }; break; }
      } catch (_) {}
    }

    // Broad search ±2 years all months
    if (!found) {
      const years = [year, String(+year-1), String(+year+1), String(+year-2), String(+year+2)];
      const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
      outer: for (const y of years) {
        for (const mo of months) {
          if (y === year && mo === month) continue;
          for (const fn of fnames) {
            const path = `${wpRoot}/wp-content/uploads/${y}/${mo}/${fn}`;
            try {
              const buf = await sftpReadFile(sftp, path);
              if (buf.length > 5000) { found = { buf, fn, path }; break outer; }
            } catch (_) {}
          }
        }
      }
    }

    if (!found) {
      console.log(`   ❌ Not found on server`);
      failed++;
      continue;
    }

    console.log(`   ✓ Found: ${found.path} (${found.buf.length} bytes)`);
    process.stdout.write('   ⬆️  Uploading to Sanity CDN... ');
    const asset = await sanity.assets.upload('image', found.buf, {
      contentType: 'image/jpeg',
      filename: found.fn,
    });
    console.log(`✓ ${asset._id}`);

    await sanity.patch(member._id).set({
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    }).commit();
    console.log(`   ✅ Patched ${member.name}`);
    success++;

    await new Promise(r => setTimeout(r, 150));
  }

  conn.end();

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Migrated: ${success} / ${MISSING.length}`);
  console.log(`❌ Not found: ${failed}`);
  console.log('─'.repeat(50));
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });

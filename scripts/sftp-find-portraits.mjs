/**
 * sftp-find-portraits.mjs
 * Lists key upload folders via SFTP and searches for portrait files
 */
import { Client as SshClient } from 'ssh2';

const conn = new SshClient();

function sftpList(sftp, path) {
  return new Promise((resolve) => {
    sftp.readdir(path, (err, list) => resolve(err ? [] : list));
  });
}

const NAMES_TO_FIND = [
  'jeanne', 'couture', 'corbeil', 'felicia', 'irene', 'laurie', 'juteau',
  'veronique', 'emile', 'eloise', 'elysanne', 'blouin', 'damien', 'checoury',
  'genevieve', 'emilie', 'paquette', 'plamondon', 'tremblay', 'christian'
];

function isPortrait(name) {
  const lower = name.toLowerCase();
  return NAMES_TO_FIND.some(n => lower.includes(n)) && lower.match(/\.(jpg|jpeg|png|webp)$/i);
}

conn.on('ready', () => {
  conn.sftp(async (err, sftp) => {
    if (err) { console.error(err); conn.end(); return; }

    // List all year folders
    const base = '/public_html/wp-content/uploads';
    const years = await sftpList(sftp, base);
    
    for (const yearEntry of years) {
      if (!yearEntry.filename.match(/^\d{4}$/)) continue;
      const yearPath = `${base}/${yearEntry.filename}`;
      const months = await sftpList(sftp, yearPath);
      
      for (const monthEntry of months) {
        if (!monthEntry.filename.match(/^\d{2}$/)) continue;
        const monthPath = `${yearPath}/${monthEntry.filename}`;
        const files = await sftpList(sftp, monthPath);
        
        const portraits = files.filter(f => isPortrait(f.filename));
        if (portraits.length > 0) {
          portraits.forEach(f => {
            console.log(`${yearEntry.filename}/${monthEntry.filename}/${f.filename}`);
          });
        }
      }
    }
    
    conn.end();
  });
});

conn.on('error', e => console.error('Error:', e.message));
conn.connect({ host: '138.197.174.208', port: 22, username: 'agent-1', password: '7XKjj*ADJ9tqP!D' });

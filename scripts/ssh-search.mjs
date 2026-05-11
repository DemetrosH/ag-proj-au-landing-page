import { Client } from 'ssh2';

const names = ['Jeanne', 'Corbeil', 'Felicia', 'Irene', 'Irène', 'Laurie', 'Veronique', 'Emile', 'Eloise', 'Elysanne', 'Blouin', 'Damien', 'Genevieve', 'Emilie', 'Christian'];

const conn = new Client();
conn.on('ready', () => {
  const pattern = names.join('\\|');
  const cmd = `find /public_html/wp-content/uploads -type f -name "*.jpg" | grep -i "${names.join('\\|')}" 2>/dev/null; echo "DONE"`;
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let out = '';
    stream.on('data', d => { out += d; process.stdout.write(d.toString()); });
    stream.stderr.on('data', () => {});
    stream.on('close', () => { conn.end(); });
  });
});
conn.on('error', e => console.error('SSH error:', e.message));
conn.connect({ host: '138.197.174.208', port: 22, username: 'agent-1', password: '7XKjj*ADJ9tqP!D' });

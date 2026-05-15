function mapStatus(rStatusRaw: any) {
    const normalizeStatus = (raw: any): string | number => {
        if (!raw) return '';
        if (typeof raw === 'object') {
            return raw.name || raw.id || '';
        }
        return raw;
    };

    const normalizedRaw = normalizeStatus(rStatusRaw);
    const s = typeof normalizedRaw === 'string' ? normalizedRaw.toLowerCase() : normalizedRaw;
    
    let status = 'pending';
    if ([1, 2, 'concept', 'option', 'demande', 'inquiry', 'open', 'draft', 'pending'].includes(s)) {
        status = 'pending';
    } else if ([3, 4, 5, 6, 'confirmed', 'confirmé', 'accepted', 'prêt', 'ready', 'en location', 'in use', 'retour', 'returned', 'converted'].includes(s)) {
        status = 'confirmed';
    } else if ([7, 8, 'cancelled', 'canceled', 'annulé', 'annulée', 'denied', 'refused'].includes(s)) {
        status = 'denied';
    } else if (typeof s === 'string' && s.includes('confirmed')) {
        status = 'confirmed';
    }
    return status;
}

const tests = [
    { input: 'Concept', expected: 'pending' },
    { input: 'Option', expected: 'pending' },
    { input: 'Demande', expected: 'pending' },
    { input: 'Confirmé', expected: 'confirmed' },
    { input: 'Prêt', expected: 'confirmed' },
    { input: 'En location', expected: 'confirmed' },
    { input: 'Retour', expected: 'confirmed' },
    { input: 'Annulé', expected: 'denied' },
    { input: 1, expected: 'pending' },
    { input: 3, expected: 'confirmed' },
    { input: 4, expected: 'confirmed' },
    { input: 7, expected: 'denied' },
    { input: 'accepted', expected: 'confirmed' },
    { input: 'converted', expected: 'confirmed' },
    { input: 'Canceled', expected: 'denied' },
    { input: { id: 7, name: 'Canceled' }, expected: 'denied' },
    { input: { id: 3, name: 'Confirmed' }, expected: 'confirmed' },
    { input: 'Annulée', expected: 'denied' },
];

console.log('Testing status mapping logic:');
let passed = 0;
tests.forEach(t => {
    const result = mapStatus(t.input);
    const isOk = result === t.expected;
    const inputStr = typeof t.input === 'object' ? JSON.stringify(t.input) : `"${t.input}"`;
    console.log(`${isOk ? '✅' : '❌'} Input: ${inputStr} -> Result: "${result}" (Expected: "${t.expected}")`);
    if (isOk) passed++;
});

console.log(`\nPassed ${passed}/${tests.length} tests.`);

export const mockMetrics = {
  totalStorageGB: 842,
  activeVaults: 18,
  apiCallsPerDay: 132004,
  avgLatencyMs: 81,
  usageSeries: [
    { date: 'Mon', value: 620 },
    { date: 'Tue', value: 680 },
    { date: 'Wed', value: 702 },
    { date: 'Thu', value: 740 },
    { date: 'Fri', value: 810 },
    { date: 'Sat', value: 825 },
    { date: 'Sun', value: 842 }
  ]
};

export const mockAlerts = [
  { id: 'AL-201', title: 'Grant expiring in 12 hours', severity: 'warning', time: '8m ago' },
  { id: 'AL-199', title: 'Unusual access pattern detected', severity: 'danger', time: '22m ago' },
  { id: 'AL-180', title: 'On-chain validator latency spike', severity: 'warning', time: '1h ago' }
];

export const mockRecords = [
  { id: 'RC-901', owner: 'alpha-user', scope: 'profile:email', status: 'active', updated: '2m ago' },
  { id: 'RC-883', owner: 'gpt-agent', scope: 'memory:long', status: 'active', updated: '8m ago' },
  { id: 'RC-866', owner: 'vault-runner', scope: 'policy:grant', status: 'revoked', updated: '14m ago' }
];

export const mockVaults = [
  { id: 'VA-102', owner: 'alpha-user', region: 'us-east', storageGB: 42, status: 'healthy' },
  { id: 'VA-103', owner: 'beta-team', region: 'eu-west', storageGB: 78, status: 'healthy' },
  { id: 'VA-104', owner: 'agent-ops', region: 'ap-south', storageGB: 18, status: 'degraded' }
];

export const mockAudit = [
  { id: 'AU-771', actor: 'policy-engine', action: 'grant_created', detail: 'scope_hash: profile:email', time: '5m ago' },
  { id: 'AU-772', actor: 'vault-service', action: 'vault_initialized', detail: 'owner: alpha-user', time: '12m ago' },
  { id: 'AU-773', actor: 'policy-engine', action: 'grant_revoked', detail: 'scope_hash: policy:grant', time: '32m ago' }
];

export const mockPlaybooks = [
  {
    id: 'PB-204',
    name: 'Grant leakage containment',
    trigger: 'Risk score > 0.82',
    owner: 'policy-engine',
    status: 'healthy',
    lastRun: '11m ago',
    steps: ['Quarantine grant', 'Snapshot vault', 'Notify owner']
  },
  {
    id: 'PB-207',
    name: 'Vault integrity check',
    trigger: 'Integrity drift > 2%',
    owner: 'vault-service',
    status: 'healthy',
    lastRun: '24m ago',
    steps: ['Run attestation', 'Rotate keys', 'Escalate if failed']
  },
  {
    id: 'PB-211',
    name: 'API throttle guard',
    trigger: 'Burst > 4k/min',
    owner: 'edge-router',
    status: 'warning',
    lastRun: '45m ago',
    steps: ['Apply rate limit', 'Warm standby', 'Open incident']
  }
];

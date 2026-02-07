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
  {
    id: 'RC-901',
    owner: 'alpha-user',
    scope: 'profile:email',
    status: 'active',
    updated: '2m ago',
    grantee: 'vault-summarizer'
  },
  {
    id: 'RC-883',
    owner: 'gpt-agent',
    scope: 'memory:long',
    status: 'active',
    updated: '8m ago',
    grantee: 'insight-bot'
  },
  {
    id: 'RC-866',
    owner: 'vault-runner',
    scope: 'policy:grant',
    status: 'revoked',
    updated: '14m ago',
    grantee: 'policy-engine'
  }
];

export const mockRecordDetails = {
  'RC-901': {
    policyNote: 'PII encrypted at rest. Access limited to redact pipeline + audit bot.',
    activity: ['Grant validated · 2m ago', 'Accessed by agent: vault-summarizer · 6m ago', 'Rotation check · 14m ago']
  },
  'RC-883': {
    policyNote: 'Long-term memory shard guarded by threshold signatures.',
    activity: ['Grant validated · 8m ago', 'Accessed by agent: insight-bot · 12m ago', 'Policy attestation · 28m ago']
  },
  'RC-866': {
    policyNote: 'Revoked after policy drift. Pending reissue on owner approval.',
    activity: ['Revoked by policy-engine · 14m ago', 'Alert sent to owner · 18m ago', 'Audit logged · 26m ago']
  }
};

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

export const mockUsage = {
  monthlyBurn: 64.2,
  egressTB: 19.4,
  retentionDays: 180,
  breakdown: [
    { label: 'Encrypted storage', cost: 28.5, share: 0.44 },
    { label: 'Vector sync + compute', cost: 21.7, share: 0.34 },
    { label: 'Edge relay + CDN', cost: 9.4, share: 0.15 },
    { label: 'On-chain attestations', cost: 4.6, share: 0.07 }
  ],
  topTenants: [
    { id: 'TN-44', name: 'Helios Labs', scope: 'cross-agent memory', region: 'us-east', spend: 18.2, storageTB: 5.4 },
    { id: 'TN-29', name: 'Riven Capital', scope: 'market analytics', region: 'eu-west', spend: 14.9, storageTB: 4.1 },
    { id: 'TN-31', name: 'Orbit Health', scope: 'clinical triage', region: 'ap-south', spend: 11.6, storageTB: 3.2 }
  ],
  optimization: [
    { id: 'OP-9', title: 'Cache hot vault slices', priority: 'critical', detail: 'Projected 12% savings on edge egress.' },
    { id: 'OP-11', title: 'Tier cold vaults', priority: 'warning', detail: 'Move 4 tenants to glacier tier after 45 days.' },
    { id: 'OP-15', title: 'Batch grant sync', priority: 'warning', detail: 'Reduce attestation overhead by 18%.' }
  ],
  trend: [
    { label: 'Aug', spend: 52.4 },
    { label: 'Sep', spend: 56.8 },
    { label: 'Oct', spend: 59.3 },
    { label: 'Nov', spend: 61.7 },
    { label: 'Dec', spend: 63.9 },
    { label: 'Jan', spend: 64.2 }
  ],
  forecast: [
    { label: 'Feb', spend: 66.1, risk: 'steady' },
    { label: 'Mar', spend: 68.4, risk: 'warning' },
    { label: 'Apr', spend: 71.2, risk: 'warning' }
  ],
  anomalies: [
    {
      id: 'AN-7',
      title: 'Egress spike on Riven Capital',
      detail: 'Usage jumped 38% after nightly batch window.',
      impact: 'Est. +$4.8k/month',
      status: 'investigating'
    },
    {
      id: 'AN-9',
      title: 'Atlas Studio retention drift',
      detail: 'Retention policy exceeded 210 days on EU vaults.',
      impact: 'Compliance risk',
      status: 'needs review'
    }
  ]
};

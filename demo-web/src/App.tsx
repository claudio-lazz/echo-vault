import './index.css';

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Overview } from './components/Overview';
import { DemoFlow } from './components/DemoFlow';
import { Vaults } from './components/Vaults';
import { Records } from './components/Records';
import { Alerts } from './components/Alerts';
import { Audit } from './components/Audit';
import { Settings } from './components/Settings';
import { AccessGrants } from './components/AccessGrants';
import { Playbooks } from './components/Playbooks';
import { Usage } from './components/Usage';
import { DataModeProvider } from './lib/dataMode';

const pages: Record<string, React.ReactNode> = {
  overview: <Overview />,
  demo: <DemoFlow />,
  vaults: <Vaults />,
  records: <Records />,
  alerts: <Alerts />,
  audit: <Audit />,
  grants: <AccessGrants />,
  playbooks: <Playbooks />,
  usage: <Usage />,
  settings: <Settings />
};

const pageTitles: Record<string, string> = {
  overview: 'Overview',
  demo: 'Demo Flow',
  vaults: 'Vaults',
  records: 'Records',
  alerts: 'Alerts',
  audit: 'Audit Trail',
  grants: 'Access Grants',
  playbooks: 'Playbooks',
  usage: 'Usage & Spend',
  settings: 'Settings'
};

function App() {
  const [active, setActive] = useState('overview');

  return (
    <DataModeProvider>
      <div className="min-h-screen bg-[#0f1117] text-[#f4f6fa]">
        <div className="flex h-screen">
          <Sidebar active={active} onSelect={setActive} />
          <main className="flex-1 overflow-auto">
            <TopBar title={pageTitles[active]} />
            {pages[active]}
          </main>
        </div>
      </div>
    </DataModeProvider>
  );
}

export default App;

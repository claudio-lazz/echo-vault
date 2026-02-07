import './index.css';

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Overview } from './components/Overview';
import { Vaults } from './components/Vaults';
import { Records } from './components/Records';
import { Alerts } from './components/Alerts';
import { Audit } from './components/Audit';
import { Settings } from './components/Settings';

const pages: Record<string, React.ReactNode> = {
  overview: <Overview />,
  vaults: <Vaults />,
  records: <Records />,
  alerts: <Alerts />,
  audit: <Audit />,
  settings: <Settings />
};

function App() {
  const [active, setActive] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f4f6fa]">
      <div className="flex h-screen">
        <Sidebar active={active} onSelect={setActive} />
        <main className="flex-1 overflow-auto">
          <TopBar />
          {pages[active]}
        </main>
      </div>
    </div>
  );
}

export default App;

import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import PreviousComponent from './components/PreviousComponent';
import NewComponent from './components/NewComponent';

type TabType = 'new' | 'previous';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('new');

  return (
    <div className="app-container">
      {/* Tabs Header */}
      <div className="tabs-header">
        <button 
          className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New Layout
        </button>
        <button 
          className={`tab-button ${activeTab === 'previous' ? 'active' : ''}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Layout
        </button>
      </div>

      {/* Main Viewport */}
      <div className="tab-viewport">
        {activeTab === 'new' ? (
          <NewComponent />
        ) : (
          <PreviousComponent />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

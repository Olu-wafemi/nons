import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiList, FiFilePlus } from 'react-icons/fi';

import ContentForm from './components/ContentForm';
import ContentList from './components/ContentList';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="App-nav">
          <ul>
            <li><Link to="/add-content"><FiFilePlus /> Add Content</Link></li>
            <li><Link to="/content-management"><FiList /> Content Management</Link></li>
          </ul>
        </nav>
        <div className="App-content">
          <Routes>
            <Route path="/content-management" element={<ContentList />} />
            <Route path="/add-content" element={<ContentForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default withAuthenticator(App);

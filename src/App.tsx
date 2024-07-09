import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import EditFolder from './components/EditFolder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit-folder/:id" element={<EditFolder />} />
      </Routes>
    </Router>
  );
}

export default App;

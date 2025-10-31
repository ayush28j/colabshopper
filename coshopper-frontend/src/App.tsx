import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// Pages
import Home from './pages/home/home';
import FAQ from './pages/faq/FAQ';
import PrivacyPolicy from './pages/privacy-policy/PrivacyPolicy';
import ListPage from './pages/list/ListPage';
import MyLists from './pages/my-lists/MyLists';
import MyProfile from './pages/my-profile/MyProfile';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/list/:listId" element={<ListPage />} />
            <Route path="/my-lists" element={<MyLists />} />
            <Route path="/my-profile" element={<MyProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

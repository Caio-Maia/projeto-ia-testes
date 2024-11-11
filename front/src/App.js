import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import ImproveTaskPage from './components/ImproveTaskPage';
import GenerateTestsPage from './components/GenerateTestsPage';
import Footer from './components/Footer';
import Header from './components/Header';
import TokenDialog from './components/TokenDialog';
import PromptPage from './components/PromptPage';

function App() {

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Verificar se os tokens já estão no localStorage
    const chatgpt = localStorage.getItem('chatgptToken');
    const gemini = localStorage.getItem('geminiToken');

    if (!chatgpt && !gemini) {
    // Se nenhum token estiver presente, abrir o diálogo
    setDialogOpen(true);
    }
}, []);

  return (
    <div>
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/improve-task" element={<ImproveTaskPage />} />
          <Route path="/generate-tests" element={<GenerateTestsPage />} />
          <Route path="/adjust-prompts" element={<PromptPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
    <TokenDialog open={dialogOpen} onClose={setDialogOpen} permitClose={false}/>
    </div>
  );
}

export default App;
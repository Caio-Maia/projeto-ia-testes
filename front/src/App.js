import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import HomePage from './components/HomePage';
import ImproveTaskPage from './components/ImproveTaskPage';
import GenerateTestsPage from './components/GenerateTestsPage';
import CodeGenerationPage from './components/CodeGenerationPage';
import RiskAnalysisPage from './components/RiskAnalysisPage';
import FeedbackDashboard from './components/FeedbackDashboard';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import TokenDialog from './components/TokenDialog';
import PromptPage from './components/PromptPage';
import EducationModeToggle from './components/EducationModeToggle';
import './App.css';
import './styles/global.css';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Verificar se os tokens já estão no localStorage
    const chatgpt = localStorage.getItem('chatgptToken');
    const gemini = localStorage.getItem('geminiToken');

    if (!chatgpt && !gemini) {
      // Se nenhum token estiver presente, abrir o diálogo
      setDialogOpen(true);
    }
    
    // Set initial sidebar state based on screen size
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on mobile when navigating
  const handleNavigation = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app-container">
      <Router>
        <Sidebar 
          open={sidebarOpen} 
          onToggle={handleSidebarToggle} 
          isMobile={isMobile}
          onNavigate={handleNavigation}
        />
        <Box 
          component="main" 
          className={`content-area ${sidebarOpen ? 'sidebar-open' : ''}`}
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2, md: 3 },
            mt: { xs: 2, sm: 3 },
            ml: { 
              xs: 0, 
              sm: sidebarOpen ? '240px' : '65px' 
            },
            transition: 'margin-left 0.3s ease'
          }}
        >
          <div className="responsive-container">
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mb: 2,
                flexWrap: 'wrap'
              }}
            >
              <EducationModeToggle />
            </Box>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/improve-task" element={<ImproveTaskPage />} />
              <Route path="/generate-tests" element={<GenerateTestsPage />} />
              <Route path="/generate-code" element={<CodeGenerationPage />} />
              <Route path="/analyze-risks" element={<RiskAnalysisPage />} />
              <Route path="/feedback-dashboard" element={<FeedbackDashboard />} />
              <Route path="/adjust-prompts" element={<PromptPage />} />
            </Routes>
            <Footer />
          </div>
        </Box>
      </Router>
      <TokenDialog open={dialogOpen} onClose={setDialogOpen} permitClose={false}/>
    </div>
  );
}

export default App;
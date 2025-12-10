import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';
import { lightTheme, darkTheme } from './theme/themes';
import LoadingFallback from './components/LoadingFallback';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import TokenDialog from './components/TokenDialog';
import EducationModeToggle from './components/EducationModeToggle';
import LanguageSelector from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';
import './styles/global.css';

// Lazy load page components
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const HomePage = React.lazy(() => import('./components/HomePage'));
const ImproveTaskPage = React.lazy(() => import('./components/ImproveTaskPage'));
const GenerateTestsPage = React.lazy(() => import('./components/GenerateTestsPage'));
const CodeGenerationPage = React.lazy(() => import('./components/CodeGenerationPage'));
const RiskAnalysisPage = React.lazy(() => import('./components/RiskAnalysisPage'));
const FeedbackDashboard = React.lazy(() => import('./components/FeedbackDashboard'));
const TestCoverageAnalysis = React.lazy(() => import('./components/TestCoverageAnalysis'));
const DocumentationPage = React.lazy(() => import('./components/DocumentationPage'));
const PromptPage = React.lazy(() => import('./components/PromptPage'));

// Token Dialog Wrapper with navigation support
function TokenDialogWithNavigation({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = () => {
    // Redirect to /home only if coming from landing page
    if (location.pathname === '/') {
      navigate('/home');
    }
  };

  return (
    <TokenDialog 
      open={open} 
      onClose={onClose} 
      permitClose={false}
      onSuccess={handleSuccess}
    />
  );
}

function AppContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Set data-theme attribute on html element for CSS
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Set background color on body directly
    if (isDarkMode) {
      document.body.style.backgroundColor = '#0f1419';
      document.body.style.color = '#f3f4f6';
      document.documentElement.style.backgroundColor = '#0f1419';
    } else {
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#1f2937';
      document.documentElement.style.backgroundColor = '#f9fafb';
    }
  }, [isDarkMode]);

  useEffect(() => {
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

  // Open token dialog
  const handleOpenTokenDialog = (open) => {
    setDialogOpen(open);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing page - standalone without sidebar */}
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LandingPage onOpenTokenDialog={handleOpenTokenDialog} />
              </Suspense>
            } 
          />
          
          {/* App routes with sidebar */}
          <Route 
            path="/*" 
            element={
              <div className="app-container">
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
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: theme.palette.background.default,
                    minHeight: '100vh'
                  }}
                >
                  <div className="responsive-container">
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2
                      }}
                    >
                      <LanguageSelector />
                      <DarkModeToggle />
                      <EducationModeToggle />
                    </Box>
                    <Routes>
                      <Route path="/home" element={<Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>} />
                      <Route path="/improve-task" element={<Suspense fallback={<LoadingFallback />}><ImproveTaskPage /></Suspense>} />
                      <Route path="/generate-tests" element={<Suspense fallback={<LoadingFallback />}><GenerateTestsPage /></Suspense>} />
                      <Route path="/generate-code" element={<Suspense fallback={<LoadingFallback />}><CodeGenerationPage /></Suspense>} />
                      <Route path="/analyze-risks" element={<Suspense fallback={<LoadingFallback />}><RiskAnalysisPage /></Suspense>} />
                      <Route path="/feedback-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeedbackDashboard /></Suspense>} />
                      <Route path="/test-coverage" element={<Suspense fallback={<LoadingFallback />}><TestCoverageAnalysis /></Suspense>} />
                      <Route path="/documentation" element={<Suspense fallback={<LoadingFallback />}><DocumentationPage /></Suspense>} />
                      <Route path="/adjust-prompts" element={<Suspense fallback={<LoadingFallback />}><PromptPage /></Suspense>} />
                    </Routes>
                    <Footer />
                  </div>
                </Box>
              </div>
            } 
          />
        </Routes>
        <TokenDialogWithNavigation open={dialogOpen} onClose={setDialogOpen}/>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </DarkModeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
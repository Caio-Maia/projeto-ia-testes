import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage, useDarkMode } from '../stores/hooks';
import { 
  FaHome, 
  FaTasks, 
  FaClipboardList, 
  FaCode, 
  FaExclamationTriangle, 
  FaChartBar, 
  FaCog,
  FaKey,
  FaBook,
  FaChartLine
} from "react-icons/fa";
import { Box, List, ListItem, ListItemIcon, ListItemText, Tooltip, Divider, Typography, Button } from "@mui/material";
import HistoryDrawer from "./HistoryDrawer";
import TokenDialog from "./TokenDialog";
import "../App.css";

const Sidebar = ({ open, onToggle, isMobile, onNavigate }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const primaryMenuItems = [
    { path: "/home", icon: FaHome, label: t('sidebar.home') },
    { path: "/improve-task", icon: FaTasks, label: t('sidebar.improveTask') },
    { path: "/generate-tests", icon: FaClipboardList, label: t('sidebar.generateTests') },
    { path: "/generate-code", icon: FaCode, label: t('sidebar.generateCode') },
    { path: "/analyze-risks", icon: FaExclamationTriangle, label: t('sidebar.analyzeRisks') },
    { path: "/test-coverage", icon: FaChartLine, label: 'Cobertura de Testes' }
  ];

  const secondaryMenuItems = [
    { path: "/feedback-dashboard", icon: FaChartBar, label: t('sidebar.feedbackDashboard') },
    { path: "/documentation", icon: FaBook, label: t('sidebar.documentation') || 'Documentation' },
    { path: "/adjust-prompts", icon: FaCog, label: t('sidebar.adjustPrompts') }
  ];

  const handleItemClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleSidebarClick = (e) => {
    // Only toggle if clicking on the sidebar background, not on menu items
    if (e.target === e.currentTarget) {
      onToggle();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <Box
        className={`sidebar-drawer ${open ? "open" : "closed"}`}
        onClick={handleSidebarClick}
        sx={{
          width: open ? (isMobile ? '100%' : '240px') : '65px',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: isDarkMode ? '#1a202c' : '#f3f4f6',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
          borderRadius: '0 8px 8px 0',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box 
          className="sidebar-header"
          sx={{
            backgroundColor: isDarkMode ? '#0f1419' : '#e5e7eb',
            borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
            flexShrink: 0
          }}
        >
          {open && (
            <span className="sidebar-title" style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>AITest Hub</span>
          )}
          <div className="sidebar-logo">⚡</div>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: isDarkMode ? '#0f1419' : '#e5e7eb'
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDarkMode ? '#374151' : '#d1d5db',
              borderRadius: '3px',
              '&:hover': {
                background: isDarkMode ? '#4b5563' : '#bfdbfe'
              }
            }
          }}
        >
          {/* Primary Navigation Items */}
          <List sx={{ pt: 2, px: 1 }}>
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <ListItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={handleItemClick}
                  sx={{
                    minHeight: 48,
                    px: 2,
                    mx: 0.5,
                    borderRadius: '6px',
                    mb: 0.5,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: isActive ? '#3b82f6' : (isDarkMode ? '#d1d5db' : '#6b7280'),
                    textDecoration: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6',
                      transform: 'translateX(3px)'
                    },
                    transition: '0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit'
                    }}
                  >
                    <Tooltip title={!open ? item.label : ""} placement="right">
                      <Icon size={20} />
                    </Tooltip>
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.label}
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: isActive ? 600 : 400,
                          color: 'inherit'
                        }
                      }}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>

          {/* Divider */}
          {open && (
            <Box sx={{ px: 2, py: 1 }}>
              <Divider sx={{ backgroundColor: isDarkMode ? '#374151' : '#d1d5db' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isDarkMode ? '#6b7280' : '#9ca3af', 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mt: 1,
                  display: 'block'
                }}
              >
                {t('common.settings')}
              </Typography>
            </Box>
          )}

          {/* Secondary Navigation Items */}
          <List sx={{ pt: open ? 1 : 2, px: 1 }}>
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <ListItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={handleItemClick}
                  sx={{
                    minHeight: 48,
                    px: 2,
                    mx: 0.5,
                    borderRadius: '6px',
                    mb: 0.5,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: isActive ? '#3b82f6' : (isDarkMode ? '#d1d5db' : '#6b7280'),
                    textDecoration: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6',
                      transform: 'translateX(3px)'
                    },
                    transition: '0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit'
                    }}
                  >
                    <Tooltip title={!open ? item.label : ""} placement="right">
                      <Icon size={20} />
                    </Tooltip>
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.label}
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: isActive ? 600 : 400,
                          color: 'inherit'
                        }
                      }}
                    />
                  )}
                </ListItem>
              );
            })}
            
            {/* History component integrated into sidebar */}
            <HistoryDrawer inSidebar={true} open={open} sidebarOpen={open} />
          </List>
        </Box>

        {/* Token Configuration Button - Fixed at bottom */}
        <Box sx={{ 
          px: 1, 
          py: 2, 
          borderTop: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
          flexShrink: 0,
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <Tooltip title={!open ? t('common.tokens') || 'API Tokens' : ""} placement="right">
            <Button
              variant={open ? "contained" : "text"}
              color="primary"
              onClick={() => setTokenDialogOpen(true)}
              startIcon={open ? <FaKey size={16} /> : undefined}
              sx={{
                minHeight: 48,
                minWidth: open ? 'auto' : 48,
                px: open ? 2 : 0,
                borderRadius: '6px',
                background: open ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                color: open ? '#fff' : '#d1d5db',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: open ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  boxShadow: open ? '0 10px 24px rgba(59, 130, 246, 0.15)' : 'none',
                  transition: '0.2s ease-in-out'
                },
                transition: '0.2s ease-in-out',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {!open ? (
                <FaKey size={20} />
              ) : t('common.tokens')}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* TokenDialog Component */}
      <TokenDialog 
        open={tokenDialogOpen} 
        onClose={() => setTokenDialogOpen(false)}
        permitClose={true}
      />

      {/* Overlay for mobile */}
      {isMobile && open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100
          }}
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
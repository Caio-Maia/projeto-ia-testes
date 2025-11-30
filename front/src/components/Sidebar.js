import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaTasks, 
  FaClipboardList, 
  FaCode, 
  FaExclamationTriangle, 
  FaChartBar, 
  FaCog
} from "react-icons/fa";
import { Box, List, ListItem, ListItemIcon, ListItemText, Tooltip, Divider, Typography } from "@mui/material";
import HistoryDrawer from "./HistoryDrawer";
import "../App.css";

const Sidebar = ({ open, onToggle, isMobile, onNavigate }) => {
  const location = useLocation();

  const primaryMenuItems = [
    { path: "/", icon: FaHome, label: "Início" },
    { path: "/improve-task", icon: FaTasks, label: "Melhorar Tarefa" },
    { path: "/generate-tests", icon: FaClipboardList, label: "Gerar Casos de Teste" },
    { path: "/generate-code", icon: FaCode, label: "Gerar Código" },
    { path: "/analyze-risks", icon: FaExclamationTriangle, label: "Análise de Riscos" }
  ];

  const secondaryMenuItems = [
    { path: "/feedback-dashboard", icon: FaChartBar, label: "Dashboard Feedback" },
    { path: "/adjust-prompts", icon: FaCog, label: "Ajustar Prompts" }
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
          backgroundColor: '#2c3e50',
          boxShadow: '0 2px 12px rgba(50, 71, 101, 0.08)',
          borderRadius: '0 12px 12px 0',
          zIndex: 1200,
          overflow: 'hidden',
          cursor: open ? 'default' : 'pointer'
        }}
      >
        {/* Header */}
        <Box 
          className="sidebar-header"
          sx={{
            backgroundColor: '#34495e',
            borderBottom: '1px solid #3d566e'
          }}
        >
          {open && (
            <span className="sidebar-title">Task & Test Generator</span>
          )}
          <div className="sidebar-logo">⚡</div>
        </Box>

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
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: isActive ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
                  color: isActive ? '#3498db' : '#ecf0f1',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.15)',
                    color: '#3498db',
                    transform: 'translateX(3px)'
                  },
                  transition: 'all 0.2s ease'
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
            <Divider sx={{ backgroundColor: '#3d566e' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#95a5a6', 
                fontSize: '0.75rem',
                fontWeight: 500,
                mt: 1,
                display: 'block'
              }}
            >
              CONFIGURAÇÕES
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
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: isActive ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
                  color: isActive ? '#3498db' : '#ecf0f1',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.15)',
                    color: '#3498db',
                    transform: 'translateX(3px)'
                  },
                  transition: 'all 0.2s ease'
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
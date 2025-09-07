import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaTasks, 
  FaClipboardList, 
  FaCode, 
  FaExclamationTriangle, 
  FaChartBar, 
  FaCog, 
  FaBars 
} from "react-icons/fa";
import { Box, List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip } from "@mui/material";
import HistoryDrawer from "./HistoryDrawer";
import "../App.css";

const Sidebar = ({ open, onToggle, isMobile, onNavigate }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: FaHome, label: "Início" },
    { path: "/improve-task", icon: FaTasks, label: "Melhorar Tarefa" },
    { path: "/generate-tests", icon: FaClipboardList, label: "Gerar Casos de Teste" },
    { path: "/generate-code", icon: FaCode, label: "Gerar Código" },
    { path: "/analyze-risks", icon: FaExclamationTriangle, label: "Análise de Riscos" },
    { path: "/feedback-dashboard", icon: FaChartBar, label: "Dashboard Feedback" },
    { path: "/adjust-prompts", icon: FaCog, label: "Ajustar Prompts" }
  ];

  const handleItemClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <IconButton
        className="toggle-sidebar-btn"
        onClick={onToggle}
        sx={{
          position: 'fixed',
          left: open ? (isMobile ? (isMobile && open ? '90%' : '250px') : '250px') : '10px',
          top: '15px',
          zIndex: 1300,
          backgroundColor: '#406cfa !important',
          color: '#fff !important',
          '&:hover': {
            backgroundColor: '#3558b9 !important',
          }
        }}
      >
        <FaBars />
      </IconButton>

      {/* Sidebar */}
      <Box
        className={`sidebar-drawer ${open ? "open" : "closed"}`}
        sx={{
          width: open ? (isMobile ? '100%' : '240px') : '65px',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: '0 2px 12px rgba(50, 71, 101, 0.08)',
          borderRadius: '0 12px 12px 0',
          zIndex: 1200,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box className="sidebar-header">
          {open && (
            <span className="sidebar-title">Task & Test Generator</span>
          )}
          <div className="sidebar-logo">⚡</div>
        </Box>

        {/* Navigation Items */}
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => {
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
                  px: 2.5,
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: isActive ? 'rgba(64, 108, 250, 0.1)' : 'transparent',
                  color: isActive ? '#406cfa' : '#232b33',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(64, 108, 250, 0.1)',
                    color: '#406cfa',
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
                        fontWeight: isActive ? 600 : 400
                      }
                    }}
                  />
                )}
              </ListItem>
            );
          })}
          
          {/* History component integrated into sidebar */}
          <HistoryDrawer inSidebar={true} open={open} />
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
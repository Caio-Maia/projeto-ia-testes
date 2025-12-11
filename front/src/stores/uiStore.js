/**
 * UI Store - Zustand
 * 
 * Gerencia estado da interface do usuário.
 * Controla modais, drawers, notificações, etc.
 * 
 * @example
 * import { useUIStore } from '../stores/uiStore';
 * 
 * function Component() {
 *   const openTokenDialog = useUIStore((state) => state.openTokenDialog);
 *   openTokenDialog();
 * }
 */

import { create } from 'zustand';

/**
 * Store de UI (não persistido)
 */
export const useUIStore = create((set, get) => ({
  // ============================================
  // Estado
  // ============================================
  
  /** Dialog de token aberto */
  tokenDialogOpen: false,
  
  /** Provider do dialog de token */
  tokenDialogProvider: null,
  
  /** Drawer de histórico aberto */
  historyDrawerOpen: false,
  
  /** Notificações */
  notifications: [],
  
  /** Loading global */
  globalLoading: false,
  
  /** Mensagem de loading */
  loadingMessage: '',
  
  /** Sidebar expandida */
  sidebarExpanded: true,
  
  /** Página ativa (para mobile) */
  activePage: 'home',
  
  // ============================================
  // Token Dialog
  // ============================================
  
  /**
   * Abre dialog de token
   * @param {string} provider - Provider para configurar
   */
  openTokenDialog: (provider = null) => set({
    tokenDialogOpen: true,
    tokenDialogProvider: provider,
  }),
  
  /**
   * Fecha dialog de token
   */
  closeTokenDialog: () => set({
    tokenDialogOpen: false,
    tokenDialogProvider: null,
  }),
  
  // ============================================
  // History Drawer
  // ============================================
  
  /**
   * Abre drawer de histórico
   */
  openHistoryDrawer: () => set({ historyDrawerOpen: true }),
  
  /**
   * Fecha drawer de histórico
   */
  closeHistoryDrawer: () => set({ historyDrawerOpen: false }),
  
  /**
   * Alterna drawer de histórico
   */
  toggleHistoryDrawer: () => set((state) => ({
    historyDrawerOpen: !state.historyDrawerOpen,
  })),
  
  // ============================================
  // Notifications
  // ============================================
  
  /**
   * Adiciona notificação
   * @param {Object} notification - { type, message, duration? }
   * @returns {string} ID da notificação
   */
  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 5000,
      createdAt: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-remove após duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  /**
   * Remove notificação
   * @param {string} id
   */
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  
  /**
   * Limpa todas as notificações
   */
  clearNotifications: () => set({ notifications: [] }),
  
  /**
   * Atalhos para tipos de notificação
   */
  notifySuccess: (message, duration) => 
    get().addNotification({ type: 'success', message, duration }),
  
  notifyError: (message, duration) => 
    get().addNotification({ type: 'error', message, duration: duration || 8000 }),
  
  notifyWarning: (message, duration) => 
    get().addNotification({ type: 'warning', message, duration }),
  
  notifyInfo: (message, duration) => 
    get().addNotification({ type: 'info', message, duration }),
  
  // ============================================
  // Loading
  // ============================================
  
  /**
   * Mostra loading global
   * @param {string} message - Mensagem opcional
   */
  showLoading: (message = 'Carregando...') => set({
    globalLoading: true,
    loadingMessage: message,
  }),
  
  /**
   * Esconde loading global
   */
  hideLoading: () => set({
    globalLoading: false,
    loadingMessage: '',
  }),
  
  // ============================================
  // Sidebar
  // ============================================
  
  /**
   * Alterna sidebar
   */
  toggleSidebar: () => set((state) => ({
    sidebarExpanded: !state.sidebarExpanded,
  })),
  
  /**
   * Define estado da sidebar
   * @param {boolean} expanded
   */
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  
  // ============================================
  // Navigation
  // ============================================
  
  /**
   * Define página ativa
   * @param {string} page
   */
  setActivePage: (page) => set({ activePage: page }),
}));

/**
 * Selectors otimizados
 */
export const uiSelectors = {
  tokenDialogOpen: (state) => state.tokenDialogOpen,
  historyDrawerOpen: (state) => state.historyDrawerOpen,
  notifications: (state) => state.notifications,
  globalLoading: (state) => state.globalLoading,
  sidebarExpanded: (state) => state.sidebarExpanded,
};

export default useUIStore;

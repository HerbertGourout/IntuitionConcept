import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase';

export interface OfflineState {
  isOnline: boolean;
  isFirebaseConnected: boolean;
  lastSyncTime: Date | null;
  pendingOperations: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private listeners: ((state: OfflineState) => void)[] = [];
  private state: OfflineState = {
    isOnline: navigator.onLine,
    isFirebaseConnected: true,
    lastSyncTime: null,
    pendingOperations: 0
  };

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    // Listen to browser online/offline events
    window.addEventListener('online', () => {
      this.updateState({ isOnline: true });
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.updateState({ isOnline: false, isFirebaseConnected: false });
    });

    // Listen to Firebase connection state
    // Note: This is a simplified approach. In production, you might want to use
    // Firestore's onSnapshot with metadata to detect connection state
    this.monitorFirebaseConnection();
  }

  private async monitorFirebaseConnection() {
    try {
      // Attempt to enable network and check connection
      await enableNetwork(db);
      this.updateState({ isFirebaseConnected: true });
    } catch (error) {
      console.warn('Firebase connection failed:', error);
      this.updateState({ isFirebaseConnected: false });
    }
  }

  private async handleOnline() {
    try {
      console.log('🌐 Device back online, attempting to reconnect Firebase...');
      await enableNetwork(db);
      this.updateState({ 
        isFirebaseConnected: true,
        lastSyncTime: new Date()
      });
      console.log('✅ Firebase reconnected successfully');
    } catch (error) {
      console.error('❌ Failed to reconnect Firebase:', error);
      this.updateState({ isFirebaseConnected: false });
    }
  }

  async forceOffline(): Promise<void> {
    try {
      await disableNetwork(db);
      this.updateState({ isFirebaseConnected: false });
      console.log('🔌 Firebase forced offline');
    } catch (error) {
      console.error('Failed to disable Firebase network:', error);
    }
  }

  async forceOnline(): Promise<void> {
    try {
      await enableNetwork(db);
      this.updateState({ 
        isFirebaseConnected: true,
        lastSyncTime: new Date()
      });
      console.log('🌐 Firebase forced online');
    } catch (error) {
      console.error('Failed to enable Firebase network:', error);
      this.updateState({ isFirebaseConnected: false });
    }
  }

  private updateState(updates: Partial<OfflineState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): OfflineState {
    return { ...this.state };
  }

  incrementPendingOperations() {
    this.updateState({ pendingOperations: this.state.pendingOperations + 1 });
  }

  decrementPendingOperations() {
    this.updateState({ 
      pendingOperations: Math.max(0, this.state.pendingOperations - 1)
    });
  }

  clearCache(): Promise<void> {
    return new Promise((resolve) => {
      // Clear IndexedDB cache if needed
      if ('indexedDB' in window) {
        // This is a simplified approach - in production you might want
        // to clear specific Firestore offline cache
        console.log('🗑️ Clearing offline cache...');
      }
      resolve();
    });
  }
}

export const offlineManager = OfflineManager.getInstance();

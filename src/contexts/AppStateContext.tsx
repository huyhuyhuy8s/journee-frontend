import React, {createContext, type ReactNode, useContext, useState} from 'react';

interface AppState {
  isLoading: boolean;
  error: string | null;
  loadingMessage?: string;
}

interface AppStateContextType {
  appState: AppState;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  showLoadingWithMessage: (message: string) => void;
  hideLoading: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    console.error('❌ useAppState: No context found!'); // 🆕 Add debug
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
}) => {
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    error: null,
    loadingMessage: undefined,
  });

  const setLoading = (loading: boolean, message?: string) => {
    setAppState((prev) => ({
      ...prev,
      isLoading: loading,
      loadingMessage: loading ? message : undefined,
    }));
  };

  const setError = (error: string | null) => {
    setAppState((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }));
  };

  const clearError = () => {
    setAppState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  const showLoadingWithMessage = (message: string) => {
    setLoading(true, message);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <AppStateContext.Provider
      value={{
        appState,
        setLoading,
        setError,
        clearError,
        showLoadingWithMessage,
        hideLoading,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// Convenience hooks for specific states
export const useIsLoading = () => {
  const {appState} = useAppState();
  return appState.isLoading;
};

export const useError = () => {
  const {appState} = useAppState();
  return appState.error;
};

export const useLoadingMessage = () => {
  const {appState} = useAppState();
  return appState.loadingMessage;
};

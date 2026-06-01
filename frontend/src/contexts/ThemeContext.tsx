import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider } from '@arco-design/web-react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * 主题提供者组件
 * 支持浅色/深色主题切换
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // 保存主题到 localStorage
    localStorage.setItem('app-theme', theme);

    // 设置 HTML 属性以支持 CSS 变量
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Arco Design 主题配置
  const arcoTheme = theme === 'dark'
    ? {
        // 深色主题配置
        primaryColor: '#3b82f6',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        errorColor: '#ef4444',
        infoColor: '#3b82f6',
      }
    : {
        // 浅色主题配置
        primaryColor: '#165dff',
        successColor: '#00b42a',
        warningColor: '#ff7d00',
        errorColor: '#f53f3f',
        infoColor: '#165dff',
      };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ConfigProvider theme={arcoTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题上下文
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

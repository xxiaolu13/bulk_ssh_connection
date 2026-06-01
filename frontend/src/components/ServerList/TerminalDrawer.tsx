import React, { useEffect, useRef } from 'react';
import { Drawer } from '@arco-design/web-react';
import { IconCommand } from '@arco-design/web-react/icon';
import type { Server } from '../../types';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

/**
 * 终端抽屉组件属性
 */
interface TerminalDrawerProps {
  visible: boolean;
  server: Server | null;
  onClose: () => void;
}

/**
 * 终端抽屉组件
 */
export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  visible,
  server,
  onClose,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (visible && terminalRef.current && server) {
      // 创建终端实例
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#d4d4d4',
          cursorAccent: '#1e1e1e',
          black: '#2e2e2e',
          red: '#f44747',
          green: '#4cd964',
          yellow: '#ffcc02',
          blue: '#00a0f1',
          magenta: '#bd8bff',
          cyan: '#05f1f5',
          white: '#f1f1f0',
          brightBlack: '#535353',
          brightRed: '#ff3b30',
          brightGreen: '#00d26a',
          brightYellow: '#ffcc00',
          brightBlue: '#00a0f2',
          brightMagenta: '#bd8bff',
          brightCyan: '#05f1f5',
          brightWhite: '#f1f1f0',
        },
      });

      // 创建适应插件
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      // 打开终端
      terminal.open(terminalRef.current);
      fitAddon.fit();

      // 欢迎信息
      terminal.writeln('\x1b[1;32mWelcome to Bulk SSH Terminal\x1b[0m');
      terminal.writeln(`\x1b[1;33mServer: ${server.name || server.ip}\x1b[0m`);
      terminal.writeln(`\x1b[1;36mUser: ${server.ssh_user}\x1b[0m`);
      terminal.writeln('\x1b[2mNote: This is a demo terminal. Use "Batch Terminal" for actual command execution.\x1b[0m');
      terminal.writeln('');

      // 提示符
      const prompt = () => {
        terminal.write('\r\n$ ');
      };
      prompt();

      // 保存引用
      terminalInstanceRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // 处理键盘输入
      let input = '';
      terminal.onKey(({ key, domEvent }) => {
        const charCode = key.charCodeAt(0);

        if (charCode === 13) {
          // Enter 键
          terminal.write('\r\n');
          // 这里可以添加命令执行逻辑
          input = '';
          prompt();
        } else if (charCode === 127) {
          // Backspace 键
          if (input.length > 0) {
            input = input.slice(0, -1);
            terminal.write('\b \b');
          }
        } else if (!domEvent.ctrlKey && !domEvent.metaKey) {
          // 普通字符
          input += key;
          terminal.write(key);
        }
      });

      // 处理窗口大小变化
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.dispose();
        terminalInstanceRef.current = null;
        fitAddonRef.current = null;
      };
    }
  }, [visible, server]);

  return (
    <Drawer
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCommand />
          {server?.name || server?.ip} - 终端
        </span>
      }
      width={800}
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      <div
        ref={terminalRef}
        style={{
          height: 'calc(100vh - 120px)',
          backgroundColor: '#1e1e1e',
          borderRadius: 4,
        }}
      />
    </Drawer>
  );
};

export default TerminalDrawer;

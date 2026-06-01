import React from 'react';
import type { ReactNode } from 'react';

/**
 * 代码块组件
 * 属性：
 * - children: 代码内容
 * - language: 编程语言（用于语法高亮提示）
 * - showLineNumbers: 是否显示行号
 */
interface CodeBlockProps {
  children: string | ReactNode;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string | number;
  style?: React.CSSProperties;
}

/**
 * 代码块组件
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language,
  showLineNumbers = false,
  maxHeight,
  style = {},
}) => {
  const content = typeof children === 'string' ? children : '';

  return typeof children === 'string' ? (
    <pre
      style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: 16,
        borderRadius: 4,
        overflow: 'auto',
        fontFamily: 'Consolas, Monaco, Courier New, monospace',
        fontSize: 13,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        lineHeight: 1.6,
        maxHeight: maxHeight || '500px',
        margin: 0,
        ...style,
      }}
    >
      {content || '(无输出)'}
    </pre>
  ) : (
    <div style={style}>{children}</div>
  );
};

export default CodeBlock;

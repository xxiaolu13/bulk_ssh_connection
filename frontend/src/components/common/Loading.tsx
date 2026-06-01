import React from 'react';
import { Spin } from '@arco-design/web-react';

interface LoadingProps {
  /**
   * 加载文字
   */
  tip?: React.ReactNode;
  /**
   * 加载图标大小
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 是否全屏遮罩
   */
  fullscreen?: boolean;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * Loading 加载组件
 *
 * @example
 * // 基础用法
 * <Loading />
 *
 * // 带提示文字
 * <Loading tip="加载中..." />
 *
 * // 全屏遮罩
 * <Loading fullscreen tip="正在加载..." />
 */
export const Loading: React.FC<LoadingProps> = ({
  tip,
  size = 'medium',
  fullscreen = false,
  style = {},
  className = '',
}) => {
  const wrapperStyle: React.CSSProperties = {
    ...style,
  };

  if (fullscreen) {
    wrapperStyle.position = 'fixed';
    wrapperStyle.top = '0';
    wrapperStyle.left = '0';
    wrapperStyle.right = '0';
    wrapperStyle.bottom = '0';
    wrapperStyle.zIndex = '9999';
    wrapperStyle.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    wrapperStyle.display = 'flex';
    wrapperStyle.alignItems = 'center';
    wrapperStyle.justifyContent = 'center';
  }

  return (
    <div className={`loading-wrapper ${className}`} style={wrapperStyle}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default Loading;

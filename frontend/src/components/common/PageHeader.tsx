import React from 'react';
import { Breadcrumb, Button, Space } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import type { ReactNode } from 'react';
import '../../styles/components/PageHeader.css';

const BreadcrumbItem = Breadcrumb.Item;

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /**
   * 面包屑文本
   */
  label: ReactNode;
  /**
   * 面包屑链接（可选）
   */
  href?: string;
  /**
   * 点击回调
   */
  onClick?: () => void;
}

/**
 * 页面头部组件属性
 */
export interface PageHeaderProps {
  /**
   * 页面标题
   */
  title: ReactNode;
  /**
   * 额外内容（如按钮）
   */
  extra?: ReactNode;
  /**
   * 是否显示返回按钮
   */
  showBack?: boolean;
  /**
   * 返回按钮点击回调
   */
  onBack?: () => void;
  /**
   * 面包屑导航项
   */
  breadcrumb?: BreadcrumbItem[];
  /**
   * 页面描述
   */
  description?: ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 页面头部组件
 *
 * @example
 * // 基础用法
 * <PageHeader title="服务器列表" />
 *
 * // 带额外操作
 * <PageHeader
 *   title="服务器列表"
 *   extra={<Button type="primary">添加服务器</Button>}
 * />
 *
 * // 带面包屑和返回按钮
 * <PageHeader
 *   title="服务器详情"
 *   breadcrumb={[
 *     { label: '首页', href: '/' },
 *     { label: '服务器列表', href: '/servers' },
 *     { label: '详情' }
 *   ]}
 *   showBack
 *   onBack={() => history.back()}
 * />
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  extra,
  showBack = false,
  onBack,
  breadcrumb,
  description,
  className = '',
  style = {},
}) => {
  return (
    <div className={`page-header-enhanced ${className}`} style={style}>
      <div className="page-header-top">
        {showBack && (
          <Button
            type="text"
            icon={<IconLeft />}
            onClick={onBack}
            style={{ marginRight: 12 }}
          >
            返回
          </Button>
        )}
        <div className="page-header-title-section">
          {breadcrumb && breadcrumb.length > 0 && (
            <Breadcrumb className="page-breadcrumb" style={{ marginBottom: 8 }}>
              {breadcrumb.map((item, index) => (
                <BreadcrumbItem
                  key={index}
                  href={item.href}
                  onClick={item.onClick}
                >
                  {item.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
          <div className="page-header-title-row">
            {typeof title === 'string' ? (
              <h1 className="page-header-title">{title}</h1>
            ) : (
              <div className="page-header-title-content">{title}</div>
            )}
            {description && (
              <div className="page-header-description">{description}</div>
            )}
          </div>
        </div>
        {extra && <div className="page-header-extra">{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

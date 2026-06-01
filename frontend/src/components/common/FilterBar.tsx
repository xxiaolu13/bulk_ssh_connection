import React from 'react';
import { Card, Space, Button, Input, Select, DatePicker, Tooltip } from '@arco-design/web-react';
import { IconRefresh, IconSearch, IconDown, IconFilter } from '@arco-design/web-react/icon';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import '../../styles/components/FilterBar.css';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

/**
 * 筛选项配置
 */
export interface FilterItem {
  /**
   * 筛选项唯一标识
   */
  key: string;
  /**
   * 筛选项标签
   */
  label: string;
  /**
   * 筛选项类型
   */
  type: 'input' | 'select' | 'dateRange' | 'custom';
  /**
   * 筛选项值
   */
  value?: any;
  /**
   * 下拉选项（仅 select 类型）
   */
  options?: Array<{ label: string; value: any }>;
  /**
   * 占位符
   */
  placeholder?: string;
  /**
   * 是否支持搜索（仅 select 类型）
   */
  showSearch?: boolean;
  /**
   * 自定义渲染（仅 custom 类型）
   */
  render?: ReactNode;
  /**
   * 值变化回调
   */
  onChange?: (value: any) => void;
}

/**
 * 筛选栏组件属性
 */
export interface FilterBarProps {
  /**
   * 筛选项
   */
  filters?: FilterItem[];
  /**
   * 搜索框占位符
   */
  searchPlaceholder?: string;
  /**
   * 搜索值
   */
  searchValue?: string;
  /**
   * 搜索回调
   */
  onSearch?: (value: string) => void;
  /**
   * 刷新回调
   */
  onRefresh?: () => void;
  /**
   * 是否显示高级筛选开关
   */
  showAdvanced?: boolean;
  /**
   * 高级筛选内容
   */
  advancedContent?: ReactNode;
  /**
   * 额外操作按钮
   */
  extraActions?: ReactNode;
  /**
   * 是否紧凑模式
   */
  compact?: boolean;
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
 * 筛选栏组件
 *
 * @example
 * // 基础用法 - 带搜索框
 * <FilterBar
 *   searchPlaceholder="搜索服务器..."
 *   onSearch={(value) => console.log(value)}
 *   onRefresh={() => console.log('refresh')}
 * />
 *
 * // 带筛选项
 * <FilterBar
 *   filters={[
 *     {
 *       key: 'status',
 *       label: '状态',
 *       type: 'select',
 *       options: [
 *         { label: '在线', value: 'online' },
 *         { label: '离线', value: 'offline' },
 *       ],
 *       onChange: (value) => console.log(value),
 *     },
 *   ]}
 *   onSearch={(value) => console.log(value)}
 *   onRefresh={() => console.log('refresh')}
 * />
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters = [],
  searchPlaceholder = '搜索...',
  searchValue,
  onSearch,
  onRefresh,
  showAdvanced = false,
  advancedContent,
  extraActions,
  compact = false,
  style = {},
  className = '',
}) => {
  const [advancedVisible, setAdvancedVisible] = React.useState(false);
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue || '');

  // 同步外部 searchValue
  React.useEffect(() => {
    setLocalSearchValue(searchValue || '');
  }, [searchValue]);

  const handleSearch = () => {
    onSearch?.(localSearchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card
      className={`filterbar-enhanced ${compact ? 'compact' : ''} ${className}`}
      style={style}
      bodyStyle={{
        padding: compact ? '12px 16px' : '16px',
      }}
    >
      <div className="filterbar-content">
        {/* 搜索框 */}
        {onSearch && (
          <div className="filterbar-search">
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={setLocalSearchValue}
              onKeyDown={handleKeyDown}
              prefix={<IconSearch />}
              suffix={
                <Button
                  type="text"
                  icon={<IconRefresh />}
                  onClick={onRefresh}
                  style={{ padding: '0 4px' }}
                />
              }
              allowClear
              onPressEnter={handleSearch}
            />
          </div>
        )}

        {/* 筛选项 */}
        {filters.length > 0 && (
          <div className="filterbar-filters">
            <Space size="medium" wrap>
              {filters.map((filter) => (
                <div key={filter.key} className="filterbar-item">
                  <span className="filterbar-label">{filter.label}：</span>
                  {filter.type === 'input' && (
                    <Input
                      placeholder={filter.placeholder || '请输入'}
                      value={filter.value}
                      onChange={(v) => filter.onChange?.(v)}
                      style={{ width: 180 }}
                    />
                  )}
                  {filter.type === 'select' && (
                    <Select
                      placeholder={filter.placeholder || '请选择'}
                      value={filter.value}
                      onChange={(v) => filter.onChange?.(v)}
                      showSearch={filter.showSearch}
                      allowClear
                      style={{ width: 180 }}
                    >
                      {filter.options?.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                  {filter.type === 'dateRange' && (
                    <RangePicker
                      value={filter.value as [Dayjs, Dayjs] | undefined}
                      onChange={(date) => filter.onChange?.(date)}
                      style={{ width: 280 }}
                    />
                  )}
                  {filter.type === 'custom' && filter.render}
                </div>
              ))}
            </Space>
          </div>
        )}

        {/* 高级筛选 */}
        {showAdvanced && (
          <div className="filterbar-advanced-toggle">
            <Button
              type="text"
              size="small"
              onClick={() => setAdvancedVisible(!advancedVisible)}
            >
              高级筛选
              <IconDown
                style={{
                  marginLeft: 4,
                  transform: advancedVisible ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </Button>
          </div>
        )}

        {/* 额外操作 */}
        {extraActions && (
          <div className="filterbar-extra">
            {extraActions}
          </div>
        )}
      </div>

      {/* 高级筛选内容 */}
      {showAdvanced && advancedVisible && advancedContent && (
        <div className="filterbar-advanced-content">
          {advancedContent}
        </div>
      )}
    </Card>
  );
};

export default FilterBar;

import React from 'react';
import { Radio, Input, Select, Space, Tag, Divider } from '@arco-design/web-react';
import type { Dayjs } from 'dayjs';

const RadioGroup = Radio.Group;
const Option = Select.Option;

/**
 * Cron 表达式预设类型
 */
type PresetType = 'custom' | 'every-minute' | 'every-hour' | 'every-day' | 'every-week' | 'every-month' | 'custom-pattern';

/**
 * Cron 表达式帮助器属性
 */
interface CronExpressionHelperProps {
  /**
   * Cron 表达式
   */
  value: string;
  /**
   * 值变化回调
   */
  onChange: (value: string) => void;
  /**
   * 是否显示预设选择
   */
  showPresets?: boolean;
}

/**
 * Cron 表达式帮助器组件
 * 提供可视化的 Cron 表达式配置
 */
export const CronExpressionHelper: React.FC<CronExpressionHelperProps> = ({
  value,
  onChange,
  showPresets = true,
}) => {
  const [presetType, setPresetType] = React.useState<PresetType>('custom');
  const [minute, setMinute] = React.useState('*');
  const [hour, setHour] = React.useState('*');
  const [day, setDay] = React.useState('*');
  const [month, setMonth] = React.useState('*');
  const [weekday, setWeekday] = React.useState('*');

  // 解析 cron 表达式
  React.useEffect(() => {
    const parts = value.split(' ');
    if (parts.length >= 5) {
      setMinute(parts[0] || '*');
      setHour(parts[1] || '*');
      setDay(parts[2] || '*');
      setMonth(parts[3] || '*');
      setWeekday(parts[4] || '*');
    }
  }, [value]);

  // 生成 cron 表达式
  const generateCron = (type: PresetType, parts: string[]) => {
    switch (type) {
      case 'every-minute':
        return '0 * * * *';
      case 'every-hour':
        return '0 0 * * *';
      case 'every-day':
        return `0 ${hour} * * *`;
      case 'every-week':
        return `0 ${hour} * * ${weekday}`;
      case 'every-month':
        return `0 ${hour} ${day} * *`;
      case 'custom-pattern':
        return parts.join(' ');
      default:
        return value;
    }
  };

  const handleMinuteChange = (val: string) => {
    setMinute(val);
    onChange(generateCron(presetType, [val, hour, day, month, weekday]));
  };

  const handleHourChange = (val: string) => {
    setHour(val);
    onChange(generateCron(presetType, [minute, val, day, month, weekday]));
  };

  const handleDayChange = (val: string) => {
    setDay(val);
    onChange(generateCron(presetType, [minute, hour, val, month, weekday]));
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    onChange(generateCron(presetType, [minute, hour, day, val, weekday]));
  };

  const handleWeekdayChange = (val: string) => {
    setWeekday(val);
    onChange(generateCron(presetType, [minute, hour, day, month, val]));
  };

  const handlePresetChange = (type: PresetType) => {
    setPresetType(type);
    onChange(generateCron(type, [minute, hour, day, month, weekday]));
  };

  const getExpressionDescription = () => {
    if (value === '0 * * * *') return '每分钟执行一次';
    if (value === '0 0 * * *') return '每天 00:00 执行';
    if (value === '0 */1 * * *') return '每小时的 0 分执行';
    if (value === '0 0 * * 0') return '每周日 00:00 执行';
    if (value === '0 0 1 * *') return '每月 1 号 00:00 执行';
    return '自定义表达式';
  };

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, '0')}:00`,
    value: i.toString(),
  }));

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}日`,
    value: (i + 1).toString(),
  }));

  const weekdays = [
    { label: '周日', value: '0' },
    { label: '周一', value: '1' },
    { label: '周二', value: '2' },
    { label: '周三', value: '3' },
    { label: '周四', value: '4' },
    { label: '周五', value: '5' },
    { label: '周六', value: '6' },
  ];

  return (
    <div className="cron-expression-helper">
      {/* 预设选择 */}
      {showPresets && (
        <div className="cron-presets">
          <div className="preset-label">快速选择：</div>
          <RadioGroup value={presetType} onChange={handlePresetChange}>
            <Space direction="vertical">
              <Radio value="every-minute">每分钟</Radio>
              <Radio value="every-hour">每小时</Radio>
              <Radio value="every-day">每天</Radio>
              <Radio value="every-week">每周</Radio>
              <Radio value="every-month">每月</Radio>
              <Radio value="custom-pattern">自定义</Radio>
            </Space>
          </RadioGroup>
        </div>
      )}

      <Divider style={{ margin: '16px 0' }} />

      {/* 详细配置 */}
      <div className="cron-details">
        <div className="detail-row">
          <div className="detail-label">分钟 (0-59)</div>
          <Input
            value={presetType === 'every-minute' ? '0' : minute}
            onChange={handleMinuteChange}
            style={{ width: 120 }}
            disabled={presetType === 'every-minute'}
          />
        </div>

        <div className="detail-row">
          <div className="detail-label">小时 (0-23)</div>
          <Select
            value={hour}
            onChange={handleHourChange}
            style={{ width: 120 }}
            disabled={presetType === 'every-minute'}
          >
            {hours.map((h) => (
              <Option key={h.value} value={h.value}>
                {h.label}
              </Option>
            ))}
          </Select>
        </div>

        <div className="detail-row">
          <div className="detail-label">日期 (1-31)</div>
          <Select
            value={day}
            onChange={handleDayChange}
            style={{ width: 120 }}
            placeholder="每天"
            disabled={presetType === 'every-minute' || presetType === 'every-hour'}
            allowClear
          >
            {days.map((d) => (
              <Option key={d.value} value={d.value}>
                {d.label}
              </Option>
            ))}
          </Select>
        </div>

        <div className="detail-row">
          <div className="detail-label">月份 (1-12)</div>
          <Input
            value={month}
            onChange={handleMonthChange}
            style={{ width: 120 }}
            placeholder="每月"
            allowClear
          />
        </div>

        <div className="detail-row">
          <div className="detail-label">星期 (0-6)</div>
          <Select
            value={weekday}
            onChange={handleWeekdayChange}
            style={{ width: 120 }}
            placeholder="每天"
            disabled={presetType === 'every-minute' || presetType === 'every-hour'}
            allowClear
          >
            {weekdays.map((w) => (
              <Option key={w.value} value={w.value}>
                {w.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 当前表达式 */}
      <div className="cron-current">
        <div className="current-label">当前表达式：</div>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
          {value}
        </Tag>
        <div className="current-desc">{getExpressionDescription()}</div>
      </div>
    </div>
  );
};

export default CronExpressionHelper;

import { Message } from '@arco-design/web-react';

/**
 * 表单验证工具
 */

/**
 * IP 地址验证
 */
export const validateIP = (ip: string): boolean => {
  const ipRegex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * 端口号验证
 */
export const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};

/**
 * Cron 表达式验证（简化版）
 */
export const validateCron = (cron: string): boolean => {
  // 基本格式验证：5个字段用空格分隔
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return false;
  }
  // 简单检查：每个字段不为空
  return parts.every((part) => part.length > 0);
};

/**
 * URL 验证
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取验证错误提示
 */
export const getValidationMessage = (
  field: string,
  value: any
): string | null => {
  switch (field) {
    case 'ip':
      if (!validateIP(value)) {
        return '请输入有效的 IP 地址';
      }
      break;
    case 'port':
      if (!validatePort(value)) {
        return '端口号必须在 1-65535 之间';
      }
      break;
    case 'cron_expression':
      if (!validateCron(value)) {
        return '请输入有效的 Cron 表达式（5个字段）';
      }
      break;
    case 'command':
      if (!value || value.trim() === '') {
        return '请输入命令';
      }
      break;
    default:
      break;
  }
  return null;
};

/**
 * 表单字段验证规则生成器
 */
export const getFormFieldRules = (field: string) => {
  const rules: any[] = [];

  if (field === 'ip') {
    rules.push({
      required: true,
      message: '请输入 IP 地址',
    });
    rules.push({
      validator: (value: string) => {
        if (value && !validateIP(value)) {
          return Promise.reject('请输入有效的 IP 地址');
        }
        return Promise.resolve();
      },
    });
  }

  if (field === 'port') {
    rules.push({
      type: 'number' as const,
      min: 1,
      max: 65535,
      message: '端口号必须在 1-65535 之间',
    });
  }

  if (field === 'cron_expression') {
    rules.push({
      required: true,
      message: '请输入 Cron 表达式',
    });
    rules.push({
      validator: (value: string) => {
        if (value && !validateCron(value)) {
          return Promise.reject('请输入有效的 Cron 表达式（5个字段）');
        }
        return Promise.resolve();
      },
    });
  }

  if (field === 'command') {
    rules.push({
      required: true,
      message: '请输入命令',
    });
  }

  if (field === 'name') {
    rules.push({
      maxLength: 100,
      message: '名称不能超过 100 个字符',
    });
  }

  if (field === 'password') {
    rules.push({
      required: true,
      message: '请输入密码',
    });
  }

  return rules;
};

/**
 * 批量验证对象
 */
export const validateObject = (
  obj: Record<string, any>,
  fields: string[]
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let valid = true;

  fields.forEach((field) => {
    const error = getValidationMessage(field, obj[field]);
    if (error) {
      errors[field] = error;
      valid = false;
    }
  });

  return { valid, errors };
};

/**
 * 显示验证错误
 */
export const showValidationErrors = (errors: Record<string, string>): void => {
  Object.entries(errors).forEach(([field, message]) => {
    Message.error(message);
  });
};

import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import type { Server, CreateSingleServer, UpdateServer, Group } from '../../types';
import { APP_CONFIG } from '../../config/constants';

const { Option } = Select;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

/**
 * 服务器表单模态框属性
 */
interface ServerFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  groups: Group[];
  initialValues?: Server;
  onOk: (values: CreateSingleServer | UpdateServer) => Promise<void>;
  onCancel: () => void;
}

/**
 * 服务器表单模态框组件
 */
export const ServerFormModal: React.FC<ServerFormModalProps> = ({
  visible,
  mode,
  groups,
  initialValues,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues && mode === 'edit') {
      form.setFieldsValue(initialValues);
    } else if (visible && mode === 'create') {
      form.resetFields();
      form.setFieldsValue({
        port: 22,
        ssh_user: 'root',
      });
    }
  }, [visible, initialValues, mode, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      // 表单验证失败，不做处理
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '添加服务器' : '编辑服务器'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      autoFocus={false}
      focusLock={true}
    >
      <Form
        form={form}
        {...APP_CONFIG.FORM_CONFIG}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <FormItem label="名称" field="name">
          <Input placeholder="服务器名称（可选）" />
        </FormItem>
        <FormItem label="分组" field="group_id">
          <Select placeholder="选择分组（可选）" allowClear>
            {groups.map((group) => (
              <Option key={group.group_id} value={group.group_id}>
                {group.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="IP 地址"
          field="ip"
          required
          rules={[{ required: true, message: '请输入 IP 地址' }]}
        >
          <Input placeholder="例如: 192.168.1.1" />
        </FormItem>
        <FormItem label="端口" field="port">
          <InputNumber style={{ width: '100%' }} min={1} max={65535} />
        </FormItem>
        <FormItem label="用户" field="ssh_user">
          <Input placeholder="SSH 用户名" />
        </FormItem>
        <FormItem
          label="密码"
          field="password"
          required={mode === 'create'}
          rules={mode === 'create' ? [{ required: true, message: '请输入密码' }] : []}
        >
          <Input.Password placeholder={mode === 'create' ? 'SSH 密码' : 'SSH 密码（留空不修改）'} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default ServerFormModal;

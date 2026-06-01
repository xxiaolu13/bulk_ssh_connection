import React from 'react';
import { Modal, Form, Input } from '@arco-design/web-react';
import type { Group, CreateGroup, UpdateGroup } from '../../types';
import { APP_CONFIG } from '../../config/constants';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

/**
 * 分组表单模态框属性
 */
interface GroupFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: Group;
  onOk: (values: CreateGroup | UpdateGroup) => Promise<void>;
  onCancel: () => void;
}

/**
 * 分组表单模态框组件
 */
export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  visible,
  mode,
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
      title={mode === 'create' ? '添加分组' : '编辑分组'}
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
        <FormItem
          label="分组名称"
          field="name"
          required
          rules={[{ required: true, message: '请输入分组名称' }]}
        >
          <Input placeholder="分组名称" />
        </FormItem>
        <FormItem label="描述" field="description">
          <TextArea placeholder="分组描述（可选）" rows={3} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default GroupFormModal;

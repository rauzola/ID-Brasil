import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col, FormInstance } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

interface UserFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  age?: number;
  gender: string;
  role: string;
}

interface UserModalsProps {
  isAddModalVisible: boolean;
  isEditModalVisible: boolean;
  form: FormInstance;
  onAddModalClose: () => void;
  onEditModalClose: () => void;
  onAddUserSubmit: (values: UserFormValues) => void;
  onEditUserSubmit: (values: UserFormValues) => void;
}

export default function UserModals({
  isAddModalVisible,
  isEditModalVisible,
  form,
  onAddModalClose,
  onEditModalClose,
  onAddUserSubmit,
  onEditUserSubmit
}: UserModalsProps) {
  return (
    <>
      {/* Modal para Adicionar Usuário */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <span>Adicionar Novo Usuário</span>
          </Space>
        }
        open={isAddModalVisible}
        onCancel={onAddModalClose}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onAddUserSubmit}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
              >
                <Input placeholder="Digite o nome" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Sobrenome"
                rules={[{ required: true, message: 'Por favor, insira o sobrenome!' }]}
              >
                <Input placeholder="Digite o sobrenome" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Por favor, insira o username!' }]}
              >
                <Input placeholder="Digite o username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira o email!' },
                  { type: 'email', message: 'Por favor, insira um email válido!' }
                ]}
              >
                <Input placeholder="Digite o email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira a senha!' }]}
              >
                <Input.Password placeholder="Digite a senha" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="age"
                label="Idade"
                rules={[{ required: true, message: 'Por favor, insira a idade!' }]}
              >
                <InputNumber 
                  placeholder="Digite a idade" 
                  min={1} 
                  max={120} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gênero"
                rules={[{ required: true, message: 'Por favor, selecione o gênero!' }]}
              >
                <Select placeholder="Selecione o gênero">
                  <Select.Option value="male">Masculino</Select.Option>
                  <Select.Option value="female">Feminino</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Por favor, selecione o role!' }]}
              >
                <Select placeholder="Selecione o role">
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="moderator">Moderator</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={onAddModalClose}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none'
              }}>
                Adicionar Usuário
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Editar Usuário */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#52c41a' }} />
            <span>Editar Usuário</span>
          </Space>
        }
        open={isEditModalVisible}
        onCancel={onEditModalClose}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onEditUserSubmit}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
              >
                <Input placeholder="Digite o nome" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Sobrenome"
                rules={[{ required: true, message: 'Por favor, insira o sobrenome!' }]}
              >
                <Input placeholder="Digite o sobrenome" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Por favor, insira o username!' }]}
              >
                <Input placeholder="Digite o username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira o email!' },
                  { type: 'email', message: 'Por favor, insira um email válido!' }
                ]}
              >
                <Input placeholder="Digite o email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gênero"
                rules={[{ required: true, message: 'Por favor, selecione o gênero!' }]}
              >
                <Select placeholder="Selecione o gênero">
                  <Select.Option value="male">Masculino</Select.Option>
                  <Select.Option value="female">Feminino</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Por favor, selecione o role!' }]}
              >
                <Select placeholder="Selecione o role">
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="moderator">Moderator</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={onEditModalClose}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none'
              }}>
                Atualizar Usuário
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

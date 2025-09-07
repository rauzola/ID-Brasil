import React from 'react';
import { Table, Space, Avatar, Tag, Button, Tooltip, Badge, Typography } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: string;
  image: string;
  role: string;
}

interface UsersTableProps {
  users: UserData[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  userRole?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (current: number, size: number) => void;
  onViewDetails: (userId: number) => void;
  onEdit: (user: UserData) => void;
  onDelete: (userId: number, userName: string) => void;
}

export default function UsersTable({
  users,
  loading,
  currentPage,
  pageSize,
  totalUsers,
  userRole,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onEdit,
  onDelete
}: UsersTableProps) {
  // Configuração das colunas da tabela
  const columns: ColumnsType<UserData> = [
    {
      title: (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Usuário</span>
        </Space>
      ),
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string, record: UserData) => (
        <Space>
          <Avatar 
            size={48} 
            src={image} 
            icon={<UserOutlined />}
            style={{ 
              border: '2px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              ID: {record.id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <SearchOutlined style={{ color: '#1890ff' }} />
          <span>Username</span>
        </Space>
      ),
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => (
        <Text code style={{ 
          background: '#f6f8fa', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          @{username}
        </Text>
      ),
      sorter: (a: UserData, b: UserData) => a.username.localeCompare(b.username),
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Email</span>
        </Space>
      ),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <Tooltip title={email}>
          <Text style={{ fontSize: '13px' }}>{email}</Text>
        </Tooltip>
      ),
      sorter: (a: UserData, b: UserData) => a.email.localeCompare(b.email),
    },
    {
      title: (
        <Space>
          <FilterOutlined style={{ color: '#1890ff' }} />
          <span>Gênero</span>
        </Space>
      ),
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      render: (gender: string) => (
        <Badge 
          status={gender === 'female' ? 'processing' : 'success'} 
          text={gender === 'female' ? 'Feminino' : 'Masculino'}
        />
      ),
      filters: [
        { text: 'Feminino', value: 'female' },
        { text: 'Masculino', value: 'male' },
      ],
      onFilter: (value: boolean | React.Key, record: UserData) => record.gender === value,
    },
    {
      title: (
        <Space>
          <CrownOutlined style={{ color: '#1890ff' }} />
          <span>Role</span>
        </Space>
      ),
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'gold', icon: <CrownOutlined />, text: 'Admin' },
          user: { color: 'blue', icon: <UserOutlined />, text: 'User' },
          moderator: { color: 'red', icon: <UserOutlined />, text: 'Moderator' }
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', icon: <UserOutlined />, text: role };
        
        return (
          <Tag 
            color={config.color}
            style={{ 
              borderRadius: '20px',
              padding: '4px 12px',
              fontWeight: 500,
              fontSize: '12px'
            }}
          >
            <Space size={4}>
              {config.icon}
              {config.text}
            </Space>
          </Tag>
        );
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'Moderator', value: 'moderator' },
      ],
      onFilter: (value: boolean | React.Key, record: UserData) => record.role === value,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record: UserData) => (
        <Space size="small">
          <Tooltip title="Ver Detalhes">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => onViewDetails(record.id)}
              style={{ 
                color: '#1890ff',
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#f6ffed'
              }}
            />
          </Tooltip>
          {userRole === 'admin' ? (
            <>
              <Tooltip title="Editar Usuário">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                  style={{ 
                    color: '#52c41a',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#f6ffed'
                  }}
                />
              </Tooltip>
              <Tooltip title="Excluir Usuário">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(record.id, `${record.firstName} ${record.lastName}`)}
                  style={{ 
                    color: '#ff4d4f',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#fff2f0'
                  }}
                />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Apenas administradores podem editar e excluir usuários">
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled
                  style={{ 
                    color: '#d9d9d9',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  disabled
                  style={{ 
                    color: '#d9d9d9',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }}
                />
              </Space>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <style jsx global>{`
        .table-row-light {
          background: #fafafa;
        }
        .table-row-dark {
          background: #fff;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background: #e6f7ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-bottom: 2px solid #dee2e6 !important;
          font-weight: 600 !important;
          color: #495057 !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 16px !important;
        }
        .ant-pagination {
          margin-top: 24px !important;
        }
        .ant-pagination-item {
          border-radius: 8px !important;
        }
        .ant-pagination-item-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-color: transparent !important;
        }
      `}</style>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalUsers,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `Mostrando ${range[0]}-${range[1]} de ${total} usuários`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onShowSizeChange: onPageSizeChange,
          onChange: onPageChange,
          style: { 
            marginTop: '16px',
            textAlign: 'center'
          },
          showLessItems: false,
          showTitle: true,
          size: 'default',
          responsive: true,
          hideOnSinglePage: false
        }}
        scroll={{ x: 1200 }}
        size="middle"
        style={{
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        rowClassName={(record, index) => 
          index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
        }
        locale={{
          emptyText: 'Nenhum usuário encontrado',
          filterConfirm: 'OK',
          filterReset: 'Resetar',
          filterEmptyText: 'Sem filtros',
          selectAll: 'Selecionar todos',
          selectInvert: 'Inverter seleção',
          sortTitle: 'Ordenar',
          triggerDesc: 'Clique para ordenar descrescente',
          triggerAsc: 'Clique para ordenar crescente',
          cancelSort: 'Cancelar ordenação'
        }}
      />
    </>
  );
}

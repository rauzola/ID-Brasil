'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Card, Typography, Space, Avatar, Button, Row, Col, Descriptions, Tag, Badge, message, Modal } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BankOutlined,
  TeamOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '@/services/api';
import { UserDetailedInfo } from '@/types/user';

const { Content } = Layout;
const { Title, Text } = Typography;

// Constantes para configuração da página
const PAGE_CONFIG = {
  maxWidth: '1200px',
  padding: '24px',
  cardBorderRadius: '16px',
  cardShadow: '0 8px 32px var(--shadow-primary)',
  avatarSize: 64,
  avatarBorder: '3px solid var(--border-secondary)',
  avatarShadow: '0 4px 16px var(--shadow-primary)',
} as const;

// Configurações de estilo para cards
const CARD_STYLES = {
  borderRadius: PAGE_CONFIG.cardBorderRadius,
  boxShadow: PAGE_CONFIG.cardShadow,
  border: 'none',
  background: 'var(--card-bg)',
} as const;

// Configurações de botões
const BUTTON_STYLES = {
  borderRadius: '8px',
  editButton: {
    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    border: 'none',
    borderRadius: '8px',
  },
  tagStyle: {
    borderRadius: '20px',
    padding: '4px 12px',
    fontWeight: 500,
  },
} as const;

// Configurações de roles
const ROLE_CONFIG = {
  admin: { color: 'gold', icon: <CrownOutlined />, text: 'Admin' },
  user: { color: 'blue', icon: <UserOutlined />, text: 'User' },
  moderator: { color: 'red', icon: <UserOutlined />, text: 'Moderator' },
} as const;

// Configurações de ícones para seções
const SECTION_ICONS = {
  personal: <UserOutlined style={{ color: 'var(--info-color)' }} />,
  address: <EnvironmentOutlined style={{ color: 'var(--info-color)' }} />,
  physical: <UserOutlined style={{ color: 'var(--info-color)' }} />,
  company: <TeamOutlined style={{ color: 'var(--info-color)' }} />,
  bank: <BankOutlined style={{ color: 'var(--info-color)' }} />,
} as const;

/**
 * Página de detalhes do usuário
 * Exibe informações completas de um usuário específico
 */
export default function UserDetailsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const [userDetails, setUserDetails] = useState<UserDetailedInfo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  /**
   * Redireciona para login se não estiver autenticado
   */
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  /**
   * Busca detalhes do usuário do cache ou API
   */
  const fetchUserDetails = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    setIsLoadingDetails(true);
    try {
      // Primeiro, tentar buscar do localStorage
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const foundUser = users.find((u: UserDetailedInfo) => u.id === parseInt(userId));
        if (foundUser) {
          setUserDetails(foundUser);
          setIsLoadingDetails(false);
          return;
        }
      }
      
      // Se não encontrou no localStorage, buscar da API
      const response = await authService.getUserById(parseInt(userId));
      setUserDetails(response);
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      message.error('Erro ao carregar detalhes do usuário');
    } finally {
      setIsLoadingDetails(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  /**
   * Navega de volta para o dashboard
   */
  const handleBack = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  /**
   * Navega para edição do usuário
   */
  const handleEdit = useCallback(() => {
    router.push(`/dashboard?edit=${userId}`);
  }, [router, userId]);

  /**
   * Confirma e executa exclusão do usuário
   */
  const handleDelete = useCallback(() => {
    if (!userDetails) return;
    
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja excluir o usuário "${userDetails.firstName} ${userDetails.lastName}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      icon: <DeleteOutlined style={{ color: 'var(--error-color)' }} />,
      async onOk() {
        try {
          // Remover do localStorage
          const storedUsers = localStorage.getItem('users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const updatedUsers = users.filter((u: UserDetailedInfo) => u.id !== parseInt(userId));
            localStorage.setItem('users', JSON.stringify(updatedUsers));
          }
          
          message.success(`Usuário "${userDetails.firstName} ${userDetails.lastName}" excluído com sucesso!`);
          router.push('/dashboard');
        } catch (error) {
          message.error('Erro ao excluir usuário. Tente novamente.');
          console.error('Erro ao excluir usuário:', error);
        }
      },
    });
  }, [userDetails, userId, router]);

  /**
   * Obtém configuração do role do usuário
   */
  const getRoleConfiguration = useCallback((role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || { 
      color: 'default', 
      icon: <UserOutlined />, 
      text: role 
    };
  }, []);

  /**
   * Renderiza o cabeçalho do usuário
   */
  const renderUserHeader = useCallback(() => {
    if (!userDetails) return null;

    const roleConfig = getRoleConfiguration(userDetails.role);

    return (
      <Card style={CARD_STYLES}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ borderRadius: BUTTON_STYLES.borderRadius }}
              >
                Voltar
              </Button>
              <Space>
                <Avatar 
                  size={PAGE_CONFIG.avatarSize} 
                  src={userDetails.image || userDetails.profileImageUrl} 
                  icon={<UserOutlined />}
                  style={{ 
                    border: PAGE_CONFIG.avatarBorder,
                    boxShadow: PAGE_CONFIG.avatarShadow
                  }}
                />
                <div>
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {userDetails.firstName} {userDetails.lastName}
                  </Title>
                  <Space>
                    <Text code style={{ 
                      background: 'var(--bg-tertiary)', 
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-secondary)'
                    }}>
                      @{userDetails.username}
                    </Text>
                    <Tag 
                      color={roleConfig.color}
                      style={BUTTON_STYLES.tagStyle}
                    >
                      <Space size={4}>
                        {roleConfig.icon}
                        {roleConfig.text}
                      </Space>
                    </Tag>
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            {user?.role === 'admin' && (
              <Space>
                <Button 
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={BUTTON_STYLES.editButton}
                >
                  Editar
                </Button>
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  style={{ borderRadius: BUTTON_STYLES.borderRadius }}
                >
                  Excluir
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </Card>
    );
  }, [userDetails, user?.role, getRoleConfiguration, handleBack, handleEdit, handleDelete]);

  /**
   * Renderiza informações pessoais
   */
  const renderPersonalInformation = useCallback(() => {
    if (!userDetails) return null;

    return (
      <Card 
        title={
          <Space>
            {SECTION_ICONS.personal}
            <span>Informações Pessoais</span>
          </Space>
        }
        style={CARD_STYLES}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Nome Completo">
            {userDetails.firstName} {userDetails.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            <Text code>@{userDetails.username}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              {userDetails.email}
            </Space>
          </Descriptions.Item>
          {userDetails.phoneNumber && (
            <Descriptions.Item label="Telefone">
              <Space>
                <PhoneOutlined />
                {userDetails.phoneNumber}
              </Space>
            </Descriptions.Item>
          )}
          {userDetails.age && (
            <Descriptions.Item label="Idade">
              {userDetails.age} anos
            </Descriptions.Item>
          )}
          {userDetails.birthDate && (
            <Descriptions.Item label="Data de Nascimento">
              <Space>
                <CalendarOutlined />
                {userDetails.birthDate}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Gênero">
            <Badge 
              status={userDetails.gender === 'female' ? 'processing' : 'success'} 
              text={userDetails.gender === 'female' ? 'Feminino' : 'Masculino'}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }, [userDetails]);

  /**
   * Renderiza informações de endereço
   */
  const renderAddressInformation = useCallback(() => {
    if (!userDetails) return null;

    return (
      <Card 
        title={
          <Space>
            {SECTION_ICONS.address}
            <span>Endereço</span>
          </Space>
        }
        style={CARD_STYLES}
      >
        <Descriptions column={1} size="small">
          {userDetails.address?.address && (
            <Descriptions.Item label="Endereço">
              {userDetails.address.address}
            </Descriptions.Item>
          )}
          {userDetails.address?.city && (
            <Descriptions.Item label="Cidade">
              {userDetails.address.city}
            </Descriptions.Item>
          )}
          {userDetails.address?.state && (
            <Descriptions.Item label="Estado">
              {userDetails.address.state} {userDetails.address.stateCode && `(${userDetails.address.stateCode})`}
            </Descriptions.Item>
          )}
          {userDetails.address?.postalCode && (
            <Descriptions.Item label="CEP">
              {userDetails.address.postalCode}
            </Descriptions.Item>
          )}
          {userDetails.address?.country && (
            <Descriptions.Item label="País">
              {userDetails.address.country}
            </Descriptions.Item>
          )}
          {userDetails.address?.coordinates?.lat && userDetails.address?.coordinates?.lng && (
            <Descriptions.Item label="Coordenadas">
              {userDetails.address.coordinates.lat}, {userDetails.address.coordinates.lng}
            </Descriptions.Item>
          )}
          {!userDetails.address && (
            <Descriptions.Item label="Endereço">
              <Text type="secondary">Informações de endereço não disponíveis</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }, [userDetails]);

  /**
   * Renderiza informações físicas
   */
  const renderPhysicalInformation = useCallback(() => {
    if (!userDetails) return null;

    return (
      <Card 
        title={
          <Space>
            {SECTION_ICONS.physical}
            <span>Informações Físicas</span>
          </Space>
        }
        style={CARD_STYLES}
      >
        <Descriptions column={1} size="small">
          {userDetails.height && (
            <Descriptions.Item label="Altura">
              {userDetails.height} cm
            </Descriptions.Item>
          )}
          {userDetails.weight && (
            <Descriptions.Item label="Peso">
              {userDetails.weight} kg
            </Descriptions.Item>
          )}
          {userDetails.bloodGroup && (
            <Descriptions.Item label="Tipo Sanguíneo">
              {userDetails.bloodGroup}
            </Descriptions.Item>
          )}
          {userDetails.eyeColor && (
            <Descriptions.Item label="Cor dos Olhos">
              {userDetails.eyeColor}
            </Descriptions.Item>
          )}
          {userDetails.hair?.color && userDetails.hair?.type && (
            <Descriptions.Item label="Cabelo">
              {userDetails.hair.color} - {userDetails.hair.type}
            </Descriptions.Item>
          )}
          {!userDetails.height && !userDetails.weight && !userDetails.bloodGroup && !userDetails.eyeColor && !userDetails.hair && (
            <Descriptions.Item label="Informações Físicas">
              <Text type="secondary">Informações físicas não disponíveis</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }, [userDetails]);

  /**
   * Renderiza informações da empresa
   */
  const renderCompanyInformation = useCallback(() => {
    if (!userDetails) return null;

    return (
      <Card 
        title={
          <Space>
            {SECTION_ICONS.company}
            <span>Empresa</span>
          </Space>
        }
        style={CARD_STYLES}
      >
        <Descriptions column={1} size="small">
          {userDetails.company?.name && (
            <Descriptions.Item label="Empresa">
              {userDetails.company.name}
            </Descriptions.Item>
          )}
          {userDetails.company?.title && (
            <Descriptions.Item label="Cargo">
              {userDetails.company.title}
            </Descriptions.Item>
          )}
          {userDetails.company?.department && (
            <Descriptions.Item label="Departamento">
              {userDetails.company.department}
            </Descriptions.Item>
          )}
          {userDetails.company?.address?.address && userDetails.company?.address?.city && (
            <Descriptions.Item label="Endereço da Empresa">
              {userDetails.company.address.address}, {userDetails.company.address.city}
            </Descriptions.Item>
          )}
          {!userDetails.company && (
            <Descriptions.Item label="Empresa">
              <Text type="secondary">Informações da empresa não disponíveis</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }, [userDetails]);

  /**
   * Renderiza informações bancárias
   */
  const renderBankInformation = useCallback(() => {
    if (!userDetails) return null;

    return (
      <Card 
        title={
          <Space>
            {SECTION_ICONS.bank}
            <span>Informações Bancárias</span>
          </Space>
        }
        style={CARD_STYLES}
      >
        <Descriptions column={2} size="small">
          {userDetails.bank?.cardType && (
            <Descriptions.Item label="Tipo de Cartão">
              {userDetails.bank.cardType}
            </Descriptions.Item>
          )}
          {userDetails.bank?.currency && (
            <Descriptions.Item label="Moeda">
              {userDetails.bank.currency}
            </Descriptions.Item>
          )}
          {userDetails.bank?.cardExpirationDate && (
            <Descriptions.Item label="Cartão Expira">
              {userDetails.bank.cardExpirationDate}
            </Descriptions.Item>
          )}
          {userDetails.bank?.iban && (
            <Descriptions.Item label="IBAN">
              {userDetails.bank.iban}
            </Descriptions.Item>
          )}
          {!userDetails.bank && (
            <Descriptions.Item label="Informações Bancárias" span={2}>
              <Text type="secondary">Informações bancárias não disponíveis</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }, [userDetails]);

  /**
   * Renderiza loading spinner
   */
  const renderLoadingSpinner = useCallback((tip: string) => (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: PAGE_CONFIG.padding }}>
        <LoadingSpinner tip={tip} />
      </Content>
    </Layout>
  ), []);

  // Estados de loading
  if (loading) {
    return renderLoadingSpinner('Carregando...');
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  if (isLoadingDetails) {
    return renderLoadingSpinner('Carregando detalhes do usuário...');
  }

  if (!userDetails) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: PAGE_CONFIG.padding }}>
          <Card>
            <Typography.Text>Usuário não encontrado</Typography.Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <>
      <style jsx global>{`
        .ant-descriptions-item-label {
          color: var(--text-secondary) !important;
          font-weight: 500 !important;
        }
        .ant-descriptions-item-content {
          color: var(--text-primary) !important;
        }
        .ant-card-head-title {
          color: var(--text-primary) !important;
        }
        .ant-badge-status-text {
          color: var(--text-primary) !important;
        }
        .ant-badge-status-dot {
          border: 1px solid var(--border-primary) !important;
        }
      `}</style>
      <Layout style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <Header />
        <Content style={{ padding: PAGE_CONFIG.padding }}>
          <div style={{ maxWidth: PAGE_CONFIG.maxWidth, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              
              {/* Cabeçalho do usuário */}
              {renderUserHeader()}

              {/* Informações Pessoais e Endereço */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  {renderPersonalInformation()}
                </Col>
                <Col xs={24} lg={12}>
                  {renderAddressInformation()}
                </Col>
              </Row>

              {/* Informações Físicas e Empresa */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  {renderPhysicalInformation()}
                </Col>
                <Col xs={24} lg={12}>
                  {renderCompanyInformation()}
                </Col>
              </Row>

              {/* Informações Bancárias */}
              {renderBankInformation()}

            </Space>
          </div>
        </Content>
      </Layout>
    </>
  );
}
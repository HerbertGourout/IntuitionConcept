import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Progress, Button, Modal, Table, Space, Statistic } from 'antd';
import { 
  TrophyOutlined, 
  GlobalOutlined, 
  DollarOutlined, 
  UserOutlined,
  RiseOutlined,
  BarChartOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useResponsive } from '../../hooks/useResponsive';

const { TabPane } = Tabs;

interface Competitor {
  id: string;
  name: string;
  region: 'Africa' | 'Europe' | 'Global';
  marketShare: number;
  revenue: string;
  employees: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  targetMarket: string;
  keyFeatures: string[];
  threat: 'High' | 'Medium' | 'Low';
}

const CompetitiveAnalysis: React.FC = () => {
  const { isMobile } = useResponsive();
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const africanCompetitors: Competitor[] = [
    {
      id: 'orascom',
      name: 'Orascom Construction',
      region: 'Africa',
      marketShare: 15,
      revenue: '3.2B USD',
      employees: '45,000+',
      strengths: ['Leader historique', 'Présence pan-africaine', 'Projets d\'infrastructure majeurs'],
      weaknesses: ['Digitalisation limitée', 'Coûts élevés', 'Processus traditionnels'],
      pricing: 'Premium',
      targetMarket: 'Grands projets gouvernementaux',
      keyFeatures: ['Gestion de projets complexes', 'Expertise technique', 'Réseau établi'],
      threat: 'Medium'
    },
    {
      id: 'dangote',
      name: 'Dangote Group (Construction)',
      region: 'Africa',
      marketShare: 12,
      revenue: '2.8B USD',
      employees: '30,000+',
      strengths: ['Intégration verticale', 'Matériaux de construction', 'Présence Nigeria'],
      weaknesses: ['Focus géographique limité', 'Outils de gestion basiques'],
      pricing: 'Compétitif',
      targetMarket: 'Projets industriels et résidentiels',
      keyFeatures: ['Production de matériaux', 'Logistique intégrée'],
      threat: 'Low'
    },
    {
      id: 'tgcc',
      name: 'TGCC (Travaux Généraux de Construction du Cameroun)',
      region: 'Africa',
      marketShare: 8,
      revenue: '1.5B USD',
      employees: '15,000+',
      strengths: ['Expertise Afrique Centrale', 'Projets routiers', 'Partenariats chinois'],
      weaknesses: ['Technologie obsolète', 'Gestion manuelle'],
      pricing: 'Moyen',
      targetMarket: 'Infrastructure publique',
      keyFeatures: ['Routes et ponts', 'Travaux publics'],
      threat: 'Low'
    }
  ];

  const europeanCompetitors: Competitor[] = [
    {
      id: 'sage',
      name: 'Sage Batigest',
      region: 'Europe',
      marketShare: 25,
      revenue: '500M EUR',
      employees: '2,000+',
      strengths: ['Leader français', 'Suite complète', 'Intégrations comptables'],
      weaknesses: ['Interface vieillissante', 'Coût élevé', 'Complexité'],
      pricing: '30-100€/mois/utilisateur',
      targetMarket: 'PME et grandes entreprises BTP',
      keyFeatures: ['Devis/Factures', 'Comptabilité', 'Paie', 'Gestion chantier'],
      threat: 'High'
    },
    {
      id: 'graneet',
      name: 'Graneet',
      region: 'Europe',
      marketShare: 15,
      revenue: '50M EUR',
      employees: '200+',
      strengths: ['Interface moderne', 'Mobile-first', 'Collaboration équipes'],
      weaknesses: ['Fonctionnalités limitées', 'Marché français uniquement'],
      pricing: 'Sur demande',
      targetMarket: 'Entreprises moyennes BTP',
      keyFeatures: ['Planning collaboratif', 'Suivi chantier', 'Reporting'],
      threat: 'Medium'
    },
    {
      id: 'costructor',
      name: 'Costructor',
      region: 'Europe',
      marketShare: 8,
      revenue: '20M EUR',
      employees: '100+',
      strengths: ['Solution récente', 'UX moderne', 'Prix attractif'],
      weaknesses: ['Nouveau sur le marché', 'Fonctionnalités en développement'],
      pricing: '12.50€/mois/utilisateur',
      targetMarket: 'Petites et moyennes entreprises',
      keyFeatures: ['Gestion projet', 'Devis', 'Planning'],
      threat: 'Medium'
    },
    {
      id: 'autodesk',
      name: 'Autodesk Construction Cloud',
      region: 'Global',
      marketShare: 20,
      revenue: '1.2B USD',
      employees: '12,000+',
      strengths: ['Leader mondial', 'Écosystème CAO', 'Innovation continue'],
      weaknesses: ['Complexité', 'Coût très élevé', 'Courbe d\'apprentissage'],
      pricing: '100-300€/mois/utilisateur',
      targetMarket: 'Grandes entreprises internationales',
      keyFeatures: ['BIM', 'Collaboration 3D', 'Gestion documentaire'],
      threat: 'High'
    }
  ];

  // const allCompetitors = [...africanCompetitors, ...europeanCompetitors];

  const marketData = {
    africa: {
      size: '74.81B USD d\'ici 2029',
      growth: '5.07% TCAC',
      projects: '570+ projets actifs',
      value: '450B USD de projets'
    },
    europe: {
      size: '2.1T EUR',
      growth: '3.2% TCAC',
      digitalization: '35% des entreprises',
      software: '15B EUR marché logiciels'
    }
  };

  const opportunitiesData = [
    {
      key: '1',
      opportunity: 'Digitalisation Afrique',
      market: 'Africain',
      potential: 'Très élevé',
      description: 'Marché sous-digitalisé avec forte croissance',
      action: 'Développer version adaptée aux besoins locaux'
    },
    {
      key: '2',
      opportunity: 'Mobile Money Integration',
      market: 'Africain',
      potential: 'Élevé',
      description: 'Paiements mobiles très répandus en Afrique',
      action: 'Intégrer Flutterwave et solutions locales'
    },
    {
      key: '3',
      opportunity: 'PME Européennes',
      market: 'Européen',
      potential: 'Élevé',
      description: 'Solutions actuelles trop complexes/chères',
      action: 'Positionnement prix/simplicité'
    },
    {
      key: '4',
      opportunity: 'IA et Automatisation',
      market: 'Global',
      potential: 'Très élevé',
      description: 'Peu de solutions avec Système avancé',
      action: 'Développer fonctionnalités IA prédictives'
    }
  ];

  const showCompetitorDetails = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setModalVisible(true);
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'blue';
    }
  };

  const CompetitorCard = ({ competitor }: { competitor: Competitor }) => (
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Button 
          key="view" 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => showCompetitorDetails(competitor)}
        >
          Détails
        </Button>
      ]}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold mb-1">{competitor.name}</h3>
          <Tag color={competitor.region === 'Africa' ? 'orange' : competitor.region === 'Europe' ? 'blue' : 'purple'}>
            {competitor.region}
          </Tag>
          <Tag color={getThreatColor(competitor.threat)}>
            Menace: {competitor.threat}
          </Tag>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Part de marché</div>
          <div className="text-xl font-bold">{competitor.marketShare}%</div>
        </div>
      </div>

      <Row gutter={16} className="mb-3">
        <Col span={12}>
          <Statistic 
            title="Revenus" 
            value={competitor.revenue} 
            prefix={<DollarOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Employés" 
            value={competitor.employees} 
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
      </Row>

      <div className="mb-2">
        <div className="text-sm font-medium mb-1">Forces principales:</div>
        <div className="flex flex-wrap gap-1">
          {competitor.strengths.slice(0, 2).map((strength, index) => (
            <Tag key={index} color="green" className="text-xs">
              {strength}
            </Tag>
          ))}
          {competitor.strengths.length > 2 && (
            <Tag className="text-xs">+{competitor.strengths.length - 2}</Tag>
          )}
        </div>
      </div>

      <Progress 
        percent={competitor.marketShare * 4} 
        size="small" 
        status="active"
        format={() => `${competitor.marketShare}% du marché`}
      />
    </Card>
  );

  return (
    <div className="p-4 md:p-6">
      {}
      <Modal
        title={selectedCompetitor?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 800}
      >
        {selectedCompetitor && (
          <div>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Statistic title="Revenus" value={selectedCompetitor.revenue} />
              </Col>
              <Col span={12}>
                <Statistic title="Employés" value={selectedCompetitor.employees} />
              </Col>
            </Row>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Forces:</h4>
              <Space wrap>
                {selectedCompetitor.strengths.map((strength, index) => (
                  <Tag key={index} color="green">{strength}</Tag>
                ))}
              </Space>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Faiblesses:</h4>
              <Space wrap>
                {selectedCompetitor.weaknesses.map((weakness, index) => (
                  <Tag key={index} color="red">{weakness}</Tag>
                ))}
              </Space>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Fonctionnalités clés:</h4>
              <Space wrap>
                {selectedCompetitor.keyFeatures.map((feature, index) => (
                  <Tag key={index} color="blue">{feature}</Tag>
                ))}
              </Space>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>Prix:</strong> {selectedCompetitor.pricing}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Marché cible:</strong> {selectedCompetitor.targetMarket}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompetitiveAnalysis;

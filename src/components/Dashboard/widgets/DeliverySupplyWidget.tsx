import React, { useState, useEffect } from 'react';
import { Truck, Package, Clock, AlertTriangle, CheckCircle, TrendingDown, MapPin } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import { useCurrency } from '../../../hooks/useCurrency';

interface DeliveryData {
  inTransitDeliveries: number;
  expectedDeliveries: number;
  delayedDeliveries: number;
  complianceRate: number;
  criticalStock: Array<{
    id: string;
    item: string;
    currentStock: number;
    minStock: number;
    supplier: string;
  }>;
  upcomingDeliveries: Array<{
    id: string;
    supplier: string;
    items: string[];
    expectedDate: string;
    value: number;
    status: 'on_time' | 'delayed' | 'critical';
  }>;
  totalValue: number;
  averageDeliveryTime: number;
}

const DeliverySupplyWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const { formatAmount } = useCurrency();
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    inTransitDeliveries: 0,
    expectedDeliveries: 0,
    delayedDeliveries: 0,
    complianceRate: 0,
    criticalStock: [],
    upcomingDeliveries: [],
    totalValue: 0,
    averageDeliveryTime: 0
  });

  useEffect(() => {
    if (!currentProject) return;

    // Simulation basée sur les équipements et phases du projet
    const equipment = currentProject.equipment || [];
    const phases = currentProject.phases || [];
    
    // Calculs basés sur les vraies données du projet
    const inTransitDeliveries = 0; // Pas de système de livraisons implémenté
    const expectedDeliveries = 0; // Pas de livraisons programmées
    const delayedDeliveries = 0; // Pas de retards sans livraisons
    const complianceRate = 100; // 100% par défaut sans livraisons

    // Stock critique basé sur les équipements réels
    const criticalStock = equipment
      .filter(eq => eq.status === 'out-of-service' || eq.status === 'maintenance')
      .slice(0, 3)
      .map(eq => ({
        id: eq.id,
        item: eq.name,
        currentStock: 0, // Considéré comme stock zéro si hors service
        minStock: 1,
        supplier: `Équipement: ${eq.type}`
      }));

    // Livraisons à venir basées sur les équipements nécessaires
    const upcomingDeliveries = equipment
      .filter(eq => eq.status === 'maintenance' || eq.status === 'out-of-service')
      .slice(0, 3)
      .map((eq, index) => ({
        id: eq.id,
        supplier: `Maintenance ${eq.type}`,
        items: [eq.name],
        expectedDate: eq.nextMaintenance || new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        value: eq.dailyRate || 0,
        status: 'on_time' as const
      }));

    const totalValue = upcomingDeliveries.reduce((sum, delivery) => sum + delivery.value, 0);
    const averageDeliveryTime = 7; // 7 jours par défaut pour la maintenance

    setDeliveryData({
      inTransitDeliveries,
      expectedDeliveries,
      delayedDeliveries,
      complianceRate,
      criticalStock,
      upcomingDeliveries,
      totalValue,
      averageDeliveryTime
    });
  }, [currentProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'delayed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_time': return <CheckCircle className="w-4 h-4" />;
      case 'delayed': return <Clock className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Livraisons & Approvisionnement</h3>
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {deliveryData.inTransitDeliveries} en transit
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {deliveryData.expectedDeliveries}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Attendues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {deliveryData.delayedDeliveries}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">En retard</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {deliveryData.complianceRate}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Conformité</div>
        </div>
      </div>

      {/* Taux de conformité */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Taux de conformité</span>
          <span className={`font-medium ${
            deliveryData.complianceRate > 90 ? 'text-green-600' : 
            deliveryData.complianceRate > 75 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {deliveryData.complianceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              deliveryData.complianceRate > 90 ? 'bg-green-500' : 
              deliveryData.complianceRate > 75 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${deliveryData.complianceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Stock critique */}
      {deliveryData.criticalStock.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock critique</span>
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">
              {deliveryData.criticalStock.length}
            </span>
          </div>
          <div className="space-y-2">
            {deliveryData.criticalStock.map((stock) => (
              <div key={stock.id} className="flex items-center justify-between py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stock.item}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stock.supplier}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">
                    {stock.currentStock}/{stock.minStock}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Stock</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prochaines livraisons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Prochaines livraisons</h4>
        <div className="space-y-2">
          {deliveryData.upcomingDeliveries.slice(0, 3).map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(delivery.status)}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.supplier}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(delivery.expectedDate).toLocaleDateString('fr-FR')} • {delivery.items.join(', ')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatAmount(delivery.value)}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
                  {delivery.status === 'on_time' ? 'À temps' : 
                   delivery.status === 'delayed' ? 'Retard' : 'Critique'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Valeur totale</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatAmount(deliveryData.totalValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Délai moyen</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {deliveryData.averageDeliveryTime}j
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySupplyWidget;

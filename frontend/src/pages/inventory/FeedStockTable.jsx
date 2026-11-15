import React, { useState } from 'react';
import { Wheat, Plus, AlertTriangle, CheckCircle2, ArrowDownCircle, RefreshCw, Utensils } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { InitialiseFeedingModal } from './InitialiseFeedingModal';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FeedStockTable = () => {
  const { feedStock, addFeedStock, updateFeedStock } = useFarm();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [restockModal, setRestockModal] = useState({ isOpen: false, item: null, addQty: '500' });
  const [feedingModal, setFeedingModal] = useState({ isOpen: false, item: null });

  const [formData, setFormData] = useState({
    name: '',
    category: 'Concentrate',
    currentStock: '3000',
    unit: 'kg',
    reorderThreshold: '1500',
    costPerUnit: '0.45',
    supplier: 'Apex Feed Mills Ltd',
    location: 'Silo C'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addFeedStock({
      ...formData,
      currentStock: parseFloat(formData.currentStock) || 0,
      reorderThreshold: parseFloat(formData.reorderThreshold) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
      lastRestocked: new Date().toISOString().split('T')[0]
    });
    setAddModalOpen(false);
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockModal.item) return;
    const added = parseFloat(restockModal.addQty) || 0;
    updateFeedStock(restockModal.item.id, {
      currentStock: restockModal.item.currentStock + added,
      lastRestocked: new Date().toISOString().split('T')[0]
    });
    setRestockModal({ isOpen: false, item: null, addQty: '500' });
  };

  const lowStockItems = feedStock.filter(f => f.currentStock <= f.reorderThreshold);

  return (
    <div className="space-y-6">
      {/* Low stock warning banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide">
                Automated Inventory Warning: {lowStockItems.length} Feed Line(s) Below Minimum Reorder Level
              </h4>
              <p className="text-xs text-amber-50 mt-0.5">
                {lowStockItems.map(i => `${i.name} (${i.currentStock} ${i.unit})`).join(', ')} require replenishment to prevent herd ration deficits.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setRestockModal({ isOpen: true, item: lowStockItems[0], addQty: '500' })}
            className="shrink-0 bg-white text-amber-900 border-none font-bold"
          >
            Restock Item
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Barn Feed & Ration Inventory</h3>
          <p className="text-xs text-slate-500">Stockpile tracking for concentrates, dry forage bales, pit silage, and minerals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="dairy"
            icon={Utensils}
            onClick={() => setFeedingModal({ isOpen: true, item: feedStock[0] })}
          >
            Initialise Feeding
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            Add Feed Item
          </Button>
        </div>
      </div>

      {/* Add Item Drawer */}
      {addModalOpen && (
        <Card
          title="Register New Feed Stock Commodity"
          subtitle="Define unit, reorder alerts, and supplier procurement cost"
          className="border-2 border-farm-400 bg-farm-50/20"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Feed Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Dairy Meal 18% CP"
                required
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                options={[
                  'Concentrate',
                  'Forage / Roughage',
                  'Silage',
                  'Minerals & Supplements',
                  'Calf Starter & Milk Replacer'
                ]}
              />
              <Select
                label="Unit of Measurement"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                options={['kg', 'bales', 'tons', 'blocks', 'bags']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Starting Stock Level"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                required
              />
              <Input
                label="Reorder Alert Threshold"
                type="number"
                value={formData.reorderThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderThreshold: e.target.value }))}
                required
              />
              <Input
                label="Unit Cost ($)"
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                required
              />
              <Input
                label="Storage Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Silo A"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Feed Item
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Restock Modal */}
      {restockModal.isOpen && (
        <Card
          title={`Restock: ${restockModal.item?.name}`}
          subtitle={`Current stock: ${restockModal.item?.currentStock} ${restockModal.item?.unit}`}
          className="border-2 border-emerald-400 bg-emerald-50/30"
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <Input
              label={`Quantity to Add (${restockModal.item?.unit})`}
              type="number"
              value={restockModal.addQty}
              onChange={(e) => setRestockModal(prev => ({ ...prev, addQty: e.target.value }))}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRestockModal({ isOpen: false, item: null, addQty: '0' })}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Intake
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stock Levels Table */}
      <Card title="Current Stock Levels & Storage Depots" subtitle="Real-time volume available with direct feeding dispatch">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Feed Commodity</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Available Stock</th>
                <th className="py-3 px-3">Reorder Alert Level</th>
                <th className="py-3 px-3">Cost / Unit</th>
                <th className="py-3 px-3">Storage Depot</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {feedStock.map((item) => {
                const isLow = item.currentStock <= item.reorderThreshold;
                return (
                  <tr key={item.id} className={isLow ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-3 text-slate-600">{item.category}</td>
                    <td className="py-3 px-3">
                      <span className={`font-black text-sm ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                        {item.currentStock.toLocaleString()} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{item.reorderThreshold} {item.unit}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{formatCurrency(item.costPerUnit)} / {item.unit}</td>
                    <td className="py-3 px-3 text-slate-600">{item.location}</td>
                    <td className="py-3 px-3">
                      <Badge variant={isLow ? 'warning' : 'active'} size="sm">
                        {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Utensils}
                          onClick={() => setFeedingModal({ isOpen: true, item })}
                          className="py-1 px-2.5 text-xs font-bold bg-farm-600 hover:bg-farm-700 text-white shadow-sm"
                        >
                          Initialise Feeding
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRestockModal({ isOpen: true, item, addQty: '500' })}
                          className="py-1 px-2.5 text-xs font-semibold"
                        >
                          Restock
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dedicated Initialise Feeding Modal with Full Specifications */}
      <InitialiseFeedingModal
        isOpen={feedingModal.isOpen}
        feedItem={feedingModal.item}
        onClose={() => setFeedingModal({ isOpen: false, item: null })}
      />
    </div>
  );
};

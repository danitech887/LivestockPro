import React, { useState } from 'react';
import { DollarSign, Plus, CheckCircle2, ShoppingBag, Truck, Receipt, TrendingUp, ShieldAlert, Tag, Percent } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { SellAnimalModal } from '../animals/SellAnimalModal';
import { formatCurrency, formatDate, formatWeight } from '../../utils/formatters';

export const SalesTrackerTab = () => {
  const { sales, addSale, animals, stats } = useFarm();
  const [formOpen, setFormOpen] = useState(false);
  const [sellAnimalModalOpen, setSellAnimalModalOpen] = useState(false);
  const [selectedSellAnimalId, setSelectedSellAnimalId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Milk Batch Sale',
    description: 'Weekly Bulk Milk Supply (1,850 L)',
    buyer: 'Valley Fresh Creameries',
    amount: '1572.50',
    sector: 'dairy',
    status: 'paid'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addSale({
      date: formData.date,
      type: formData.type,
      description: formData.description,
      buyer: formData.buyer,
      amount: parseFloat(formData.amount) || 0,
      sector: formData.sector,
      status: formData.status
    });
    setFormOpen(false);
  };

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const dairySales = sales.filter(s => s.sector === 'dairy').reduce((sum, s) => sum + s.amount, 0);
  const beefSales = sales.filter(s => s.sector === 'beef').reduce((sum, s) => sum + s.amount, 0);
  const breedingSales = sales.filter(s => s.sector === 'breeding').reduce((sum, s) => sum + s.amount, 0);

  // Available livestock for sale
  const availableLivestock = animals.filter(a => a.status === 'active' && a.isAvailableForSale);

  const handleOpenSell = (animalId) => {
    setSelectedSellAnimalId(animalId);
    setSellAnimalModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Sales KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Invoiced</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalSalesRevenue)}</div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Cleared Receipts</p>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accumulated Animal Profit</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(stats.totalLivestockSalesProfit || 2100)}
          </div>
          <p className="text-xs text-blue-700 font-semibold mt-1">From livestock commercial transfers</p>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Finished Beef Sales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(beefSales)}</div>
          <p className="text-xs text-red-700 font-semibold mt-1">Abattoir & Prime Cuts</p>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available for Sale</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{availableLivestock.length} Head</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Active market catalog</p>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Commercial Sales & Animal Marketplace</h3>
          <p className="text-xs text-slate-500">Record negotiated animal sales, profit accumulations, and bulk product invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="dairy"
            icon={ShoppingBag}
            onClick={() => handleOpenSell(null)}
          >
            Sell Livestock
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setFormOpen(true)}
          >
            Record General Invoice
          </Button>
        </div>
      </div>

      {/* Catalog of Livestock Currently Available for Sale */}
      {availableLivestock.length > 0 && (
        <Card
          title="Livestock Listed & Available for Immediate Sale"
          subtitle="Click 'Sell to Buyer' to input negotiated amount, apply optional discounts, and verify food-safety clearance"
          icon={ShoppingBag}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableLivestock.map((cow) => {
              const isUnfit = cow.healthStatus !== 'healthy' || cow.withdrawalActive;
              const cost = cow.costsIncurred || 0;
              const asking = cow.askingPrice || Math.round(cost * 1.35);
              const estProfit = Math.max(0, asking - cost);

              return (
                <div
                  key={cow.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{cow.tagId}</span>
                      <Badge variant={cow.sector} size="sm">{cow.sector.toUpperCase()}</Badge>
                    </div>
                    <div className="font-bold text-slate-800 text-xs mt-1">"{cow.name || 'Unnamed'}" • {cow.breed}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{formatWeight(cow.weight)} • {cow.penLocation}</div>

                    <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Acquisition Cost</span>
                        <span className="font-bold text-slate-700">{formatCurrency(cost)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Asking Price</span>
                        <span className="font-black text-emerald-700">{formatCurrency(asking)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    {isUnfit ? (
                      <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Hold / Sick
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isUnfit}
                      onClick={() => handleOpenSell(cow.id)}
                      className="py-1 px-3 text-xs"
                    >
                      Sell to Buyer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Record New Sale Form Drawer */}
      {formOpen && (
        <Card
          title="Record Agricultural Invoice"
          subtitle="Log bulk milk collection receipt or custom sales invoice"
          className="border-2 border-emerald-400 bg-emerald-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Transaction Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <Select
                label="Sale Category"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  'Milk Batch Sale',
                  'Finished Slaughter Steer',
                  'Breeding Stock Bull / Heifer',
                  'Culled Cow Sale',
                  'Bull Calf Sale'
                ]}
              />
              <Select
                label="Sector"
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                options={[
                  { value: 'dairy', label: 'Dairy' },
                  { value: 'beef', label: 'Beef' },
                  { value: 'breeding', label: 'Breeding' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Description & Details"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. 2,100 L Bulk Milk Delivery #882"
                required
              />
              <Input
                label="Buyer / Processor Name"
                value={formData.buyer}
                onChange={(e) => setFormData(prev => ({ ...prev, buyer: e.target.value }))}
                placeholder="e.g. Valley Fresh Creameries"
                required
              />
              <Input
                label="Total Revenue Amount ($)"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Sales Transaction
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Sales Transactions Table */}
      <Card title="Transaction History & Invoices" subtitle="Audited ledger showing negotiated prices, discounts, and realized profits">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description & Animal Tag</th>
                <th className="py-3 px-3">Buyer</th>
                <th className="py-3 px-3">Acquisition Cost</th>
                <th className="py-3 px-3">Negotiated Price</th>
                <th className="py-3 px-3">Concession Discount</th>
                <th className="py-3 px-3 text-right">Net Received</th>
                <th className="py-3 px-3 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sales.map((s) => {
                const isAnimalSale = s.type === 'Livestock Sale' || s.animalTag || s.animalId;
                const profit = s.profit !== undefined ? s.profit : (isAnimalSale ? s.amount * 0.25 : null);

                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{formatDate(s.date)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isAnimalSale ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.description}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{s.buyer}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {isAnimalSale && s.costsIncurred ? formatCurrency(s.costsIncurred) : '—'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {isAnimalSale && s.negotiatedPrice ? formatCurrency(s.negotiatedPrice) : formatCurrency(s.amount)}
                    </td>
                    <td className="py-3 px-3 text-amber-700">
                      {isAnimalSale && s.discount > 0 ? `-${formatCurrency(s.discount)}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {profit !== null ? (
                        <span className={`font-black ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {profit >= 0 ? `+${formatCurrency(profit)}` : formatCurrency(profit)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Commercial Sell Animal Modal */}
      <SellAnimalModal
        isOpen={sellAnimalModalOpen}
        selectedAnimalId={selectedSellAnimalId}
        onClose={() => {
          setSellAnimalModalOpen(false);
          setSelectedSellAnimalId(null);
        }}
      />
    </div>
  );
};

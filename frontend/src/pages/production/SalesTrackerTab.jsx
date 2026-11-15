import React, { useState } from 'react';
import { DollarSign, Plus, CheckCircle2, ShoppingBag, Truck, Receipt } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SalesTrackerTab = () => {
  const { sales, addSale } = useFarm();
  const [formOpen, setFormOpen] = useState(false);

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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dairy Milk & Cull Sales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(dairySales)}</div>
          <p className="text-xs text-blue-700 font-semibold mt-1">Bulk Creamery Deliveries</p>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Finished Beef Sales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(beefSales)}</div>
          <p className="text-xs text-red-700 font-semibold mt-1">Abattoir & Prime Cuts</p>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pedigree Breeding Stock</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(breedingSales)}</div>
          <p className="text-xs text-purple-700 font-semibold mt-1">Breeding Bulls & Heifers</p>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-base">Sales Receipts & Commercial Ledger</h3>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setFormOpen(true)}
        >
          Record Sale Receipt
        </Button>
      </div>

      {/* Record New Sale Form Drawer */}
      {formOpen && (
        <Card
          title="Record Agricultural Sale"
          subtitle="Log bulk milk collection receipt, finished steer invoice, or livestock sale"
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
      <Card title="Transaction History & Invoices" subtitle="Verified audit log of all farm income">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Commercial Buyer</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(s.date)}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.type}</td>
                  <td className="py-3 px-3 text-slate-700">{s.description}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{s.buyer}</td>
                  <td className="py-3 px-3">
                    <Badge variant={s.sector} size="sm">
                      {s.sector?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-700">
                    {formatCurrency(s.amount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      PAID
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { DollarSign, Plus, Tag, Truck, Wrench, Shield, Users, Fuel } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ExpenseManager = () => {
  const { expenses, addExpense } = useFarm();
  const [formOpen, setFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Feed Purchases',
    description: '',
    amount: '',
    sector: 'dairy',
    allocatedTo: 'Milking Herd'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Feed Purchases',
      description: '',
      amount: '',
      sector: 'dairy',
      allocatedTo: 'Milking Herd'
    });
    setFormOpen(false);
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categories = [
    'Feed Purchases',
    'Veterinary & Medicine',
    'Labor & Wages',
    'Utilities & Power',
    'Machinery & Fuel',
    'Hay & Forage'
  ];

  return (
    <div className="space-y-6">
      {/* Top Categorized Outflows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const catTotal = expenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0);

          return (
            <div key={cat} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {cat}
              </span>
              <div className="text-base font-black text-slate-900 mt-1">
                {formatCurrency(catTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Expense Allocation & Farm Operations Ledger</h3>
          <p className="text-xs text-slate-500">Track and apportion invoices across dairy, beef, and farm overhead</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setFormOpen(true)}
        >
          Record Farm Expense
        </Button>
      </div>

      {/* Add Expense Form Drawer */}
      {formOpen && (
        <Card
          title="Record Farm Outflow / Invoice"
          subtitle="Auto-apportion to respective enterprise sector"
          className="border-2 border-red-300 bg-red-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Invoice Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <Select
                label="Expense Category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                options={categories}
              />
              <Select
                label="Sector Apportionment"
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                options={[
                  { value: 'dairy', label: 'Dairy Enterprise' },
                  { value: 'beef', label: 'Beef Enterprise' },
                  { value: 'general', label: 'Farm-Wide General Overhead' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Expense Description & Supplier"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. Bulk Silage delivery, Dr. Evans herd audit"
                required
              />
              <Input
                label="Cost Center / Allocated Group"
                value={formData.allocatedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, allocatedTo: e.target.value }))}
                placeholder="e.g. Milking Herd Parlor, Paddock 2"
                required
              />
              <Input
                label="Total Cost Amount ($)"
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
                Save Expense Entry
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Expenses Table */}
      <Card title="Itemized Operating Invoices" subtitle="Audited expense record">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description & Vendor</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3">Allocated Cost Center</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(e.date)}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{e.category}</td>
                  <td className="py-3 px-3 text-slate-700">{e.description}</td>
                  <td className="py-3 px-3">
                    <Badge variant={e.sector === 'general' ? 'default' : e.sector} size="sm">
                      {e.sector?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{e.allocatedTo || 'General'}</td>
                  <td className="py-3 px-3 text-right font-black text-red-600">
                    -{formatCurrency(e.amount)}
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

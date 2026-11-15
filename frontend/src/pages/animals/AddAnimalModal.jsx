import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useFarm } from '../../context/FarmContext';

export const AddAnimalModal = ({ isOpen, onClose }) => {
  const { addAnimal } = useFarm();

  const [formData, setFormData] = useState({
    tagId: '',
    rfid: '',
    name: '',
    sector: 'dairy',
    breed: 'Holstein Friesian',
    gender: 'female',
    birthDate: new Date().toISOString().split('T')[0],
    weight: '450',
    dam: '',
    sire: '',
    penLocation: 'Barn 1',
    status: 'active',
    notes: '',
    costsIncurred: '500',
    intakeType: 'birth' // 'birth', 'purchase', 'batch'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.tagId.trim()) newErrors.tagId = 'Tag ID is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = 'Weight must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addAnimal({
      ...formData,
      weight: parseFloat(formData.weight) || 400,
      costsIncurred: parseFloat(formData.costsIncurred) || 0,
      revenueGenerated: 0,
      withdrawalActive: false,
      withdrawalDaysLeft: 0,
      currentYield: formData.sector === 'dairy' ? 24.0 : 0,
      lactationNumber: formData.sector === 'dairy' ? 1 : 0
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Livestock"
      subtitle="Record new birth, herd purchase, or batch intake into registry"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Intake Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, intakeType: 'birth' }))}
            className={`py-2 rounded-lg transition-all ${
              formData.intakeType === 'birth' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Calving Birth
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, intakeType: 'purchase' }))}
            className={`py-2 rounded-lg transition-all ${
              formData.intakeType === 'purchase' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Purchased Animal
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, intakeType: 'batch' }))}
            className={`py-2 rounded-lg transition-all ${
              formData.intakeType === 'batch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Batch Intake
          </button>
        </div>

        {/* Basic Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Visual Ear Tag ID"
            name="tagId"
            value={formData.tagId}
            onChange={handleChange}
            placeholder="e.g. LP-110"
            error={errors.tagId}
            required
          />
          <Input
            label="Electronic RFID"
            name="rfid"
            value={formData.rfid}
            onChange={handleChange}
            placeholder="e.g. 982 000 412 110"
          />
          <Input
            label="Animal Name / Nickname"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Clarabelle"
          />
        </div>

        {/* Sector, Breed, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Sector Assignment"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            options={[
              { value: 'dairy', label: 'Dairy (Milk & Calves)' },
              { value: 'beef', label: 'Beef (Feedlot & Finishing)' },
              { value: 'breeding', label: 'Breeding Stock / Bulls' }
            ]}
          />
          <Select
            label="Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            options={[
              'Holstein Friesian',
              'Jersey',
              'Ayrshire',
              'Guernsey',
              'Black Angus',
              'Hereford',
              'Charolais Cross',
              'Simmental',
              'Brahman'
            ]}
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'female', label: 'Female (Heifer / Cow)' },
              { value: 'male', label: 'Male (Bull / Steer)' }
            ]}
          />
        </div>

        {/* Birth Date, Initial Weight, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Birth / Intake Date"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Initial Weight (kg)"
            type="number"
            step="0.5"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            error={errors.weight}
            required
          />
          <Input
            label="Barn / Pen Location"
            name="penLocation"
            value={formData.penLocation}
            onChange={handleChange}
            placeholder="e.g. Barn 1 - Pen C"
          />
        </div>

        {/* Lineage Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <Input
            label="Dam (Mother Tag / Name)"
            name="dam"
            value={formData.dam}
            onChange={handleChange}
            placeholder="e.g. LP-074 (Buttercup)"
          />
          <Input
            label="Sire (Father / AI Straw Code)"
            name="sire"
            value={formData.sire}
            onChange={handleChange}
            placeholder="e.g. LP-S01 (Jersey Gold)"
          />
        </div>

        {/* Financial Valuation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Acquisition / Intake Cost ($)"
            type="number"
            step="10"
            name="costsIncurred"
            value={formData.costsIncurred}
            onChange={handleChange}
            helperText="Purchase price or baseline rearing valuation"
          />
          <Input
            label="Field Notes / Distinguishing Marks"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. White star on forehead, twin calf"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Livestock Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};

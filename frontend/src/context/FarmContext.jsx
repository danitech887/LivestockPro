import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useOfflineSync } from './OfflineSyncContext';

const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
  const { queueAction } = useOfflineSync();

  // Sector filter: 'all', 'dairy', 'beef'
  const [sectorFilter, setSectorFilter] = useState('all');

  // Core domain states
  const [animals, setAnimals] = useState([]);
  const [milkRecords, setMilkRecords] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [reproduction, setReproduction] = useState([]);
  const [feedStock, setFeedStock] = useState([]);
  const [feedConsumption, setFeedConsumption] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const refreshData = () => {
    setAnimals(api.getAnimals());
    setMilkRecords(api.getMilkRecords());
    setWeightLogs(api.getWeightLogs());
    setTreatments(api.getTreatments());
    setReproduction(api.getReproduction());
    setFeedStock(api.getFeedStock());
    setFeedConsumption(api.getFeedConsumption());
    setSales(api.getSales());
    setExpenses(api.getExpenses());
    setActivities(api.getActivity());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // CRUD actions wrapped with optimistic state and offline queueing
  const addAnimal = (animalData) => {
    const created = api.addAnimal(animalData);
    setAnimals(api.getAnimals());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_ANIMAL', payload: created });
    return created;
  };

  const updateAnimal = (id, updates) => {
    const updated = api.updateAnimal(id, updates);
    setAnimals(api.getAnimals());
    queueAction({ type: 'UPDATE_ANIMAL', id, updates });
    return updated;
  };

  const deleteAnimal = (id) => {
    api.deleteAnimal(id);
    setAnimals(api.getAnimals());
    queueAction({ type: 'DELETE_ANIMAL', id });
  };

  const addMilkRecord = (data) => {
    const created = api.addMilkRecord(data);
    setMilkRecords(api.getMilkRecords());
    setAnimals(api.getAnimals());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_MILK', payload: created });
    return created;
  };

  const addWeightLog = (data) => {
    const created = api.addWeightLog(data);
    setWeightLogs(api.getWeightLogs());
    setAnimals(api.getAnimals());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_WEIGHT', payload: created });
    return created;
  };

  const addTreatment = (data) => {
    const created = api.addTreatment(data);
    setTreatments(api.getTreatments());
    setAnimals(api.getAnimals());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_TREATMENT', payload: created });
    return created;
  };

  const addReproduction = (data) => {
    const created = api.addReproduction(data);
    setReproduction(api.getReproduction());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_REPRODUCTION', payload: created });
    return created;
  };

  const addFeedStock = (data) => {
    const created = api.addFeedStock(data);
    setFeedStock(api.getFeedStock());
    queueAction({ type: 'ADD_FEED_STOCK', payload: created });
    return created;
  };

  const updateFeedStock = (id, updates) => {
    const updated = api.updateFeedStock(id, updates);
    setFeedStock(api.getFeedStock());
    queueAction({ type: 'UPDATE_FEED_STOCK', id, updates });
    return updated;
  };

  const addFeedConsumption = (data) => {
    const created = api.addFeedConsumption(data);
    setFeedConsumption(api.getFeedConsumption());
    setFeedStock(api.getFeedStock());
    queueAction({ type: 'ADD_FEED_CONSUMPTION', payload: created });
    return created;
  };

  const addSale = (data) => {
    const created = api.addSale(data);
    setSales(api.getSales());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_SALE', payload: created });
    return created;
  };

  const addExpense = (data) => {
    const created = api.addExpense(data);
    setExpenses(api.getExpenses());
    setActivities(api.getActivity());
    queueAction({ type: 'ADD_EXPENSE', payload: created });
    return created;
  };

  const sellAnimal = (saleDetails) => {
    const res = api.sellAnimal(saleDetails);
    if (res.success) {
      setAnimals(api.getAnimals());
      setSales(api.getSales());
      setActivities(api.getActivity());
      queueAction({ type: 'SELL_ANIMAL', payload: saleDetails });
    }
    return res;
  };

  const toggleAnimalSaleAvailability = (id, isAvailable, askingPrice) => {
    const updated = api.toggleAnimalSaleAvailability(id, isAvailable, askingPrice);
    if (updated) {
      setAnimals(api.getAnimals());
      setActivities(api.getActivity());
      queueAction({ type: 'TOGGLE_SALE_AVAILABILITY', id, isAvailable, askingPrice });
    }
    return updated;
  };

  const resetAllData = () => {
    api.resetDemoData();
    refreshData();
  };

  // Filtered livestock based on sector toggle
  const filteredAnimals = useMemo(() => {
    if (sectorFilter === 'all') return animals;
    return animals.filter(a => a.sector === sectorFilter);
  }, [animals, sectorFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const activeHerd = animals.filter(a => a.status === 'active');
    const dairyHerd = activeHerd.filter(a => a.sector === 'dairy');
    const beefHerd = activeHerd.filter(a => a.sector === 'beef');

    const totalActiveCount = sectorFilter === 'dairy' 
      ? dairyHerd.length 
      : sectorFilter === 'beef' 
        ? beefHerd.length 
        : activeHerd.length;

    // Average Daily Milk Yield (L)
    const dairyProducing = dairyHerd.filter(a => (a.currentYield || 0) > 0);
    const avgMilkYield = dairyProducing.length > 0
      ? dairyProducing.reduce((sum, a) => sum + (a.currentYield || 0), 0) / dairyProducing.length
      : 26.5;

    // Average Daily Gain (ADG) for Beef
    const beefWithAdg = beefHerd.filter(a => (a.adg || 0) > 0);
    const avgAdg = beefWithAdg.length > 0
      ? beefWithAdg.reduce((sum, a) => sum + (a.adg || 0), 0) / beefWithAdg.length
      : 1.65;

    // Net Farm Income MTD (Sales minus Expenses)
    const totalSales = sales.reduce((sum, s) => {
      if (sectorFilter === 'all') return sum + s.amount;
      if (s.sector === sectorFilter) return sum + s.amount;
      return sum;
    }, 0);

    const totalExp = expenses.reduce((sum, e) => {
      if (sectorFilter === 'all') return sum + e.amount;
      if (e.sector === sectorFilter || e.sector === 'general') return sum + e.amount;
      return sum;
    }, 0);

    const netIncomeMTD = totalSales - totalExp;

    // Animals with active withdrawal
    const withdrawalCount = animals.filter(a => a.withdrawalActive).length;

    // Low stock alerts
    const lowStockCount = feedStock.filter(f => f.currentStock <= f.reorderThreshold).length;

    // Animals available for sale
    const availableForSaleCount = animals.filter(a => a.status === 'active' && a.isAvailableForSale).length;

    // Total accumulated profit from all livestock sales
    const livestockSales = sales.filter(s => s.type === 'Livestock Sale' || s.animalTag || s.animalId);
    const totalLivestockSalesProfit = livestockSales.reduce((sum, s) => sum + (s.profit !== undefined ? s.profit : (s.amount * 0.25)), 0);
    const soldLivestockCount = animals.filter(a => a.status === 'sold').length;

    return {
      totalActiveCount,
      dairyCount: dairyHerd.length,
      beefCount: beefHerd.length,
      avgMilkYield: Number(avgMilkYield.toFixed(1)),
      avgAdg: Number(avgAdg.toFixed(2)),
      totalSales,
      totalExpenses: totalExp,
      netIncomeMTD,
      withdrawalCount,
      lowStockCount,
      availableForSaleCount,
      totalLivestockSalesProfit,
      soldLivestockCount
    };
  }, [animals, sales, expenses, feedStock, sectorFilter]);

  return (
    <FarmContext.Provider
      value={{
        sectorFilter,
        setSectorFilter,
        animals,
        filteredAnimals,
        milkRecords,
        weightLogs,
        treatments,
        reproduction,
        feedStock,
        feedConsumption,
        sales,
        expenses,
        activities,
        stats,
        loading,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        addMilkRecord,
        addWeightLog,
        addTreatment,
        addReproduction,
        addFeedStock,
        updateFeedStock,
        addFeedConsumption,
        addSale,
        addExpense,
        sellAnimal,
        toggleAnimalSaleAvailability,
        resetAllData,
        refreshData
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
};

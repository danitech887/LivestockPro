import {
  initialAnimals,
  initialMilkRecords,
  initialWeightLogs,
  initialTreatments,
  initialReproduction,
  initialFeedStock,
  initialFeedConsumption,
  initialSales,
  initialExpenses,
  initialActivityFeed
} from './mockData';

// Storage keys
const STORAGE_KEYS = {
  ANIMALS: 'livestockpro_animals',
  MILK: 'livestockpro_milk',
  WEIGHTS: 'livestockpro_weights',
  TREATMENTS: 'livestockpro_treatments',
  REPRODUCTION: 'livestockpro_reproduction',
  FEED_STOCK: 'livestockpro_feed_stock',
  FEED_CONSUMPTION: 'livestockpro_feed_consumption',
  SALES: 'livestockpro_sales',
  EXPENSES: 'livestockpro_expenses',
  ACTIVITY: 'livestockpro_activity',
  SYNC_QUEUE: 'livestockpro_sync_queue',
  FARM_CONFIG: 'livestockpro_farm_config'
};

// Safe JSON get/set helpers
const load = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
};

const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
};

export const api = {
  // Animals
  getAnimals: () => load(STORAGE_KEYS.ANIMALS, initialAnimals),
  saveAnimals: (animals) => save(STORAGE_KEYS.ANIMALS, animals),
  addAnimal: (animal) => {
    const current = load(STORAGE_KEYS.ANIMALS, initialAnimals);
    const newAnimal = {
      ...animal,
      id: animal.id || `a_${Date.now()}`,
      costsIncurred: Number(animal.costsIncurred || 0),
      revenueGenerated: Number(animal.revenueGenerated || 0)
    };
    const updated = [newAnimal, ...current];
    save(STORAGE_KEYS.ANIMALS, updated);
    
    // Add activity
    api.addActivity({
      type: 'animal',
      title: 'New Livestock Registered',
      description: `Tag ${newAnimal.tagId} (${newAnimal.name || 'Unnamed'}) added to ${newAnimal.sector.toUpperCase()} sector.`,
      sector: newAnimal.sector
    });
    
    return newAnimal;
  },
  updateAnimal: (id, updates) => {
    const current = load(STORAGE_KEYS.ANIMALS, initialAnimals);
    const updated = current.map(a => a.id === id ? { ...a, ...updates } : a);
    save(STORAGE_KEYS.ANIMALS, updated);
    return updated.find(a => a.id === id);
  },
  deleteAnimal: (id) => {
    const current = load(STORAGE_KEYS.ANIMALS, initialAnimals);
    const updated = current.filter(a => a.id !== id);
    save(STORAGE_KEYS.ANIMALS, updated);
    return true;
  },
  toggleAnimalSaleAvailability: (id, isAvailable, askingPrice) => {
    const current = load(STORAGE_KEYS.ANIMALS, initialAnimals);
    const target = current.find(a => a.id === id);
    if (!target) return null;

    const updates = {
      isAvailableForSale: Boolean(isAvailable),
      ...(askingPrice !== undefined ? { askingPrice: Number(askingPrice) } : {})
    };

    const updated = current.map(a => a.id === id ? { ...a, ...updates } : a);
    save(STORAGE_KEYS.ANIMALS, updated);

    api.addActivity({
      type: 'sale',
      title: isAvailable ? 'Livestock Listed for Sale' : 'Livestock Unlisted from Sale',
      description: `Tag ${target.tagId} (${target.name || target.breed}) is ${isAvailable ? `now available for sale (Asking: $${updates.askingPrice || target.askingPrice || 0})` : 'no longer available for sale'}.`,
      sector: target.sector
    });

    return updated.find(a => a.id === id);
  },
  sellAnimal: ({ animalId, buyer, negotiatedPrice, discount = 0, notes = '', date }) => {
    const current = load(STORAGE_KEYS.ANIMALS, initialAnimals);
    const target = current.find(a => a.id === animalId);
    if (!target) {
      return { success: false, error: 'Animal record not found.' };
    }

    // Health condition & withdrawal check
    if (target.healthStatus !== 'healthy' || target.withdrawalActive) {
      return {
        success: false,
        error: `Cannot sell ${target.tagId}: Animal is currently under medical treatment or mandatory withdrawal period. Sale prohibited until cleared.`
      };
    }

    const grossPrice = Number(negotiatedPrice) || 0;
    const discountAmount = Math.max(0, Number(discount) || 0);
    const finalPrice = Math.max(0, grossPrice - discountAmount);
    const acquisitionCost = Number(target.costsIncurred || 0);
    const netProfit = finalPrice - acquisitionCost;
    const saleDate = date || new Date().toISOString().split('T')[0];

    const updatedAnimal = {
      ...target,
      status: 'sold',
      isAvailableForSale: false,
      soldDate: saleDate,
      soldPrice: finalPrice,
      soldBuyer: buyer,
      soldProfit: netProfit,
      revenueGenerated: (Number(target.revenueGenerated) || 0) + finalPrice,
      notes: notes ? `${target.notes ? target.notes + ' | ' : ''}Sold: ${notes}` : target.notes
    };

    const updatedAnimals = current.map(a => a.id === animalId ? updatedAnimal : a);
    save(STORAGE_KEYS.ANIMALS, updatedAnimals);

    // Add transaction to Sales ledger
    const currentSales = load(STORAGE_KEYS.SALES, initialSales);
    const newSale = {
      id: `s_${Date.now()}`,
      date: saleDate,
      type: 'Livestock Sale',
      description: `Direct Livestock Sale: Tag ${target.tagId} (${target.name || target.breed})`,
      buyer: buyer || 'Private Buyer',
      amount: finalPrice,
      sector: target.sector,
      status: 'paid',
      animalId: target.id,
      animalTag: target.tagId,
      costsIncurred: acquisitionCost,
      negotiatedPrice: grossPrice,
      discount: discountAmount,
      profit: netProfit,
      notes
    };
    save(STORAGE_KEYS.SALES, [newSale, ...currentSales]);

    // Add activity log
    api.addActivity({
      type: 'sale',
      title: `Livestock Sold: ${target.tagId} ($${finalPrice.toFixed(2)})`,
      description: `Sold to ${buyer} for $${finalPrice.toFixed(2)}. Incurred cost: $${acquisitionCost.toFixed(2)} | Net Profit: $${netProfit.toFixed(2)}${discountAmount > 0 ? ` (Includes $${discountAmount.toFixed(2)} concession discount)` : ''}.`,
      sector: target.sector
    });

    return {
      success: true,
      animal: updatedAnimal,
      sale: newSale,
      profit: netProfit
    };
  },

  // Milk Production
  getMilkRecords: () => load(STORAGE_KEYS.MILK, initialMilkRecords),
  addMilkRecord: (record) => {
    const current = load(STORAGE_KEYS.MILK, initialMilkRecords);
    const morning = Number(record.morningL || 0);
    const evening = Number(record.eveningL || 0);
    const total = morning + evening;
    const newRecord = {
      ...record,
      id: `m_${Date.now()}`,
      morningL: morning,
      eveningL: evening,
      totalL: total
    };
    save(STORAGE_KEYS.MILK, [newRecord, ...current]);

    // Update animal's current yield if it matches
    const animals = api.getAnimals();
    const target = animals.find(a => a.tagId === record.tagId);
    if (target) {
      api.updateAnimal(target.id, { currentYield: total });
    }

    // Add activity
    api.addActivity({
      type: 'production',
      title: 'Milk Yield Logged',
      description: `${total.toFixed(1)} L recorded for Tag ${record.tagId} (${record.name || 'Cow'}).`,
      sector: 'dairy'
    });

    return newRecord;
  },

  // Weight logs
  getWeightLogs: () => load(STORAGE_KEYS.WEIGHTS, initialWeightLogs),
  addWeightLog: (log) => {
    const current = load(STORAGE_KEYS.WEIGHTS, initialWeightLogs);
    const newLog = {
      ...log,
      id: `w_${Date.now()}`,
      weight: Number(log.weight),
      prevWeight: Number(log.prevWeight || 0),
      adg: Number(log.adg || 0)
    };
    save(STORAGE_KEYS.WEIGHTS, [newLog, ...current]);

    // Update animal's current weight
    const animals = api.getAnimals();
    const target = animals.find(a => a.tagId === log.tagId);
    if (target) {
      api.updateAnimal(target.id, { weight: newLog.weight, adg: newLog.adg });
    }

    api.addActivity({
      type: 'weight',
      title: 'Weight Sampling Recorded',
      description: `Tag ${log.tagId} weighed at ${newLog.weight} kg (ADG: +${newLog.adg} kg/day).`,
      sector: 'beef'
    });

    return newLog;
  },

  // Health / Treatments
  getTreatments: () => load(STORAGE_KEYS.TREATMENTS, initialTreatments),
  addTreatment: (treatment) => {
    const current = load(STORAGE_KEYS.TREATMENTS, initialTreatments);
    const milkWithdrawal = Number(treatment.withdrawalMilkDays || 0);
    const meatWithdrawal = Number(treatment.withdrawalMeatDays || 0);
    const isWithdrawalActive = milkWithdrawal > 0 || meatWithdrawal > 0;
    
    const newTreatment = {
      ...treatment,
      id: `t_${Date.now()}`,
      withdrawalStatus: isWithdrawalActive ? 'active' : 'completed',
      daysRemainingMilk: milkWithdrawal,
      daysRemainingMeat: meatWithdrawal
    };
    save(STORAGE_KEYS.TREATMENTS, [newTreatment, ...current]);

    // If withdrawal is active, mark animal with alert
    const animals = api.getAnimals();
    const target = animals.find(a => a.tagId === treatment.tagId);
    if (target && isWithdrawalActive) {
      api.updateAnimal(target.id, {
        withdrawalActive: true,
        withdrawalDaysLeft: Math.max(milkWithdrawal, meatWithdrawal),
        withdrawalType: milkWithdrawal > 0 && meatWithdrawal > 0 ? 'Milk & Meat' : milkWithdrawal > 0 ? 'Milk' : 'Meat',
        healthStatus: 'under_treatment'
      });
    }

    api.addActivity({
      type: 'alert',
      title: isWithdrawalActive ? 'Treatment Logged (Withdrawal Active)' : 'Health Treatment Administered',
      description: `${treatment.type} for Tag ${treatment.tagId} with ${treatment.drug}.`,
      sector: 'health'
    });

    return newTreatment;
  },

  // Reproduction
  getReproduction: () => load(STORAGE_KEYS.REPRODUCTION, initialReproduction),
  addReproduction: (item) => {
    const current = load(STORAGE_KEYS.REPRODUCTION, initialReproduction);
    const newItem = {
      ...item,
      id: `r_${Date.now()}`
    };
    save(STORAGE_KEYS.REPRODUCTION, [newItem, ...current]);

    api.addActivity({
      type: 'reproduction',
      title: 'Reproduction Event Logged',
      description: `Tag ${item.tagId} status: ${item.status || 'Service recorded'}.`,
      sector: 'dairy'
    });

    return newItem;
  },

  // Inventory / Feed Stock
  getFeedStock: () => load(STORAGE_KEYS.FEED_STOCK, initialFeedStock),
  addFeedStock: (item) => {
    const current = load(STORAGE_KEYS.FEED_STOCK, initialFeedStock);
    const newItem = {
      ...item,
      id: `f_${Date.now()}`,
      currentStock: Number(item.currentStock),
      reorderThreshold: Number(item.reorderThreshold),
      costPerUnit: Number(item.costPerUnit)
    };
    save(STORAGE_KEYS.FEED_STOCK, [newItem, ...current]);
    return newItem;
  },
  updateFeedStock: (id, updates) => {
    const current = load(STORAGE_KEYS.FEED_STOCK, initialFeedStock);
    const updated = current.map(f => f.id === id ? { ...f, ...updates } : f);
    save(STORAGE_KEYS.FEED_STOCK, updated);
    return updated.find(f => f.id === id);
  },

  // Feed Consumption
  getFeedConsumption: () => load(STORAGE_KEYS.FEED_CONSUMPTION, initialFeedConsumption),
  addFeedConsumption: (item) => {
    const current = load(STORAGE_KEYS.FEED_CONSUMPTION, initialFeedConsumption);
    const newItem = {
      ...item,
      id: `c_${Date.now()}`,
      quantityKg: Number(item.quantityKg),
      costTotal: Number(item.costTotal)
    };
    save(STORAGE_KEYS.FEED_CONSUMPTION, [newItem, ...current]);

    // Deduct stock if feed item is linked
    if (item.feedId) {
      const stocks = api.getFeedStock();
      const stock = stocks.find(s => s.id === item.feedId);
      if (stock) {
        api.updateFeedStock(stock.id, {
          currentStock: Math.max(0, stock.currentStock - newItem.quantityKg)
        });
      }
    }

    return newItem;
  },

  // Financial Sales
  getSales: () => load(STORAGE_KEYS.SALES, initialSales),
  addSale: (sale) => {
    const current = load(STORAGE_KEYS.SALES, initialSales);
    const newSale = {
      ...sale,
      id: `s_${Date.now()}`,
      amount: Number(sale.amount),
      status: sale.status || 'paid'
    };
    save(STORAGE_KEYS.SALES, [newSale, ...current]);

    api.addActivity({
      type: 'sale',
      title: 'Sales Receipt Logged',
      description: `${sale.description} - $${Number(sale.amount).toFixed(2)} (${sale.buyer})`,
      sector: sale.sector || 'finance'
    });

    return newSale;
  },

  // Financial Expenses
  getExpenses: () => load(STORAGE_KEYS.EXPENSES, initialExpenses),
  addExpense: (expense) => {
    const current = load(STORAGE_KEYS.EXPENSES, initialExpenses);
    const newExpense = {
      ...expense,
      id: `e_${Date.now()}`,
      amount: Number(expense.amount)
    };
    save(STORAGE_KEYS.EXPENSES, [newExpense, ...current]);

    api.addActivity({
      type: 'expense',
      title: 'Expense Recorded',
      description: `${expense.category}: $${Number(expense.amount).toFixed(2)} (${expense.description})`,
      sector: expense.sector || 'finance'
    });

    return newExpense;
  },

  // Activity Feed
  getActivity: () => load(STORAGE_KEYS.ACTIVITY, initialActivityFeed),
  addActivity: (activity) => {
    const current = load(STORAGE_KEYS.ACTIVITY, initialActivityFeed);
    const newAct = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    save(STORAGE_KEYS.ACTIVITY, [newAct, ...current.slice(0, 49)]); // keep recent 50
    return newAct;
  },

  // Reset demo data
  resetDemoData: () => {
    save(STORAGE_KEYS.ANIMALS, initialAnimals);
    save(STORAGE_KEYS.MILK, initialMilkRecords);
    save(STORAGE_KEYS.WEIGHTS, initialWeightLogs);
    save(STORAGE_KEYS.TREATMENTS, initialTreatments);
    save(STORAGE_KEYS.REPRODUCTION, initialReproduction);
    save(STORAGE_KEYS.FEED_STOCK, initialFeedStock);
    save(STORAGE_KEYS.FEED_CONSUMPTION, initialFeedConsumption);
    save(STORAGE_KEYS.SALES, initialSales);
    save(STORAGE_KEYS.EXPENSES, initialExpenses);
    save(STORAGE_KEYS.ACTIVITY, initialActivityFeed);
    return true;
  }
};

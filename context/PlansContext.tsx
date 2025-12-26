import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan } from '@/types/plan';
import { mockPlans } from '@/utils/mock-data';

const STORAGE_KEY = '@openinvite_plans';

interface PlansContextType {
  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => Plan | undefined;
  isLoading: boolean;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlans(JSON.parse(stored));
      } else {
        // Initialize with mock data on first launch
        setPlans(mockPlans);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockPlans));
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans(mockPlans);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlans = async (newPlans: Plan[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
    } catch (error) {
      console.error('Failed to save plans:', error);
    }
  };

  const addPlan = (planData: Omit<Plan, 'id' | 'createdAt'>) => {
    const newPlan: Plan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const newPlans = [newPlan, ...plans];
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    const newPlans = plans.map((plan) =>
      plan.id === id ? { ...plan, ...updates } : plan
    );
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const deletePlan = (id: string) => {
    const newPlans = plans.filter((plan) => plan.id !== id);
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const getPlanById = (id: string) => {
    return plans.find((plan) => plan.id === id);
  };

  return (
    <PlansContext.Provider
      value={{ plans, addPlan, updatePlan, deletePlan, getPlanById, isLoading }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
}

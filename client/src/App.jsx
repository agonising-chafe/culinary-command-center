import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ToastProvider';
import Layout from '@/components/Layout';

import WeeklyPlannerScreen from '@/screens/WeeklyPlannerScreen';
import PantryScreen from '@/screens/PantryScreen';
import ShoppingListScreen from '@/screens/ShoppingListScreen';
import RecipeBookScreen from '@/screens/RecipeBookScreen';
import SettingsScreen from '@/screens/SettingsScreen';

export default function App() {
  return (
    <ToastProvider position="top-right">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<WeeklyPlannerScreen />} />
            <Route path="/pantry" element={<PantryScreen />} />
            <Route path="/shopping-list" element={<ShoppingListScreen />} />
            <Route path="/recipes" element={<RecipeBookScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

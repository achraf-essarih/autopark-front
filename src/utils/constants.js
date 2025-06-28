 import { BarChart3, Car, Fuel, Wrench, FileText, ClipboardList, Shield, Filter, Eye, Lock, Settings2 } from 'lucide-react';

// Navigation menu items
export const NAV_ITEMS = [
  { path: '/', label: 'Tableau de bord', icon: BarChart3 },
  { path: '/parc-auto', label: 'Parc Auto', icon: Car },
  { path: '/consommations', label: 'Consommations', icon: Fuel },
  { path: '/interventions', label: 'Interventions', icon: Wrench },
  { path: '/ordres-missions', label: 'Ordres des missions', icon: ClipboardList },
  { path: '/rapports', label: 'Rapports', icon: FileText },
  
];

// Intervention tabs
export const INTERVENTION_TABS = [
  { id: 'assurance', label: 'Assurance', icon: Shield },
  { id: 'vidange', label: 'Vidange', icon: Filter },
  { id: 'vignette', label: 'Vignette', icon: Eye },
  { id: 'controle', label: 'Contrôle technique', icon: Lock },
  { id: 'mecanique', label: 'Intervention Mécanique', icon: Settings2 },
];

// Report tabs
export const REPORT_TABS = [
  { id: 'parc-auto', label: 'Situation du Parc Auto', icon: Car },
  { id: 'consommation', label: 'Consommation', icon: Fuel },
  { id: 'assurance', label: 'Assurance', icon: Shield },
  { id: 'vidange', label: 'Vidange', icon: Filter },
  { id: 'vignette', label: 'Vignette', icon: Eye },
  { id: 'controle', label: 'Contrôle technique', icon: Lock },
  { id: 'mecanique', label: 'Intervention Mécanique', icon: Settings2 },
];

// Arabic translations for reports
export const REPORT_TRANSLATIONS = {
  'parc-auto': 'وضعية حظيرة السيارات',
  'consommation': 'تقرير الاستهلاك',
  'assurance': 'تقرير التأمين',
  'vidange': 'تقرير تغيير الزيت',
  'vignette': 'تقرير الفينيت',
  'controle': 'تقرير الفحص التقني',
  'mecanique': 'تقرير التدخل الميكانيكي',
};

// Vehicle form options
export const VEHICLE_OPTIONS = {
  fuelTypes: ['Essence', 'Diesel'],
  transmissions: ['Manuelle', 'Automatique'],
  gears: ['5 Rapport', '6 Rapport'],
  doors: ['2 Port', '4 Port', '5 Port'],
  conditions: ['Mauvais', 'Bon', 'Excellent'],
}; 
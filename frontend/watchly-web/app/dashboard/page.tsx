'use client'

import React from 'react';
import MonitorsAdd from '@/components/monitors/MonitorsAdd';
import MonitorsList from '@/components/monitors/MonitorsList';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Monitors</h1>
      <MonitorsAdd />
      <MonitorsList />
    </div>
  );
}
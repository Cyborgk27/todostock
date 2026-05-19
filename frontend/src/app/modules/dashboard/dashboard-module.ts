import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout';
import { StatCard } from './components/stat-card/stat-card';
import { StockChart } from './components/stock-chart/stock-chart';
import { RouterOutlet } from '@angular/router';

@NgModule({
  declarations: [DashboardLayout, StatCard, StockChart],
  imports: [CommonModule, DashboardRoutingModule, RouterOutlet],
})
export class DashboardModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

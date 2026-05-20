import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayout } from './pages/dashboard-layout/dashboard-layout';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        loadChildren: () => import('../products/products-module').then(m => m.ProductsModule)
      },
      {
        path: 'invoices',
        loadChildren: () => import('../invoices/invoices-module').then(m => m.InvoicesModule)
      },
      {
        path: 'clients',
        loadChildren: () => import('../clients/clients-module').then(m => m.ClientsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }

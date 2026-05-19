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
        redirectTo: 'products', // Redirige por defecto al catálogo al entrar a /dashboard
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }

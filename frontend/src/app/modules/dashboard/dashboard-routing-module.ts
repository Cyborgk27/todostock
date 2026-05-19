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
        redirectTo: 'catalog', // Redirige por defecto al catálogo al entrar a /dashboard
        pathMatch: 'full'
      },
      {
        path: 'catalog',
        loadChildren: () => import('../products/products-module').then(m => m.ProductsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

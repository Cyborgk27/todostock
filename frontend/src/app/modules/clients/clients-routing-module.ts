import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListClients } from './pages/list-clients/list-clients';

const routes: Routes = [
  {
    path: '',
    component: ListClients,
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing-module';
import { ListClients } from './pages/list-clients/list-clients';
import { ClientForm } from './components/client-form/client-form';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [ListClients, ClientForm],
  imports: [CommonModule, ClientsRoutingModule, SharedModule],
})
export class ClientsModule {}

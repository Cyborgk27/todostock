import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing-module';
import { InvoiceList } from './pages/invoice-list/invoice-list';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [InvoiceList],
  imports: [CommonModule, InvoicesRoutingModule, SharedModule],
})
export class InvoicesModule {}

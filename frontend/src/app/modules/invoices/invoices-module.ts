import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing-module';
import { InvoiceList } from './pages/invoice-list/invoice-list';
import { SharedModule } from '../../shared/shared-module';
import { InvoiceForm } from './components/invoice-form/invoice-form';

@NgModule({
  declarations: [InvoiceList, InvoiceForm],
  imports: [CommonModule, InvoicesRoutingModule, SharedModule],
})
export class InvoicesModule {}

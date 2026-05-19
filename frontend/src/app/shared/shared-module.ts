import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DataFilter } from './components/data-filter/data-filter';
import { DataTable } from './components/data-table/data-table';
import { SinglePagination } from './components/single-pagination/single-pagination';
import { CustomInput } from './components/custom-input/custom-input';
import { FormsModule } from '@angular/forms';
import { CustomModal } from './components/custom-modal/custom-modal';

@NgModule({
  declarations: [DataFilter, DataTable, SinglePagination, CustomInput, CustomModal],
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  exports: [DataFilter, DataTable, SinglePagination, CustomInput],
})
export class SharedModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing-module';
import { ProductList } from './pages/product-list/product-list';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';
import { ProductForm } from './components/product-form/product-form';

@NgModule({
  declarations: [ProductList, ProductForm],
  imports: [CommonModule, ProductsRoutingModule, FormsModule, SharedModule],
})
export class ProductsModule {}

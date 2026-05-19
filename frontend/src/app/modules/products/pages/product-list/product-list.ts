import { Component, inject } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductosFacade } from '../../facade/product-facade';
import { TableAction, TableColumn } from '../../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styles: ``,
})
export class ProductList {
  public productsFacade = inject(ProductosFacade);
  private searchSubject = new Subject<string>();

  public productColumns: TableColumn[] = [
    { key: 'name', label: 'Producto', format: 'text' },
    { key: 'sku', label: 'SKU', format: 'text' },
    { key: 'price', label: 'Precio', format: 'currency' },
    { key: 'stock', label: 'Stock', format: 'text' }
  ];

  ngOnInit(): void {
    this.productsFacade.loadProducts();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((text) => {
      this.productsFacade.loadProducts(text, 1);
    });
  }
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number): void {
    this.productsFacade.loadProducts(undefined, page);
  }

  onEditProduct(product: any): void {
    console.log('Editar producto:', product);
    // Aquí abrirás tu modal o redirigirás al formulario de edición
  }

  onDeleteProduct(id: number): void {
    // Como tu componente genérico pasa directo el ID numérico
    if (confirm(`¿Estás seguro de eliminar el producto con ID #${id}?`)) {
      this.productsFacade.deleteProduct(id).subscribe();
    }
  }

  onSearchChange(value: string | number): void {
    this.searchSubject.next(String(value));
  }
}

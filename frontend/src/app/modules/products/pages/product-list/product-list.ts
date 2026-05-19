import { Component, inject, signal, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductosFacade } from '../../facade/product-facade';
import { TableAction, TableColumn } from '../../../../shared/components/data-table/data-table';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styles: ``,
})
export class ProductList {
  public productsFacade = inject(ProductosFacade);
  private searchSubject = new Subject<string>();

  @ViewChild(ProductForm) productForm!: ProductForm;

  public isModalOpen = signal<boolean>(false);
  public isEditing = signal<boolean>(false);
  public modalTitle = signal<string>('Nuevo Producto');

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

  onDeleteProduct(id: number): void {
    // Como tu componente genérico pasa directo el ID numérico
    if (confirm(`¿Estás seguro de eliminar el producto con ID #${id}?`)) {
      this.productsFacade.deleteProduct(id).subscribe();
    }
  }

  onSearchChange(value: string | number): void {
    this.searchSubject.next(String(value));
  }

  /**
   * Al hacer clic en "Nuevo Producto"
   */
  onNewProduct(): void {
    this.modalTitle.set('Nuevo Producto');
    this.productForm.reset(); // Limpiamos el hijo
    this.isModalOpen.set(true); // Abrimos el modal
    this.isEditing.set(false);
  }

  /**
 * Al hacer clic en "Editar" desde la tabla genérica
 */
  onEditProduct(productRow: any): void {
    this.productForm.reset(); // Nos aseguramos de limpiar estados viejos
    this.isModalOpen.set(true); // Abre el modal genérico
    this.isEditing.set(true);
    this.modalTitle.set('Editar Producto');

    // Dispara el flujo asíncrono de la fachada
    this.productForm.loadProductData(productRow.id);
  }

  /**
   * Acción del botón "Guardar" del Modal
   */
  handleSave(): void {
    this.productForm.save(); // El hijo se encarga de la API
    this.isModalOpen.set(false); // Cerramos el modal
  }

  /**
   * Al cerrar o cancelar el modal
   */
  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.productForm.reset();
  }
}

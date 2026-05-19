import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductosService } from '../../../core/api';
import { GetProductsList200Response } from '../../../core/api';
import { StoreProduct201Response } from '../../../core/api';
import { UpdateProduct200Response } from '../../../core/api';
import { DestroyProduct200Response } from '../../../core/api';
import { ShowProduct200Response } from '../../../core/api';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductosFacade {
  private productosApiService = inject(ProductosService);

  // 🔒 ESTADO PRIVADO (Signals de control)
  private _productsResponse = signal<GetProductsList200Response | null>(null);
  private _selectedProduct = signal<any | null>(null); // Ficha detallada del producto activo
  private _isLoading = signal<boolean>(false);
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);

  // 🌍 EXPOSICIÓN PÚBLICA (Read-only para la UI de TodoStock)
  public products = computed(() => this._productsResponse()?.data || []);
  public pagination = computed(() => {
    const response = this._productsResponse();
    const total = response?.total || 0;
    const perPage = response?.per_page || 10;

    const lastPage = total > 0 ? Math.ceil(total / perPage) : 1;

    return {
      currentPage: response?.current_page || 1,
      lastPage: lastPage,
      total: total,
      perPage: perPage
    };
  });

  public selectedProduct = computed(() => this._selectedProduct());
  public isLoading = computed(() => this._isLoading());
  public searchQuery = computed(() => this._searchQuery());

  /**
   * 🔍 Carga la lista paginada y filtrada de productos desde PostgreSQL
   * Guarda el estado globalmente para que cualquier componente o tabla lo consuma
   */
  loadProducts(search?: string, page?: number): void {
    this._isLoading.set(true);

    // Actualizamos los filtros en el estado local si se proveen
    if (search !== undefined) this._searchQuery.set(search);
    if (page !== undefined) this._currentPage.set(page);

    this.productosApiService.getProductsList(this._searchQuery(), this._currentPage()).subscribe({
      next: (res: GetProductsList200Response) => {
        this._productsResponse.set(res);
        this._isLoading.set(false);
      },
      error: () => {
        // Tu errorInterceptor ya muestra la alerta visual de SweetAlert2, solo apagamos el loading
        this._isLoading.set(false);
      }
    });
  }

  /**
   * 📝 Obtiene la ficha detallada de un producto por ID (para editar o ver detalles)
   */
  loadProductById(id: number): void {
    this._isLoading.set(true);
    this.productosApiService.showProduct(id).subscribe({
      next: (res: ShowProduct200Response) => {
        this._selectedProduct.set(res);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  /**
   * Registra un producto nuevo (Usa FormData nativo bajo cuerda vía OpenAPI)
   */
  createProduct(productData: {
    name: string;
    sku: string;
    stock: number;
    price: number;
    taxPercentage: number;
    description?: string;
    images?: Array<Blob>;
  }): Observable<StoreProduct201Response> {
    this._isLoading.set(true);

    return this.productosApiService.storeProduct(
      productData.name,
      productData.sku,
      productData.stock,
      productData.price,
      productData.taxPercentage,
      productData.description,
      productData.images
    ).pipe(
      tap({
        next: () => {
          this._isLoading.set(false);
          this.refresh();
        },
        error: () => this._isLoading.set(false)
      })
    );
  }

  /**
   * Modifica un producto existente usando POST simulado para multipart/form-data
   */
  updateProduct(id: number, productData: {
    name: string;
    sku: string;
    stock: number;
    price: number;
    taxPercentage: number;
    description?: string;
    images?: Array<Blob>;
  }): Observable<UpdateProduct200Response> {
    this._isLoading.set(true);

    return this.productosApiService.updateProduct(
      id,
      productData.name,
      productData.sku,
      productData.stock,
      productData.price,
      productData.taxPercentage,
      productData.description,
      productData.images
    ).pipe(
      tap({
        next: () => {
          this._isLoading.set(false);
          this.refresh();
        },
        error: () => this._isLoading.set(false)
      })
    );
  }

  /**
   * 🗑️ Elimina lógicamente un producto (Soft Delete)
   */
  deleteProduct(id: number): Observable<DestroyProduct200Response> {
    this._isLoading.set(true);

    return this.productosApiService.destroyProduct(id).pipe(
      tap({
        next: () => {
          this._isLoading.set(false);
          this.refresh();
        },
        error: () => this._isLoading.set(false)
      })
    );
  }

  /**
   * Limpia el producto seleccionado del estado (Útil al cerrar modales de edición)
   */
  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }

  /**
   * Método auxiliar para refrescar la vista actual manteniendo la página y búsqueda activa
   */
  private refresh(): void {
    this.loadProducts(this._searchQuery(), this._currentPage());
  }
}
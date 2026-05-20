// src/app/modules/invoices/facade/invoice.facade.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { FacturacinService, GetInvoicesList200Response, ShowInvoice200Response, StoreInvoiceRequest } from '../../../core/api';
import { Ui } from './../../../core/service/ui';

@Injectable({
  providedIn: 'root'
})
export class InvoiceFacade {
  private _invoiceService = inject(FacturacinService);
  private _uiService = inject(Ui);

  // ─── STATE SIGNALS ──────────────────────────────────────────────────
  private _invoicesResponse = signal<GetInvoicesList200Response | null>(null);
  private _selectedInvoice = signal<any | null>(null);
  private _isLoading = signal<boolean>(false);
  private _isSaving = signal<boolean>(false);
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);

  // ─── COMPUTED READONLY SIGNALS FOR COMPONENTS ──────────────────────
  public invoices = computed(() => this._invoicesResponse()?.data ?? []);
  public selectedInvoice = computed(() => this._selectedInvoice());
  public isLoading = computed(() => this._isLoading());
  public isSaving = computed(() => this._isSaving());
  public searchQuery = computed(() => this._searchQuery());

  public currentPage = computed(() => this._invoicesResponse()?.current_page ?? 1);
  public totalItems = computed(() => this._invoicesResponse()?.total ?? 0);
  public perPage = computed(() => this._invoicesResponse()?.per_page ?? 10);

  public lastPage = computed(() => {
    const total = this.totalItems();
    const perPage = this.perPage();
    return total > 0 ? Math.ceil(total / perPage) : 1;
  });

  // ─── ACTIONS ────────────────────────────────────────────────────────

  /**
   * Carga el listado de facturas aplicando los filtros reactivos actuales
   */
  public loadInvoices(search?: string, page?: number): void {
    this._isLoading.set(true);

    if (search !== undefined) this._searchQuery.set(search);
    if (page !== undefined) this._currentPage.set(page);

    this._invoiceService.getInvoicesList(
      this._searchQuery(), 
      this._currentPage()
    )
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this._invoicesResponse.set(response);
          this._isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar listado de facturas:', err);
          this._uiService.showToast('Error al cargar facturas. Intenta nuevamente.');
        }
      });
  }

  /**
   * Método auxiliar para refrescar la vista actual manteniendo la página y búsqueda activa
   */
  private refresh(): void {
    this.loadInvoices(this._searchQuery(), this._currentPage());
  }

  /**
   * Cambia la página actual del listado
   */
  public changePage(page: number): void {
    if (page < 1 || page > this.lastPage()) return;
    this._currentPage.set(page);
    this.loadInvoices();
  }

  /**
   * Carga el detalle completo de una factura específica por su ID
   */
  public loadInvoiceById(id: number): void {
    this._isLoading.set(true);
    this._selectedInvoice.set(null); // Limpieza previa

    this._invoiceService.showInvoice(id)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (invoiceDetail) => {
          this._selectedInvoice.set(invoiceDetail);
        },
        error: (err) => {
          this._uiService.showToast(`Error al cargar el detalle de la factura #${id}. Intenta nuevamente.`);
          console.error(`Error al cargar el detalle de la factura #${id}:`, err);
        }
      });
  }

  /**
   * Procesa la venta de productos (Crear nueva factura transaccional)
   * Recibe el objeto estructurado desde el formulario transaccional
   */
  public createInvoice(request: StoreInvoiceRequest, onSuccess?: () => void): void {
    this._isSaving.set(true);

    this._invoiceService.storeInvoice(request)
      .pipe(finalize(() => this._isSaving.set(false)))
      .subscribe({
        next: (response) => {
          // Refrescamos la lista para ver reflejada la venta decremetada del inventario
          this.loadInvoices();
          if (onSuccess) onSuccess();
        },
        error: (err) => {
          console.error('Error en la transacción de venta:', err);
          this._uiService.showToast('Error al procesar la venta. Intenta nuevamente.');
        }
      });
  }

  /**
   * Limpia la factura seleccionada actualmente del estado local
   */
  public clearSelectedInvoice(): void {
    this._selectedInvoice.set(null);
  }
}
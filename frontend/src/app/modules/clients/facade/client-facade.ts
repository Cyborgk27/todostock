// src/app/modules/clients/facade/clientes-facade.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { ClientesService } from '../../../core/api';
import { GetClientsList200Response } from '../../../core/api';
import { GetClientsList200ResponseDataInner } from '../../../core/api';
import { StoreClient201Response } from '../../../core/api';
import { StoreClientRequest } from '../../../core/api';
import { UpdateClient200Response } from '../../../core/api';
import { UpdateClientRequest } from '../../../core/api';
import { DestroyClient200Response } from '../../../core/api';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientesFacade {
  private _clientesApiService = inject(ClientesService);

  // ESTADO PRIVADO (Signals de control)
  private _clientsResponse = signal<GetClientsList200Response | null>(null);
  private _selectedClient = signal<GetClientsList200ResponseDataInner | null>(null); // Ficha detallada o activa
  private _isLoading = signal<boolean>(false);
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);

  // Estado auxiliar exclusivo para los resultados rápidos del Autocomplete en el POS
  private _filteredClients = signal<GetClientsList200ResponseDataInner[]>([]);

  // EXPOSICIÓN PÚBLICA (Read-only para la UI de TodoStock)
  public clients = computed(() => this._clientsResponse()?.data || []);
  
  public pagination = computed(() => {
    const response = this._clientsResponse();
    // Manejo seguro del tipado de paginación del API de TodoStock
    const total = (response as any)?.total || 0;
    const perPage = (response as any)?.per_page || 10;
    const currentPage = (response as any)?.current_page || 1;

    const lastPage = total > 0 ? Math.ceil(total / perPage) : 1;

    return {
      currentPage: currentPage,
      lastPage: lastPage,
      total: total,
      perPage: perPage
    };
  });

  public selectedClient = computed(() => this._selectedClient());
  public isLoading = computed(() => this._isLoading());
  public searchQuery = computed(() => this._searchQuery());
  
  // Selector expuesto para que el Autocomplete del InvoiceForm lea los clientes en tiempo real
  public filteredClients = computed(() => this._filteredClients());

  /**
   * Carga la lista paginada y filtrada de clientes desde PostgreSQL
   * Guarda el estado globalmente para que cualquier componente o tabla lo consuma
   */
  public loadClients(search?: string, page?: number): void {
    this._isLoading.set(true);

    // Actualizamos los filtros en el estado local si se proveen
    if (search !== undefined) this._searchQuery.set(search);
    if (page !== undefined) this._currentPage.set(page);

    this._clientesApiService.getClientsList(this._searchQuery(), this._currentPage()).subscribe({
      next: (res: GetClientsList200Response) => {
        this._clientsResponse.set(res);
        this._isLoading.set(false);
      },
      error: () => {
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Método optimizado para el Autocomplete del Punto de Venta (InvoiceForm)
   * Busca clientes de forma rápida sin romper el estado de la tabla principal o paginación
   */
  public searchClients(term: string): void {
    if (!term || term.trim().length < 3) {
      this._filteredClients.set([]);
      return;
    }

    this._clientesApiService.getClientsList(term, 1).subscribe({
      next: (res: GetClientsList200Response) => {
        this._filteredClients.set(res.data || []);
      },
      error: () => {
        this._filteredClients.set([]);
      }
    });
  }

  /**
   * Obtiene la ficha detallada de un cliente por ID (para editar o auditar histórico)
   */
  public loadClientById(id: number): void {
    this._isLoading.set(true);
    this._clientesApiService.showClient(id).subscribe({
      next: (res: GetClientsList200ResponseDataInner) => {
        this._selectedClient.set(res);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  /**
   * Registra un nuevo cliente en el sistema
   */
  public createClient(clientData: StoreClientRequest): Observable<StoreClient201Response> {
    this._isLoading.set(true);

    return this._clientesApiService.storeClient(clientData).pipe(
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
   * Modifica la información de un cliente existente de acuerdo a su ID
   */
  public updateClient(id: number, clientData: UpdateClientRequest): Observable<UpdateClient200Response> {
    this._isLoading.set(true);

    return this._clientesApiService.updateClient(id, clientData).pipe(
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
   * 🗑️ Elimina lógicamente un cliente (Soft Delete) para proteger la integridad histórica
   */
  public deleteClient(id: number): Observable<DestroyClient200Response> {
    this._isLoading.set(true);

    return this._clientesApiService.destroyClient(id).pipe(
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
   * Cambia de página dentro de la tabla de visualización de clientes
   */
  public changePage(page: number): void {
    this.loadClients(this._searchQuery(), page);
  }

  /**
   * Limpia el cliente seleccionado del estado (Útil al cerrar modales)
   */
  public clearSelectedClient(): void {
    this._selectedClient.set(null);
  }

  /**
   * Resetea la lista temporal del Autocomplete
   */
  public clearAutocomplete(): void {
    this._filteredClients.set([]);
  }

  /**
   * Método auxiliar para refrescar la vista actual manteniendo la página y búsqueda activa
   */
  private refresh(): void {
    this.loadClients(this._searchQuery(), this._currentPage());
  }
}
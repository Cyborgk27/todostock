// src/app/modules/clients/pages/list-clients/list-clients.ts
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableAction, TableColumn } from '../../../../shared/components/data-table/data-table';
import { ClientesFacade } from '../../facade/client-facade';
import { ClientForm } from '../../components/client-form/client-form';

@Component({
  selector: 'app-list-clients',
  standalone: false,
  templateUrl: './list-clients.html',
  styleUrl: './list-clients.css',
})
export class ListClients implements OnInit {
  // Inyectamos la fachada de clientes
  public clientesFacade = inject(ClientesFacade);

  @ViewChild(ClientForm) clientForm?: ClientForm;

  // Controladores de estado para Modales (DaisyUI + Tailwind)
  public isModalOpen = signal<boolean>(false);
  public isEditing = signal<boolean>(false);

  // Buscador reactivo con debounce interno
  private _searchSubject = new Subject<string>();

  // Título dinámico homologado según la acción activa
  public modalTitle = computed(() =>
    this.isEditing() ? 'Modificar Ficha de Cliente' : 'Registrar Nuevo Cliente'
  );

  // Mapeo riguroso de columnas para tu componente genérico <app-data-table>
  public clientColumns: TableColumn[] = [
    { key: 'identification', label: 'Cédula / RUC', format: 'text' },
    { key: 'name', label: 'Nombres Completos', format: 'text' },
    { key: 'email', label: 'Correo Electrónico', format: 'text' },
    { key: 'phone', label: 'Teléfono / Celular', format: 'text' },
    { key: 'created_at', label: 'Fecha Registro', format: 'date' }
  ];

  // Acciones disponibles en la fila para auditar o dar de baja
  public actions: TableAction[] = [
    { id: 'edit-client', icon: 'pi pi-pencil', tooltip: 'Editar Cliente', colorClass: 'text-warning' },
    { id: 'delete-client', icon: 'pi pi-trash', tooltip: 'Dar de Baja', colorClass: 'text-error' }
  ];

  ngOnInit(): void {
    // Carga inicial de datos desde el servidor
    this.clientesFacade.loadClients();

    // Pipeline reactivo para mitigar peticiones innecesarias al servidor
    this._searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        this.clientesFacade.loadClients(term, 1);
      });
  }

  /**
   * Captura el evento de interacción de los botones de la tabla genérica
   */
  public onActionClick(event: { actionId: string; row: any }): void {
    switch (event.actionId) {
      case 'edit-client':
        this.onEditClient(event.row);
        break;
      case 'delete-client':
        this.onDeleteClient(event.row);
        break;
    }
  }

  /**
   * Alimenta el Subject del buscador rápido
   */
  public onSearchChange(term: any): void {
    const query = typeof term === 'string' ? term : term?.target?.value || '';
    this._searchSubject.next(query);
  }


  /**
   * Prepara el entorno para registrar un cliente en limpio
   */
  public onNewClient(): void {
    this.isEditing.set(false);
    this.clientesFacade.clearSelectedClient();
    this.isModalOpen.set(true);
  }

  /**
   * Carga los datos existentes en la fachada y levanta el modal en modo edición
   */
  public onEditClient(clientRow: any): void {
    this.isEditing.set(true);
    this.isModalOpen.set(true);
    this.clientesFacade.loadClientById(clientRow.id);
  }

  /**
   * Lanza la petición de borrado lógico (Soft Delete)
   */
  public onDeleteClient(clientRow: any): void {
    if (confirm(`¿Está seguro de que desea eliminar al cliente ${clientRow.name}? No se perderá el histórico de sus facturas.`)) {
      this.clientesFacade.deleteClient(clientRow.id).subscribe();
    }
  }

  /**
   * Cierra las ventanas emergentes de forma segura limpiando la memoria del estado
   */
  public onCloseModal(): void {
    this.isModalOpen.set(false);
    this.clientesFacade.clearSelectedClient();
  }

  /**
   * Delegación del guardado/confirmación del formulario hijo interno
   */
  public handleSave(): void {
    if (this.clientForm) {
      this.clientForm.submitClient(() => {
        this.isModalOpen.set(false); // Cerramos el modal solo si el API dio OK
      });
    }
  }

  /**
   * Evento de cambio de página emitido por el componente de paginación genérico <app-single-pagination>
   * @param event 
   */
  public onPageChange(event: any): void {
    const page = typeof event === 'number' ? event : Number(event?.target?.value || 1);

    if (!isNaN(page)) {
      this.clientesFacade.changePage(page); // Gatilla la petición HTTP paginada
    }
  }
}
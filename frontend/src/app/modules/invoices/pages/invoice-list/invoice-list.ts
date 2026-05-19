import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InvoiceFacade } from '../../facade/invoice-facade';
import { formatDate } from '@angular/common';
import { TableColumn } from '../../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-invoice-list',
  standalone: false,
  templateUrl: './invoice-list.html',
})
export class InvoiceList implements OnInit {
  public invoiceFacade = inject(InvoiceFacade);

  // Control del modal
  public isModalOpen = signal<boolean>(false);
  public isViewingDetail = signal<boolean>(false);

  // Buscador con debounce reactivo
  private _searchSubject = new Subject<string>();

  // Título dinámico del modal homologado
  public modalTitle = computed(() =>
    this.isViewingDetail() ? 'Detalle Completo de Factura' : 'Nueva Venta (Facturar)'
  );

  // Configuración de columnas para tu <app-data-table>
  public invoiceColumns: TableColumn[] = [
    { key: 'invoice_number', label: 'Nº Factura', format: 'text' },
    { key: 'client.name', label: 'Cliente', format: 'text' },
    { key: 'client.identification', label: 'Identificación', format: 'text' },
    { key: 'created_at', label: 'Fecha Emisión', format: 'date' },
    { key: 'total', label: 'Total', format: 'currency' }
  ];

  ngOnInit(): void {
  
      this.invoiceFacade.loadInvoices();

    // Pipe para el buscador reactivo
    this._searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.invoiceFacade.loadInvoices(term, 1);
      });
  }

  public onSearchChange(term: any): void {
    this._searchSubject.next(term);
  }

  public onPageChange(event: any): void {
    // Si el componente emite el número directo lo toma, de lo contrario busca en el target
    const page = typeof event === 'number' ? event : Number(event?.target?.value || 1);

    if (!isNaN(page)) {
      this.invoiceFacade.changePage(page);
    }
  }

  public onNewInvoice(): void {
    this.isViewingDetail.set(false);
    this.invoiceFacade.clearSelectedInvoice();
    this.isModalOpen.set(true);
  }

  public onViewInvoice(invoiceRow: any): void {
    this.isViewingDetail.set(true);
    this.isModalOpen.set(true);
    this.invoiceFacade.loadInvoiceById(invoiceRow.id);
  }

  public onCloseModal(): void {
    this.isModalOpen.set(false);
    this.invoiceFacade.clearSelectedInvoice();
  }

  public handleSave(): void {
    // Aquí se disparará el método del formulario hijo cuando implementemos la persistencia
  }
}
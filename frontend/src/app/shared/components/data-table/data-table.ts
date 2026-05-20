import { Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  format?: 'text' | 'date' | 'currency';
}

export interface TableAction {
  id: string;          // Identificador único de la acción (ej: 'view-details', 'download-pdf')
  icon: string;        // Clase de PrimeIcons (ej: 'pi pi-eye', 'pi pi-download')
  tooltip?: string;    // Texto de ayuda opcional
  colorClass?: string; // Color personalizado de DaisyUI (ej: 'text-warning', 'text-success')
}

@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();
  actions = input<TableAction[]>([]);

  showEdit = input<boolean>(true);
  showDelete = input<boolean>(true);

  // Outputs para acciones transaccionales
  onEdit = output<any>();
  onDelete = output<any>();
  onActionClick = output<{ actionId: string; row: any }>();

  public getCellValue(row: any, key: string): any {
    if (!key) return '';
    return key.split('.').reduce((obj, segment) => obj?.[segment], row);
  }
}

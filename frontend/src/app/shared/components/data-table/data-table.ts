import { Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  format?: 'text' | 'date' | 'currency';
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

  // Outputs para acciones transaccionales
  onEdit = output<any>();
  onDelete = output<number>();
}

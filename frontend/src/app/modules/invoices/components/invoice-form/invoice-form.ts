// src/app/modules/invoices/components/invoice-form/invoice-form.ts
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { StoreInvoiceRequest } from '../../../../core/api';
import { InvoiceFacade } from '../../facade/invoice-facade';
import { TableColumn } from '../../../../shared/components/data-table/data-table';

interface FormItem {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: false,
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
})
export class InvoiceForm implements OnInit {
  private _invoiceFacade = inject(InvoiceFacade);

  // Input para saber si el modal está en modo consulta de detalle (Solo Lectura)
  public readOnly = input<boolean>(false);

  // ─── STATE SIGNALS DEL FORMULARIO ──────────────────────────────────
  public clientName = signal<string>('');
  public clientIdentification = signal<string>('');

  // Detalle de la venta actual (items del carrito)
  public invoiceItems = signal<FormItem[]>([]);

  // Estado para la barra de búsqueda rápida de productos dentro del POS
  public productSearchQuery = signal<string>('');

  // Signals para congelar los totales exactos del JSON cuando es solo lectura
  private _historicalSubtotal = signal<number>(0);
  private _historicalTax = signal<number>(0);
  private _historicalTotal = signal<number>(0);

  // ─── COMPUTED SIGNALS PARA TOTALES (VENTA NUEVA O HISTÓRICA) ───────
  public subtotal = computed(() => {
    if (this.readOnly()) return this._historicalSubtotal();
    return this.invoiceItems().reduce((acc, item) => acc + item.subtotal, 0);
  });

  public tax = computed(() => {
    if (this.readOnly()) return this._historicalTax();
    return this.subtotal() * 0.15; // IVA transaccional del negocio
  });

  public total = computed(() => {
    if (this.readOnly()) return this._historicalTotal();
    return this.subtotal() + this.tax();
  });

  public itemColumns: TableColumn[] = [
    { key: 'name', label: 'Item / Producto' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Cantidad', },
    { key: 'price', label: 'P. Unitario', format: 'currency', },
    { key: 'subtotal', label: 'Subtotal', format: 'currency', }
  ];

  ngOnInit(): void {
    if (this.readOnly()) {
      const selected = this._invoiceFacade.selectedInvoice();
      if (selected) {
        this.clientName.set(selected.client?.name ?? 'Sin Cliente registrado');
        this.clientIdentification.set(selected.client.identification ?? 'N/A');

        this._historicalSubtotal.set(Number(selected.subtotal ?? 0));
        this._historicalTax.set(Number(selected.tax_total ?? 0));
        this._historicalTotal.set(Number(selected.total ?? 0));

        const items = selected.items?.map((detail: any) => ({
          product_id: detail.product_id ?? 0,
          name: detail.product?.name ?? 'Producto',
          sku: detail.product?.sku ?? '-',
          quantity: detail.quantity ?? 0,
          price: Number(detail.price ?? 0),
          subtotal: Number(detail.total ?? 0)
        })) ?? [];

        this.invoiceItems.set(items);
      }
    }
  }

  // ─── ACCIONES DEL PUNTO DE VENTA (POS) ─────────────────────────────

  public addProductToInvoice(product: any): void {
    if (this.readOnly()) return;

    const currentItems = this.invoiceItems();
    const existingItem = currentItems.find(item => item.product_id === product.id);

    if (existingItem) {
      this.invoiceItems.set(
        currentItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      this.invoiceItems.set([
        ...currentItems,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          quantity: 1,
          price: product.sale_price,
          subtotal: product.sale_price
        }
      ]);
    }
    this.productSearchQuery.set('');
  }

  public removeItem(productId: number): void {
    if (this.readOnly()) return;
    this.invoiceItems.set(this.invoiceItems().filter(item => item.product_id !== productId));
  }

  public updateQuantity(productId: number, quantity: number): void {
    if (this.readOnly() || quantity < 1) return;

    this.invoiceItems.set(
      this.invoiceItems().map(item =>
        item.product_id === productId
          ? { ...item, quantity: quantity, subtotal: quantity * item.price }
          : item
      )
    );
  }

  public submitInvoice(onSuccessCallback: () => void): void {
    const selected = this._invoiceFacade.selectedInvoice();
    const requestPayload: StoreInvoiceRequest = {
      client_id: selected?.client?.id ?? 0,
      items: this.invoiceItems().map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this._invoiceFacade.createInvoice(requestPayload, () => {
      this.resetForm();
      onSuccessCallback();
    });
  }

  private resetForm(): void {
    this.clientName.set('');
    this.clientIdentification.set('');
    this.invoiceItems.set([]);
    this._historicalSubtotal.set(0);
    this._historicalTax.set(0);
    this._historicalTotal.set(0);
  }

  public updateClientIdentification(value: string | number): void {
    this.clientIdentification.set(String(value));
  }

  public updateClientName(value: string | number): void {
    this.clientName.set(String(value));
  }

  public onSearchProductChange(value: string | number): void {
    this.productSearchQuery.set(String(value));
  }
}
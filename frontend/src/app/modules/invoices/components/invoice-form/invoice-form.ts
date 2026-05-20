// src/app/modules/invoices/components/invoice-form/invoice-form.ts
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { StoreInvoiceRequest } from '../../../../core/api';
import { InvoiceFacade } from '../../facade/invoice-facade';
import { TableColumn } from '../../../../shared/components/data-table/data-table';
import { ClientesFacade } from '../../../clients/facade/client-facade';
import { ProductosFacade } from '../../../products/facade/product-facade';

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
  // Hacemos públicos los facades para leer sus signals directamente desde el HTML (.clients() y .products())
  public clientFacade = inject(ClientesFacade);
  public productFacade = inject(ProductosFacade);

  public readOnly = input<boolean>(false);

  // ─── STATE SIGNALS DEL FORMULARIO ──────────────────────────────────
  public clientName = signal<string>('');
  public clientIdentification = signal<string>('');

  // Almacena la entidad del cliente seleccionado desde el autocompletado
  public selectedClient = signal<any>(null);

  // Producto actualmente seleccionado listo para ser añadido con su cantidad customizada
  public selectedProduct = signal<any>(null);
  public inputQuantity = signal<number>(1);

  public invoiceItems = signal<FormItem[]>([]);
  public productSearchQuery = signal<string>('');

  private _historicalSubtotal = signal<number>(0);
  private _historicalTax = signal<number>(0);
  private _historicalTotal = signal<number>(0);

  // Flags para controlar la apertura visual de los dropdowns de sugerencias
  public showClientDropdown = signal<boolean>(false);
  public showProductDropdown = signal<boolean>(false);

  public subtotal = computed(() => {
    if (this.readOnly()) return this._historicalSubtotal();
    return this.invoiceItems().reduce((acc, item) => acc + item.subtotal, 0);
  });

  public tax = computed(() => {
    if (this.readOnly()) return this._historicalTax();
    return this.subtotal() * 0.15;
  });

  public total = computed(() => {
    if (this.readOnly()) return this._historicalTotal();
    return this.subtotal() + this.tax();
  });

  public itemColumns: TableColumn[] = [
    { key: 'name', label: 'Item / Producto' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Cantidad' },
    { key: 'price', label: 'P. Unitario', format: 'currency' },
    { key: 'subtotal', label: 'Subtotal', format: 'currency' }
  ];

  ngOnInit(): void {
    if (this.readOnly()) {
      const selected = this._invoiceFacade.selectedInvoice();
      if (selected) {
        this.clientName.set(selected.client?.name ?? 'Sin Cliente registrado');
        this.clientIdentification.set(selected.client?.identification ?? 'N/A');

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

  // ─── ACCIONES AUTOCM_PLETADO Y SELECCIÓN ───────────────────────────

  public selectClientFromList(client: any): void {
    this.selectedClient.set(client);
    this.clientName.set(client.name);
    this.clientIdentification.set(client.identification);
    this.showClientDropdown.set(false);
  }

  public selectProductFromList(product: any): void {
    this.selectedProduct.set(product);
    this.productSearchQuery.set(`${product.name} (${product.sku})`);
    this.showProductDropdown.set(false);
  }

  /**
   * Agrega el producto seleccionado con la cantidad ingresada en el modal
   */
  public addProductToInvoice(): void {
    const product = this.selectedProduct();
    const qty = this.inputQuantity();

    if (!product || qty < 1 || this.readOnly()) return;

    const currentItems = this.invoiceItems();
    const existingItem = currentItems.find(item => item.product_id === product.id);

    if (existingItem) {
      this.invoiceItems.set(
        currentItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + qty, subtotal: (item.quantity + qty) * item.price }
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
          quantity: qty,
          price: Number(product.price ?? 0), // O product.sale_price de acuerdo a tu modelo OpenAPI
          subtotal: Number(product.price ?? 0) * qty
        }
      ]);
    }

    // Resetear campos de inserción limpia
    this.selectedProduct.set(null);
    this.productSearchQuery.set('');
    this.inputQuantity.set(1);
  }

  public removeItem(event: any): void {
    if (this.readOnly()) return;

    const updatedItems = this.invoiceItems().filter(item => item.product_id !== event.product_id);

    this.invoiceItems.set(updatedItems);
  }

  public updateQuantity(productId: number, quantity: number): void {
    if (this.readOnly() || quantity < 1) return;

    this.invoiceItems.set(
      this.invoiceItems().map(item =>
        item.product_id === productId
          ? { ...item, quantity: quantity, subtotal: quantity * item.price }
          : item
      ));
  }

  public submitInvoice(onSuccessCallback: () => void): void {
    const client = this.selectedClient();
    if (!client && !this.readOnly()) {
      alert('Por favor, selecciona un cliente válido usando el autocompletado.');
      return;
    }

    const requestPayload: StoreInvoiceRequest = {
      client_id: client.id,
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
    this.selectedClient.set(null);
    this.selectedProduct.set(null);
    this.productSearchQuery.set('');
    this.inputQuantity.set(1);
    this.invoiceItems.set([]);
    this._historicalSubtotal.set(0);
    this._historicalTax.set(0);
    this._historicalTotal.set(0);
  }

  public updateClientIdentification(value: string | number): void {
    this.clientIdentification.set(String(value));
    if (String(value).length >= 3) {
      this.clientFacade.loadClients(String(value), 1);
      this.showClientDropdown.set(true);
    }
  }

  public updateClientName(value: string | number): void {
    this.clientName.set(String(value));
    if (String(value).length >= 3) {
      this.clientFacade.loadClients(String(value), 1);
      this.showClientDropdown.set(true);
    }
  }

  public onSearchProductChange(value: string | number): void {
    this.productSearchQuery.set(String(value));
    if (String(value).length >= 2) {
      this.productFacade.loadProducts(String(value), 1);
      this.showProductDropdown.set(true);
    } else {
      this.selectedProduct.set(null); // Limpia selección si borra el texto
    }
  }
}
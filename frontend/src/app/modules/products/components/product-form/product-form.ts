import { Component, inject, signal, effect } from '@angular/core';import { Ui } from '../../../../core/service/ui';
import { ProductosFacade } from '../../facade/product-facade';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  standalone: false,
})
export class ProductForm {
 public productsFacade = inject(ProductosFacade);
  private ui = inject(Ui);

  // Estado del formulario (Signals reactivos)
  public id = signal<number | null>(null);
  public name = signal<string>('');
  public sku = signal<string>('');
  public price = signal<number>(0);
  public stock = signal<number>(0);
  public taxPercentage = signal<number>(15);
  public description = signal<string>('');
  
  // 📸 Estado para almacenar y listar las imágenes que ya tiene el producto en el servidor
  public existingImages = signal<any[]>([]);

  public isEditMode = signal<boolean>(false);

  constructor() {
    /**
     * 🔥 EFECTO REACTIVO DE SEGUIMIENTO
     * Mapea la estructura exacta de ShowProduct200Response de tu API de Laravel
     */
    effect(() => {
      const product = this.productsFacade.selectedProduct();
      
      if (product) {
        this.id.set(product.id);
        this.name.set(product.name);
        this.sku.set(product.sku);
        this.description.set(product.description || '');
        this.stock.set(product.stock);
        
        // 🛠️ Casteos estrictos de los strings numéricos que envía el Back
        this.price.set(Number(product.price));
        this.taxPercentage.set(Number(product.tax_percentage)); // 👈 Ajustado a snake_case y parseado
        
        // Almacenamos las imágenes existentes
        this.existingImages.set(product.images || []);
      }
    });
  }

  /**
   * Restablece todo el estado del formulario a valores por defecto
   */
  public reset(): void {
    this.id.set(null);
    this.name.set('');
    this.sku.set('');
    this.price.set(0);
    this.stock.set(0);
    this.taxPercentage.set(15);
    this.description.set('');
    this.existingImages.set([]);
    this.isEditMode.set(false);
    
    this.productsFacade.clearSelectedProduct();
  }

  public loadProductData(productId: number): void {
    this.isEditMode.set(true);
    this.productsFacade.loadProductById(productId);
  }

  public save(): void {
    const data = {
      name: this.name(),
      sku: this.sku(),
      stock: Number(this.stock()),
      price: Number(this.price()),
      taxPercentage: Number(this.taxPercentage()),
      description: this.description(),
    };

    if (this.isEditMode() && this.id()) {
      this.productsFacade.updateProduct(this.id()!, data).subscribe({
        next: () => this.ui.showToast('Producto actualizado correctamente')
      });
    } else {
      this.productsFacade.createProduct(data).subscribe({
        next: () => this.ui.showToast('Producto guardado con éxito')
      });
    }
  }
}
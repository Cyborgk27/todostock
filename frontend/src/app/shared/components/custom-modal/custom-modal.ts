import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  standalone: false,
  templateUrl: './custom-modal.html',
})
export class CustomModal {
  isOpen = model<boolean>(false);
  
  title = input<string>('Información');

  onClose = output<void>();

  sizeClass = input<string>('max-w-lg');

  closeModal(): void {
    this.isOpen.set(false);
    this.onClose.emit();
  }
}
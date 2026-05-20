import { Component, inject, input, OnInit, signal, effect } from '@angular/core';
import { StoreClientRequest, UpdateClientRequest } from '../../../../core/api';
import { ClientesFacade } from '../../facade/client-facade';

@Component({
  selector: 'app-client-form',
  standalone: false,
  templateUrl: './client-form.html'
})
export class ClientForm implements OnInit {
  private _clientesFacade = inject(ClientesFacade);

  // Input para bloquear el formulario si fuera necesario
  public readOnly = input<boolean>(false);

  // ─── STATE SIGNALS DEL FORMULARIO ──────────────────────────────────
  public name = signal<string>('');
  public identification = signal<string>('');
  public email = signal<string>('');
  public phone = signal<string>('');
  public address = signal<string>('');

  constructor() {
    effect(() => {
      const client = this._clientesFacade.selectedClient();
      if (client) {
        this.name.set(client.name || '');
        this.identification.set(client.identification || '');
        this.email.set(client.email || '');
        this.phone.set(client.phone || '');
        this.address.set(client.address || '');
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}

  /**
   * Método invocado por el padre (ListClients) mediante ViewChild
   */
  public submitClient(onSuccess: () => void): void {
    const clientData: StoreClientRequest = {
      name: this.name(),
      identification: this.identification(),
      email: this.email(),
      phone: this.phone(),
      address: this.address()
    };

    const selectedClient = this._clientesFacade.selectedClient();

    if (selectedClient?.id) {
      // MODO EDICIÓN
      this._clientesFacade.updateClient(selectedClient.id, clientData as UpdateClientRequest)
        .subscribe({ next: () => onSuccess() });
    } else {
      // MODO CREACIÓN
      this._clientesFacade.createClient(clientData)
        .subscribe({ next: () => onSuccess() });
    }
  }

  private resetForm(): void {
    this.name.set('');
    this.identification.set('');
    this.email.set('');
    this.phone.set('');
    this.address.set('');
  }

  // Helpers para el tipado estricto de tus app-custom-input
  public updateField(field: 'name' | 'id' | 'email' | 'phone' | 'address', value: string | number): void {
    const val = String(value);
    if (field === 'name') this.name.set(val);
    if (field === 'id') this.identification.set(val);
    if (field === 'email') this.email.set(val);
    if (field === 'phone') this.phone.set(val);
    if (field === 'address') this.address.set(val);
  }
}
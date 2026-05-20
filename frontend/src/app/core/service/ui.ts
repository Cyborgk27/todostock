import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Ui {
  
  private readonly swalDarkConfig = {
    background: 'var(--bg-base-100, #1d232a)', 
    color: 'var(--fallback-bc, #f2f3f5)',      
    customClass: {
      popup: 'border border-base-300 rounded-2xl shadow-xl', 
      title: 'text-xl font-black text-base-content tracking-tight',
      htmlContainer: 'text-sm text-base-content/70 font-medium',
    }
  };

  /**
   * Muestra un toast sutil (notificación flotante) adaptado al tema.
   */
  showToast(message: string, icon: SweetAlertIcon = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: this.swalDarkConfig.background,
      color: this.swalDarkConfig.color,
      customClass: {
        popup: 'rounded-xl border border-base-300 shadow-lg font-medium text-sm',
      },
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    Toast.fire({
      icon: icon,
      title: message
    });
  }

  /**
   * Muestra una alerta modal clásica (bloqueante) en formato Dark.
   */
  showAlert(title: string, message: string, icon: SweetAlertIcon = 'info'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      background: this.swalDarkConfig.background,
      color: this.swalDarkConfig.color,
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: this.swalDarkConfig.customClass.popup,
        title: this.swalDarkConfig.customClass.title,
        htmlContainer: this.swalDarkConfig.customClass.htmlContainer,
        confirmButton: 'btn btn-primary text-white btn-sm px-6 font-bold uppercase tracking-wide'
      },
      buttonsStyling: false
    });
  }

  /**
   * Alerta rápida para manejo de errores del sistema o respuestas de Laravel.
   */
  showError(message: string, title: string = '¡Ups! Algo salió mal'): void {
    this.showAlert(title, message, 'error');
  }

  /**
   * Alerta rápida para confirmación de acciones exitosas.
   */
  showSuccess(message: string, title: string = '¡Éxito!'): void {
    this.showAlert(title, message, 'success');
  }

  /**
   * 🗑️ Modal de confirmación con soporte completo para DaisyUI Dark.
   * Modifica dinámicamente el fondo, títulos y los colores de los botones de control.
   */
  async showConfirm(
    title: string = '¿Estás seguro?',
    message: string = 'No podrás revertir esta acción',
    confirmText: string = 'Sí, continuar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      iconColor: '#f87171', // Color suave homologado para alertas destructivas (Tailwind red-400)
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: this.swalDarkConfig.background,
      color: this.swalDarkConfig.color,
      customClass: {
        popup: this.swalDarkConfig.customClass.popup,
        title: this.swalDarkConfig.customClass.title,
        htmlContainer: this.swalDarkConfig.customClass.htmlContainer,
        confirmButton: 'btn btn-error text-white btn-sm px-6 font-bold uppercase tracking-wide gap-2 shadow-md order-2', 
        cancelButton: 'btn btn-ghost border border-base-300 btn-sm px-6 font-medium text-xs order-1 mr-3'
      },
      buttonsStyling: false
    });

    return result.isConfirmed;
  }
}
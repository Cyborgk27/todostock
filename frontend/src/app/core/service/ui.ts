import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
  })
export class Ui {

  /**
   * Muestra un toast sutil (notificación flotante) en la esquina superior derecha.
   * Ideal para acciones rápidas que no deben bloquear al usuario.
   */
  showToast(message: string, icon: SweetAlertIcon = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
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
   * Muestra una alerta modal clásica (bloqueante).
   */
  showAlert(title: string, message: string, icon: SweetAlertIcon = 'info'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn btn-primary text-white px-6' // 💡 Clases de DaisyUI
      },
      buttonsStyling: false // Desactiva los estilos por defecto de SweetAlert para usar Tailwind
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
   * Modal de confirmación con promesas. Ideal para flujos como "Eliminar un registro".
   * Devuelve `true` si el usuario confirma, de lo contrario `false`.
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
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        confirmButton: 'btn btn-error text-white mr-3 px-6', // Botón destructivo con clase DaisyUI
        cancelButton: 'btn btn-ghost border border-base-300 px-6'
      },
      buttonsStyling: false
    });

    return result.isConfirmed;
  }
}
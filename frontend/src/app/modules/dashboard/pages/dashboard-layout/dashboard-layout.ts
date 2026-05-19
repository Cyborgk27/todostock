import { Component, inject } from '@angular/core';
import { Auth } from '../../../auth/facades/auth';

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.html',
  styles: ``,
})
export class DashboardLayout {
  public authFacade = inject(Auth);

  onLogoutClick(): void {
    this.authFacade.logout().subscribe();
  }
}

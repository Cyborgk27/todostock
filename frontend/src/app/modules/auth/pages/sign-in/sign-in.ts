import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../facades/auth';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  authFacade = inject(Auth);

  email = signal<string>('');
  password = signal<string>('');

  onLoginSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.email() || !this.password()) return;

    this.authFacade.login({
      email: this.email(),
      password: this.password()
    });
  }
}

import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-custom-input',
  standalone: false,
  templateUrl: './custom-input.html',
  styleUrl: './custom-input.css',
})
export class CustomInput {
  value = model<string | number>('');

  label = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel'>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  icon = input<string>('');
}

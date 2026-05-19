import { Component, output, signal } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';

@Component({
  selector: 'app-data-filter',
  standalone: false,
  templateUrl: './data-filter.html',
  styleUrl: './data-filter.css',
})
export class DataFilter {
  onSearch = output<string>();
  
  searchQuery = signal<string>('');
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(value => {
      this.onSearch.emit(value);
    });
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }
}

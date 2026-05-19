import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-single-pagination',
  standalone: false,
  templateUrl: './single-pagination.html',
  styleUrl: './single-pagination.css',
})
export class SinglePagination {
  currentPage = input.required<number>();
  lastPage = input.required<number>();

  onPageChange = output<number>();

  isFirstPage = computed(() => this.currentPage() === 1);
  isLastPage = computed(() => this.currentPage() === this.lastPage());

  pagesArray = computed(() => {
    const total = this.lastPage();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  changePage(page: number): void {
    if (page >= 1 && page <= this.lastPage()) {
      this.onPageChange.emit(page);
    }
  }
}
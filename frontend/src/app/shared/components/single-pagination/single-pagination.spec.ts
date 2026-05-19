import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePagination } from './single-pagination';

describe('SinglePagination', () => {
  let component: SinglePagination;
  let fixture: ComponentFixture<SinglePagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SinglePagination],
    }).compileComponents();

    fixture = TestBed.createComponent(SinglePagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

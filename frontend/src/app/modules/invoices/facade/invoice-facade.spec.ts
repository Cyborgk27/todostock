import { TestBed } from '@angular/core/testing';

import { InvoiceFacade } from './invoice-facade';

describe('InvoiceFacade', () => {
  let service: InvoiceFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

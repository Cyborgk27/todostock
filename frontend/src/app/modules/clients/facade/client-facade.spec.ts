import { TestBed } from '@angular/core/testing';

import { ClientFacade } from './client-facade';

describe('ClientFacade', () => {
  let service: ClientFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

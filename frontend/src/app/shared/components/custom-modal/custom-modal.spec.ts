import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomModal } from './custom-modal';

describe('CustomModal', () => {
  let component: CustomModal;
  let fixture: ComponentFixture<CustomModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

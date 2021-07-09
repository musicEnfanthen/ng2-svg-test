import { ComponentFixture, TestBed } from '@angular/core/testing';

import { M212TF1Component } from './m212-tf1.component';

describe('M212TF1Component', () => {
  let component: M212TF1Component;
  let fixture: ComponentFixture<M212TF1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ M212TF1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(M212TF1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

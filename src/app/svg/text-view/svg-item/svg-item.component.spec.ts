import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgItemComponent } from './svg-item.component';

describe('SvgComponent', () => {
  let component: SvgItemComponent;
  let fixture: ComponentFixture<SvgItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

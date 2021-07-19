import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgSketchItemComponent } from './svg-sketch-item.component';

describe('SvgSketchItemComponent', () => {
  let component: SvgSketchItemComponent;
  let fixture: ComponentFixture<SvgSketchItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgSketchItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgSketchItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgSketchContainerComponent } from './svg-sketch-container.component';

describe('SvgSketchContainerComponent', () => {
  let component: SvgSketchContainerComponent;
  let fixture: ComponentFixture<SvgSketchContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgSketchContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgSketchContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

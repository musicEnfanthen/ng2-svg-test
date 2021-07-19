import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SketchViewComponent } from './sketch-view.component';

describe('SketchViewComponent', () => {
  let component: SketchViewComponent;
  let fixture: ComponentFixture<SketchViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SketchViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SketchViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

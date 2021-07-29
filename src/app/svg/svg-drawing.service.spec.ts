import { TestBed } from '@angular/core/testing';

import { SvgDrawingService } from './svg-drawing.service';

describe('SvgDrawingService', () => {
  let service: SvgDrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgDrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

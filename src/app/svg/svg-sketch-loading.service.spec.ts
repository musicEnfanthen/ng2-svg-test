import { TestBed } from '@angular/core/testing';

import { SvgSketchLoadingService } from './svg-sketch-loading.service';

describe('SvgSketchLoadingService', () => {
  let service: SvgSketchLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgSketchLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

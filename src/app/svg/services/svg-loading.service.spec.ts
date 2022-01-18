import { TestBed } from '@angular/core/testing';

import { SvgLoadingService } from './svg-loading.service';

describe('SvgLoadingService', () => {
  let service: SvgLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

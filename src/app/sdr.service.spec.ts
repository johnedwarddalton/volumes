import { TestBed } from '@angular/core/testing';

import { SdrService } from './sdr.service';

describe('SdrService', () => {
  let service: SdrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

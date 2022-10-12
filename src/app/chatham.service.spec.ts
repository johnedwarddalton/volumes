import { TestBed } from '@angular/core/testing';

import { ChathamService } from './chatham.service';

describe('ChathamService', () => {
  let service: ChathamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChathamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

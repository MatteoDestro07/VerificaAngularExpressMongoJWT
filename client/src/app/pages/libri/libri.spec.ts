import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Libri } from './libri';

describe('Libri', () => {
  let component: Libri;
  let fixture: ComponentFixture<Libri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Libri]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Libri);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

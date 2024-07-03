import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaSolicitudComponent } from './tabla-solicitud.component';

describe('TablaSolicitudComponent', () => {
  let component: TablaSolicitudComponent;
  let fixture: ComponentFixture<TablaSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaSolicitudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablaSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

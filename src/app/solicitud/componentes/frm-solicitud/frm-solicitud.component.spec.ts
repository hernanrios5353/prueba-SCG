import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmSolicitudComponent } from './frm-solicitud.component';

describe('FrmSolicitudComponent', () => {
  let component: FrmSolicitudComponent;
  let fixture: ComponentFixture<FrmSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmSolicitudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrmSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

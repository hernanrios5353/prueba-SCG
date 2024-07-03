import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmImplementacionComponent } from './frm-implementacion.component';

describe('FrmImplementacionComponent', () => {
  let component: FrmImplementacionComponent;
  let fixture: ComponentFixture<FrmImplementacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmImplementacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrmImplementacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmEvaluacionComponent } from './frm-evaluacion.component';

describe('FrmEvaluacionComponent', () => {
  let component: FrmEvaluacionComponent;
  let fixture: ComponentFixture<FrmEvaluacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmEvaluacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrmEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

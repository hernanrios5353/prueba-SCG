import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmTerminacionComponent } from './frm-terminacion.component';

describe('FrmTerminacionComponent', () => {
  let component: FrmTerminacionComponent;
  let fixture: ComponentFixture<FrmTerminacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmTerminacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrmTerminacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

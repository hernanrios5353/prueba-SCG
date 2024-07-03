import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// importar formularios
import { FrmSolicitudComponent } from '../../../solicitud/componentes/frm-solicitud/frm-solicitud.component'
import { FrmEvaluacionComponent } from '../../../solicitud/componentes/frm-evaluacion/frm-evaluacion.component'
import { FrmImplementacionComponent } from '../../../solicitud/componentes/frm-implementacion/frm-implementacion.component'
import { FrmTerminacionComponent } from '../../../solicitud/componentes/frm-terminacion/frm-terminacion.component'


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    FrmSolicitudComponent,
    FrmEvaluacionComponent,
    FrmImplementacionComponent,
    FrmTerminacionComponent
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit{

  divFormSolicitud: boolean = false;
  divFormEvaluacion: boolean = false;
  divFormImplementacion: boolean = false;
  divFormTerminacion: boolean = false;

  _data: object = {};

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public objeto: any
  ) {}

  recibirAcciones(event: any) {
    if (event.accion == 'cerrar') {
      this.dialogRef.close(event.data);
    }
    else if (event.accion == 'editar') {
      this.dialogRef.close(event);
    }
    else if (event.accion == 'crear') {
      this.dialogRef.close(event);
    }
  }
  
  ngOnInit() {
    console.log(this.objeto);
  
    let formulario = this.objeto.form;
    let accion = this.objeto.opc;
  
    switch (formulario) {
      case 1:
        console.log('Formulario de solicitud');
        this.divFormSolicitud = true;
        break;
      case 2:
        console.log('Formulario de evaluación');
        this.divFormEvaluacion = true;
        break;
      case 3:
        console.log('Formulario de implementación');
        this.divFormImplementacion = true;
        break;
      case 4:
        console.log('Formulario de terminación');
        this.divFormTerminacion = true;
        break;
      default:
        console.log('Formulario no reconocido');
    }
  
    switch (accion) {
      case 1:
        console.log('Creación');
        this._data = this.objeto;
        break;
      case 2:
        console.log('Edición');
        this._data = this.objeto;
        break;
      case 3:
        console.log('Ver');
        this._data = this.objeto;
        break;
      default:
        console.log('Acción no reconocida');
    }
  }

}

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators,FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatLabel } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';

// librerias
import moment from 'moment';

// servicios
import { SolicitudService } from '../../servicios/solicitud.service';

// modelos
import { Solicitud, Evaluacion } from '../../modelos/solicitud';

@Component({
  selector: 'app-frm-evaluacion',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
    MatLabel,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './frm-evaluacion.component.html',
  styleUrl: './frm-evaluacion.component.scss'
})
export class FrmEvaluacionComponent  implements OnInit{

  @Input() Input_data: any;
  @Output() acciones = new EventEmitter<any>();

  frm_evaluacion: FormGroup;

  titulo: string = 'Crear evaluación';
  titulo_btn_guardar: string = 'Crear evaluación';
  titulo_btn_cancelar: string = 'Cancelar';

  bool_btn_guardar: boolean = true;
  bool_btn_cancelar: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private solicitudService: SolicitudService
  ) {
    this.frm_evaluacion = this.formBuilder.group({
      idevaluacion: [''],
      idsolicitud: [''],
      fecha_evaluacion: ['', Validators.required],
      solicitud_evaluacion: ['', Validators.required],
      fecha_creacion: [moment().format('YYYY-MM-DD HH:mm:ss'), Validators.required],
    });
  }

  async onSubmit() {

    if (this.frm_evaluacion.valid) {

      // evalular si  contiene el _id para editar o crear
      if (this.frm_evaluacion.value.idevaluacion) {
      
        const mensaje = await this.validarFormatos(this.frm_evaluacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }
      
        this.F_editar_evaluacion(this.frm_evaluacion);
      }
      else if (!this.frm_evaluacion.value.idevaluacion){

        const mensaje = await this.validarFormatos(this.frm_evaluacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }

        this.F_crear_Evaluacion(this.frm_evaluacion);
      }
    } else {

      let missingFieldName = await this.buscarCampoVacio(this.frm_evaluacion.value);
      if(missingFieldName !== null)this.openSnackBar(missingFieldName);
    }
  }

  F_editar_evaluacion(frm_evaluacion: FormGroup){

    let fecha_solicitud = moment(frm_evaluacion.value.fecha_solicitud, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_evaluacion.get('fecha_solicitud')?.setValue(fecha_solicitud);

    let modeloEvaluacion: Evaluacion = {
      idevaluacion: frm_evaluacion.value.idevaluacion,
      idsolicitud: this.Input_data.idsolicitud,
      fecha_evaluacion: frm_evaluacion.value.fecha_evaluacion,
      solicitud_evaluacion: frm_evaluacion.value.solicitud_evaluacion,
      fecha_creacion: frm_evaluacion.value.fecha_creacion,
    };

    let updatedProceso = [...this.Input_data.proceso, modeloEvaluacion];

    let modeloSolicitud: Solicitud = {
      idsolicitud: this.Input_data.idsolicitud,
      fecha_solicitud: moment(this.Input_data.fecha_solicitud).format('DD/MM/YYYY'),
      solicitud: this.Input_data.solicitud,
      fecha_creacion: this.Input_data.fecha_creacion,
      afectado: this.Input_data.afectado,
      proceso: updatedProceso
    }


    this.solicitudService.updateSolicitud(modeloSolicitud).subscribe(
      (response) => {
        this.F_acciones('editar', modeloSolicitud);
        this.openSnackBar('Evaluacion actualizada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al actualizar la evaluacion.');
      }
    );

  };

  F_crear_Evaluacion(frm_evaluacion: FormGroup) {

    let procesosActuales = this.Input_data.data.proceso as any[];

    // validar que no exista una implementacion o la solicitud este terminada
    if(procesosActuales && procesosActuales.length > 0 ){

      let existeTerminacion = procesosActuales.find(item => item.idterminacion !== undefined);
      if(existeTerminacion){
        this.openSnackBar('La solicitud se encuentra terminada.');
        return;
      }

      let existeImplementacion = procesosActuales.find(item => item.implementacion !== undefined);
      if(existeImplementacion){
        this.openSnackBar('La solicitud ya registra una implementación.');
        return;
      }
    }

    let fecha_evaluacion = moment(frm_evaluacion.value.fecha_evaluacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_evaluacion.get('fecha_evaluacion')?.setValue(fecha_evaluacion);

    let maxIdevaluacion = procesosActuales
    .filter(item => item.idevaluacion !== undefined)
    .reduce((max, item) => Math.max(max, parseInt(item.idevaluacion, 10)), 0);
  
    let nuevoIdevaluacion = (maxIdevaluacion + 1).toString();

    let modeloEvaluacion: Evaluacion = {
      idevaluacion: nuevoIdevaluacion,
      idsolicitud: this.Input_data.data.idsolicitud,
      fecha_evaluacion: frm_evaluacion.value.fecha_evaluacion,
      solicitud_evaluacion: frm_evaluacion.value.solicitud_evaluacion,
      fecha_creacion: frm_evaluacion.value.fecha_creacion,
    };

    procesosActuales.push(modeloEvaluacion);

    let modeloSolicitud: Solicitud = {
      idsolicitud: this.Input_data.data.idsolicitud,
      fecha_solicitud: moment(this.Input_data.data.fecha_solicitud).format('YYYY-MM-DD'),
      solicitud: this.Input_data.data.solicitud,
      fecha_creacion: this.Input_data.data.fecha_creacion,
      afectado: this.Input_data.data.afectado,
      proceso: procesosActuales 
    }

    this.solicitudService.updateSolicitud(modeloSolicitud).subscribe(
      (response) => {
        this.F_acciones('editar', modeloSolicitud);
        this.openSnackBar('Evaluación creada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al crear la evaluación.');  
      }
    );

  }

  F_acciones(_accion: string, _data: any) {
    let acciones = {
      accion: _accion,
      data: _data
    }
    this.acciones.emit(acciones);
  }

  buscarCampoVacio(objeto: any): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let nomVariable: string | null = null;
      let mensaje: string | null = null;

      for (const key in objeto) {
        if (objeto.hasOwnProperty(key) && !objeto[key]) {

          switch (key) {
            case "solicitud_evaluacion":
              nomVariable = "Evaluación";
              break;
            case "fecha_evaluacion":
              nomVariable = "Fecha de evaluacion";
              break;
          
            default:
              continue;
          }
          mensaje = `El campo ${nomVariable} es obligatorio.`;
          resolve(mensaje);
          return;
        }
      }
      resolve(null);
    });
  }

  validarFormatos(frm_evaluacion: FormGroup): Promise<string | null> {
    return new Promise((resolve) => {
      let mensaje: string | null = null;

      //validar que la fecha sea valida y no sea mayor a la fecha actual
      const fecha_solicitud = moment(frm_evaluacion.value.fecha_evaluacion, 'DD/MM/YYYY');
      const fechaActual = moment();
      if (!fecha_solicitud.isValid()) {
        mensaje = 'La fecha de evaluación no es válida.';
      } else if (fecha_solicitud.isAfter(fechaActual)) {
        mensaje = 'La fecha de evaluación no puede ser mayor a la fecha actual.';
      }

      resolve(mensaje);
    });
  }

  openSnackBar(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 2000, // Duración en milisegundos
      horizontalPosition: 'center', // Posición horizontal
      verticalPosition: 'top', // Posición vertical
      panelClass: ['blue-snackbar']
    });
  }

  onKeyDown(event: KeyboardEvent) {

    // Obtener el código de la tecla presionada
    const keyCode = event.keyCode || event.which;

    // Permitir teclas especiales como Backspace (código 8) y teclas de navegación
    if (
      (keyCode >= 48 && keyCode <= 57) || // Permitir números del teclado alfanumérico
      (keyCode >= 96 && keyCode <= 105) || // Permitir números del teclado numérico
      keyCode === 8 || // Permitir tecla de retroceso (Backspace)
      keyCode === 9 || // Permitir tecla Tab
      keyCode === 37 || // Permitir tecla de flecha izquierda
      keyCode === 39 // Permitir tecla de flecha derecha
    ) {
      // Permitir la tecla presionada
    } else {
      // Bloquear la tecla presionada
      event.preventDefault();
    }

    if (event.key === 'Backspace') {
      this.borrando = true;
    }

  }

  borrando = false;
  actual = '';
  oldValue: string = '';

  onInputFecha(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;
    const cursorPosition = inputElement.selectionStart; // Obtener la posición del cursor

    let formattedDate = newValue;
    if (this.borrando) {
      this.borrando = false;
      this.oldValue = newValue;

      return;
    }

    if (newValue.length === 2 && cursorPosition === 2) {
      formattedDate += '/';
    } else if (newValue.length === 5 && cursorPosition === 5) {
      formattedDate += '/';
    }

    this.frm_evaluacion.get('fecha_evaluacion')?.setValue(formattedDate, { emitEvent: false });
    this.actual = formattedDate;

  }

  ocultarBotones(btn_guardar:boolean, btn_cancelar: boolean){
    this.bool_btn_guardar = btn_guardar;
    this.bool_btn_cancelar = btn_cancelar;
  }

  set_frm_evaluacion(data: any){
    this.frm_evaluacion.patchValue({
      idevaluacion: data.idevaluacion,
      idsolicitud: data.idsolicitud,
      fecha_evaluacion: moment(data.fecha_evaluacion).format('DD/MM/YYYY'),
      solicitud_evaluacion: data.solicitud_evaluacion,
      fecha_creacion: data.fecha_creacion
    });
  }

  ngOnInit() {

    console.log(this.Input_data);
    let data = this.Input_data.data;
    console.log(data);

    if(this.Input_data.opc == 1){
      this.titulo = 'Crear evaluación';
      this.titulo_btn_guardar = 'Crear evaluación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 2){
      this.titulo = 'Editar evaluación';
      this.set_frm_evaluacion(data);
      this.titulo_btn_guardar = 'Editar evaluación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 3){
      this.titulo = 'Ver evaluación';
      this.set_frm_evaluacion(data);
      this.frm_evaluacion.disable();
      this.titulo_btn_guardar = 'Cerrar';
      this.ocultarBotones(true, false);
    }
  }

}

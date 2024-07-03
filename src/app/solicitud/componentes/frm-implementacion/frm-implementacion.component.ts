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
import { Solicitud, Implementacion } from '../../modelos/solicitud';

@Component({
  selector: 'app-frm-implementacion',
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
  templateUrl: './frm-implementacion.component.html',
  styleUrl: './frm-implementacion.component.scss'
})
export class FrmImplementacionComponent  implements OnInit{

  @Input() Input_data: any;
  @Output() acciones = new EventEmitter<any>();

  frm_implementacion: FormGroup;

  titulo: string = 'Crear implementación';
  titulo_btn_guardar: string = 'Crear implementación';
  titulo_btn_cancelar: string = 'Cancelar';

  bool_btn_guardar: boolean = true;
  bool_btn_cancelar: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private solicitudService: SolicitudService
  ) {
    this.frm_implementacion = this.formBuilder.group({
      idimplementacion: [''],
      idsolicitud: [''],
      fecha_implementacion: [moment().format('DD-MM-YYYY'), Validators.required],
      implementacion: ['', Validators.required],
      fecha_creacion: [moment().format('YYYY-MM-DD HH:mm:ss'), Validators.required],
    });
  }

  async onSubmit() {

    if (this.frm_implementacion.valid) {

      // evalular si  contiene el _id para editar o crear
      if (this.frm_implementacion.value.idimplementacion) {
      
        const mensaje = await this.validarFormatos(this.frm_implementacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }
      
        this.F_editar_implementacion(this.frm_implementacion);
      }
      else if (!this.frm_implementacion.value.idevaluacion){

        const mensaje = await this.validarFormatos(this.frm_implementacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }

        this.F_crear_implementacion(this.frm_implementacion);
      }
    } else {

      let missingFieldName = await this.buscarCampoVacio(this.frm_implementacion.value);
      if(missingFieldName !== null)this.openSnackBar(missingFieldName);
    }
  }

  F_editar_implementacion(frm_implementacion: FormGroup){

    let fecha_implementacion = moment(frm_implementacion.value.fecha_implementacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_implementacion.get('fecha_implementacion')?.setValue(fecha_implementacion);

    let modeloEvaluacion: Implementacion = {
      idimplementacion: frm_implementacion.value.idimplementacion,
      idsolicitud: this.Input_data.idsolicitud,
      fecha_implementacion: frm_implementacion.value.fecha_implementacion,
      implementacion: frm_implementacion.value.implementacion,
      fecha_creacion: frm_implementacion.value.fecha_creacion,
    };

    let procesosActuales = this.Input_data.data.proceso as any[];

    let maxIdevaluacion = procesosActuales
    .filter(item => item.idevaluacion !== undefined)
    .reduce((max, item) => Math.max(max, parseInt(item.idevaluacion, 10)), 0);
  
    let nuevoIdevaluacion = (maxIdevaluacion + 1).toString();

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
        this.openSnackBar('implementacion actualizada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al actualizar la implementacion.');
      }
    );

  };

  F_crear_implementacion(frm_implementacion: FormGroup) {

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
        this.openSnackBar('Ya existe una implementación para esta solicitud.');
        return;
      }
    }
    else{
      this.openSnackBar('Primero debe registrar una evaluación.');
      return;
    }

    console.log(procesosActuales);

    let fecha_implementacion = moment(frm_implementacion.value.fecha_implementacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_implementacion.get('fecha_implementacion')?.setValue(fecha_implementacion);

    let maxIdimplementacion = procesosActuales
    .filter(item => item.idimplementacion !== undefined)
    .reduce((max, item) => Math.max(max, parseInt(item.idimplementacion, 10)), 0);
  
    let nuevoIdimplementacion = (maxIdimplementacion + 1).toString();

    let modeloEvaluacion: Implementacion = {
      idimplementacion: nuevoIdimplementacion,
      idsolicitud: this.Input_data.data.idsolicitud,
      fecha_implementacion: frm_implementacion.value.fecha_implementacion,
      implementacion: frm_implementacion.value.implementacion,
      fecha_creacion: frm_implementacion.value.fecha_creacion,
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
        this.openSnackBar('Implementación creada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al crear la Implementación.');  
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
            case "implementacion":
              nomVariable = "Implementación";
              break;
            case "fecha_implementacion":
              nomVariable = "Fecha de implementación";
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

  validarFormatos(frm_implementacion: FormGroup): Promise<string | null> {
    return new Promise((resolve) => {
      let mensaje: string | null = null;

      //validar que la fecha sea valida y no sea mayor a la fecha actual
      const fecha_implementacion = moment(frm_implementacion.value.fecha_implementacion, 'DD/MM/YYYY');
      const fechaActual = moment();
      if (!fecha_implementacion.isValid()) {
        mensaje = 'La fecha de implementación no es válida.';
      } else if (fecha_implementacion.isAfter(fechaActual)) {
        mensaje = 'La fecha de implementación no puede ser mayor a la fecha actual.';
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

    this.frm_implementacion.get('fecha_implementacion')?.setValue(formattedDate, { emitEvent: false });
    this.actual = formattedDate;

  }

  ocultarBotones(btn_guardar:boolean, btn_cancelar: boolean){
    this.bool_btn_guardar = btn_guardar;
    this.bool_btn_cancelar = btn_cancelar;
  }

  set_frm_implementacion(data: Implementacion) {
    this.frm_implementacion.setValue({
      idimplementacion: data.idimplementacion,
      idsolicitud: data.idsolicitud,
      fecha_implementacion: data.fecha_implementacion,
      implementacion: data.implementacion,
      fecha_creacion: data.fecha_creacion,
    });
  }

  ngOnInit() {

    console.log(this.Input_data);
    let data = this.Input_data.data;
    console.log(data);

    if(this.Input_data.opc == 1){
      this.titulo = 'Crear implementación';
      this.titulo_btn_guardar = 'Crear implementación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 2){
      this.titulo = 'Editar implementación';
      this.set_frm_implementacion(data);
      this.titulo_btn_guardar = 'Editar implementación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 3){
      this.titulo = 'Ver implementación';

      let procesos = data.proceso as any[];
      let implementacion = procesos.find(item => item.idimplementacion !== undefined);

      this.set_frm_implementacion(implementacion);
      this.frm_implementacion.disable();
      this.titulo_btn_cancelar = 'Cerrar';
      this.ocultarBotones(false, true);
    }
  }

}

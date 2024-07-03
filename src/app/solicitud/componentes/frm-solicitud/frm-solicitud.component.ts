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
import { Solicitud } from '../../modelos/solicitud';

@Component({
  selector: 'app-frm-solicitud',
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
  templateUrl: './frm-solicitud.component.html',
  styleUrl: './frm-solicitud.component.scss'
})
export class FrmSolicitudComponent implements OnInit{

  @Input() Input_data: any;
  @Output() acciones = new EventEmitter<any>();

  frm_solicitud: FormGroup;

  titulo: string = 'Crear solicitud';
  titulo_btn_guardar: string = 'Crear solicitud';
  titulo_btn_cancelar: string = 'Cancelar';

  bool_btn_guardar: boolean = true;
  bool_btn_cancelar: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private solicitudService: SolicitudService
  ) {
    this.frm_solicitud = this.formBuilder.group({
      idsolicitud: [''],
      fecha_solicitud: [moment().format('DD-MM-YYYY'), Validators.required],
      solicitud: ['', Validators.required],
      fecha_creacion: [moment().format('YYYY-MM-DD HH:mm:ss'), Validators.required],
      afectado: ['', Validators.required],
    });
  }

  async onSubmit() {
    console.log(this.frm_solicitud.value);
    if (this.frm_solicitud.valid) {
      console.log('formulario valido');
      // evalular si  contiene el _id para editar o crear
      if (this.frm_solicitud.value.idsolicitud) {
        console.log('this.frm_solicitud.value.idsolicitud', this.frm_solicitud.value.idsolicitud);
        const mensaje = await this.validarFormatos(this.frm_solicitud);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }
      
        this.F_editar_solicitud(this.frm_solicitud);
      }
      else if (!this.frm_solicitud.value.idsolicitud){
        console.log('crear solicitud');
        const mensaje = await this.validarFormatos(this.frm_solicitud);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }

        this.F_crear_solicitud(this.frm_solicitud);
      }

    } else {
      console.log('formulario invalido');
      let missingFieldName = await this.buscarCampoVacio(this.frm_solicitud.value);
      if(missingFieldName !== null)this.openSnackBar(missingFieldName);
    }
  }

  F_editar_solicitud(frm_solicitud: FormGroup){

    console.log(frm_solicitud.value);
    let fecha_solicitud = moment(frm_solicitud.value.fecha_solicitud, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_solicitud.get('fecha_solicitud')?.setValue(fecha_solicitud);
    console.log(frm_solicitud.value);

    let modeloSolicitud: Solicitud = {
      idsolicitud: frm_solicitud.value.idsolicitud,
      fecha_solicitud: frm_solicitud.value.fecha_solicitud,
      solicitud: frm_solicitud.value.solicitud,
      fecha_creacion: frm_solicitud.value.fecha_creacion,
      afectado: frm_solicitud.value.afectado,
      proceso: this.Input_data.data.proceso
    };

    console.log(modeloSolicitud);

    this.solicitudService.updateSolicitud(modeloSolicitud).subscribe(
      (response) => {
        console.log(response);
        this.F_acciones('editar', modeloSolicitud);
        this.openSnackBar('Solicitud actualizada correctamente.');
      },
      (error) => {
        console.error('Error al actualizar la solicitud:', error);
        this.openSnackBar('Error al actualizar la solicitud.');
      }
    );

  };

  F_crear_solicitud(frm_solicitud: FormGroup) {
    console.log(frm_solicitud.value);

    let fecha_solicitud = moment(frm_solicitud.value.fecha_solicitud, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_solicitud.get('fecha_solicitud')?.setValue(fecha_solicitud);
    console.log(frm_solicitud.value);

    let modeloSolicitud: Solicitud = {
      idsolicitud: '',
      fecha_solicitud: frm_solicitud.value.fecha_solicitud,
      solicitud: frm_solicitud.value.solicitud,
      fecha_creacion: frm_solicitud.value.fecha_creacion,
      afectado: frm_solicitud.value.afectado,
      proceso: []
    };

    console.log(modeloSolicitud);
    this.solicitudService.createSolicitud(modeloSolicitud).subscribe(
      (response) => {
        console.log(response);
        this.F_acciones('crear', modeloSolicitud);
        this.openSnackBar('Solicitud creada correctamente.');
      },
      (error) => {
        console.error('Error al crear la solicitud:', error);
        this.openSnackBar('Error al crear la solicitud.');  
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
            case "solicitud":
              nomVariable = "Solicitud";
              break;
            case "fecha_solicitud":
              nomVariable = "Fecha de solicitud";
              break;
            case "afectado":
              nomVariable = "Afectado";
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

  validarFormatos(frm_solicitud: FormGroup): Promise<string | null> {
    return new Promise((resolve) => {
      let mensaje: string | null = null;

      //validar que la fecha sea valida y no sea mayor a la fecha actual
      const fecha_solicitud = moment(frm_solicitud.value.fecha_solicitud, 'DD/MM/YYYY');
      const fechaActual = moment();
      if (!fecha_solicitud.isValid()) {
        mensaje = 'La fecha de solicitud no es válida.';
      } else if (fecha_solicitud.isAfter(fechaActual)) {
        mensaje = 'La fecha de solicitud no puede ser mayor a la fecha actual.';
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

    this.frm_solicitud.get('fecha_solicitud')?.setValue(formattedDate, { emitEvent: false });
    this.actual = formattedDate;

  }

  ocultarBotones(btn_guardar:boolean, btn_cancelar: boolean){
    this.bool_btn_guardar = btn_guardar;
    this.bool_btn_cancelar = btn_cancelar;
  }

  set_frm_solicitud(data: any){
    this.frm_solicitud.patchValue({
      idsolicitud: data.idsolicitud,
      fecha_solicitud: moment(data.fecha_solicitud).format('DD/MM/YYYY'),
      solicitud: data.solicitud,
      fecha_creacion: data.fecha_creacion,
      afectado: data.afectado,
    });
  }

  ngOnInit() {
    let data = this.Input_data.data;
    if(this.Input_data.opc == 1){
      this.titulo = 'Crear solicitud';
      this.titulo_btn_guardar = 'Crear solicitud';
      this.ocultarBotones(false, false);
    }
    else if(this.Input_data.opc == 2){
      this.titulo = 'Editar solicitud';
      this.set_frm_solicitud(data);
      this.titulo_btn_guardar = 'Editar solicitud';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 3){
      this.titulo = 'Ver solicitud';
      this.set_frm_solicitud(data);
      this.frm_solicitud.disable();
      this.titulo_btn_guardar = 'Cerrar';
      this.ocultarBotones(true, false);
    }
  }

}

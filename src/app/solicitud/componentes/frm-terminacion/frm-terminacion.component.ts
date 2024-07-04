import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators,FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


import { MatSelectModule} from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatLabel } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';

// Librerias
import moment from 'moment';

// servicios
import { SolicitudService } from '../../servicios/solicitud.service';

// modelos
import { Solicitud, Terminacion } from '../../modelos/solicitud';

interface Estado {
  value: string;
  estado: string;
}

@Component({
  selector: 'app-frm-terminacion',
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
    MatSelectModule
  ],
  templateUrl: './frm-terminacion.component.html',
  styleUrl: './frm-terminacion.component.scss'
})
export class FrmTerminacionComponent implements OnInit{

  @Input() Input_data: any;
  @Output() acciones = new EventEmitter<any>();

  frm_terminacion: FormGroup;

  titulo: string = 'Crear terminación';
  titulo_btn_guardar: string = 'Crear terminación';
  titulo_btn_cancelar: string = 'Cancelar';

  bool_btn_guardar: boolean = true;
  bool_btn_cancelar: boolean = true;

  estadoSeleccionado: number = 0;

  estadosTerminacion: Estado[] = [
    {value: "1", estado: 'Satisfactoria'},
    {value: "2", estado: 'Cancelación'},
  ];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private solicitudService: SolicitudService
  ) {
    this.frm_terminacion = this.formBuilder.group({
      idterminacion: [''],
      idsolicitud: [''],
      fecha_terminacion: [moment().format('DD-MM-YYYY'), Validators.required],
      terminacion: ['', Validators.required],
      estado: ['1', Validators.required],
      fecha_creacion: [moment().format('YYYY-MM-DD'), Validators.required],
    });
  }

  async onSubmit() {

    if (this.frm_terminacion.valid) {

      // evalular si  contiene el _id para editar o crear
      if (this.frm_terminacion.value.idterminacion) {
      
        const mensaje = await this.validarFormatos(this.frm_terminacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }
      
        this.F_editar_terminacion(this.frm_terminacion);
      }
      else if (!this.frm_terminacion.value.idevaluacion){

        const mensaje = await this.validarFormatos(this.frm_terminacion);
        if(mensaje){
          this.openSnackBar(mensaje);
          return
        }

        this.F_crear_terminacion(this.frm_terminacion);
      }
    } else {

      let missingFieldName = await this.buscarCampoVacio(this.frm_terminacion.value);
      if(missingFieldName !== null)this.openSnackBar(missingFieldName);
    }
  }

  F_editar_terminacion(frm_terminacion: FormGroup){

    let fecha_terminacion = moment(frm_terminacion.value.fecha_terminacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_terminacion.get('fecha_terminacion')?.setValue(fecha_terminacion);

    let modeloTerminacion: Terminacion = {
      idterminacion: frm_terminacion.value.idterminacion,
      idsolicitud: this.Input_data.idsolicitud,
      fecha_terminacion: frm_terminacion.value.fecha_terminacion,
      terminacion: frm_terminacion.value.terminacion,
      estado: '1',
      fecha_creacion: frm_terminacion.value.fecha_creacion,
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
        this.openSnackBar('terminacion actualizada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al actualizar la terminacion.');
      }
    );

  };

  F_crear_terminacion(frm_terminacion: FormGroup) {

    let procesosActuales = this.Input_data.data.proceso as any[];

    // validar que no exista una terminacion o la solicitud este terminada
    if(procesosActuales && procesosActuales.length > 0 ){

      let existeImplementacion = procesosActuales.find(item => item.idimplementacion !== undefined);
      if(!existeImplementacion){
        this.openSnackBar('Primero debe registrar una implementación.');
        return;
      }

      let existeTerminacion = procesosActuales.find(item => item.idterminacion !== undefined);
      if(existeTerminacion){
        this.openSnackBar('Esta solicitud se encuentra terminada.');
        return;
      }

    }
    else{
      this.openSnackBar('Primero debe registrar una implementación.');
      return;
    }

    let fecha_terminacion = moment(frm_terminacion.value.fecha_terminacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
    frm_terminacion.get('fecha_terminacion')?.setValue(fecha_terminacion);

    let maxIdimplementacion = procesosActuales
    .filter(item => item.idterminacion !== undefined)
    .reduce((max, item) => Math.max(max, parseInt(item.idterminacion, 10)), 0);
  
    let nuevoIdimplementacion = (maxIdimplementacion + 1).toString();

    let modeloTerminacion: Terminacion = {
      idterminacion: nuevoIdimplementacion,
      idsolicitud: this.Input_data.data.idsolicitud,
      fecha_terminacion: frm_terminacion.value.fecha_terminacion,
      terminacion: frm_terminacion.value.terminacion,
      estado: frm_terminacion.value.estado.toString(),
      fecha_creacion: frm_terminacion.value.fecha_creacion,
    };

    procesosActuales.push(modeloTerminacion);

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
        this.openSnackBar('Terminación creada correctamente.');
      },
      (error) => {
        this.openSnackBar('Error al crear la Terminación.');  
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
            case "terminacion":
              nomVariable = "Terminación";
              break;
            case "fecha_terminacion":
              nomVariable = "Fecha de terminación";
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

  validarFormatos(frm_terminacion: FormGroup): Promise<string | null> {
    return new Promise((resolve) => {
      let mensaje: string | null = null;

      //validar que la fecha sea valida y no sea mayor a la fecha actual
      const fecha_terminacion = moment(frm_terminacion.value.fecha_terminacion, 'DD/MM/YYYY');
      const fechaActual = moment();
      if (!fecha_terminacion.isValid()) {
        mensaje = 'La fecha de terminación no es válida.';
      } else if (fecha_terminacion.isAfter(fechaActual)) {
        mensaje = 'La fecha de terminación no puede ser mayor a la fecha actual.';
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

    this.frm_terminacion.get('fecha_terminacion')?.setValue(formattedDate, { emitEvent: false });
    this.actual = formattedDate;

  }


  ocultarBotones(btn_guardar:boolean, btn_cancelar: boolean){
    this.bool_btn_guardar = btn_guardar;
    this.bool_btn_cancelar = btn_cancelar;
  }

  set_frm_terminacion(data: Terminacion) {
    this.frm_terminacion.setValue({
      idterminacion: data.idterminacion,
      idsolicitud: data.idsolicitud,
      fecha_terminacion: moment(data.fecha_terminacion).format('DD/MM/YYYY'),
      terminacion: data.terminacion,
      estado: data.estado,
      fecha_creacion: moment(data.fecha_creacion).format('DD/MM/YYYY'),
    });
  }

  ngOnInit() {

    console.log(this.Input_data);
    let data = this.Input_data.data;
    console.log(data);

    if(this.Input_data.opc == 1){
      this.titulo = 'Crear terminación';
      this.titulo_btn_guardar = 'Crear terminación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 2){
      this.titulo = 'Editar terminación';
      this.set_frm_terminacion(data);
      this.titulo_btn_guardar = 'Editar terminación';
      this.ocultarBotones(true, true);
    }
    else if(this.Input_data.opc == 3){
      this.titulo = 'Ver terminación';
      let procesos = data.proceso as any[];
      let terminacion = procesos.find(item => item.idterminacion !== undefined);
      console.log(terminacion);

      this.set_frm_terminacion(terminacion);
      this.frm_terminacion.disable();
      this.titulo_btn_cancelar = 'Cerrar';
      this.ocultarBotones(false, true);
    }
  }

}

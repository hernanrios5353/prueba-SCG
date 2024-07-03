// Core angular
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule } from '@angular/common';

// Angular Material
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import {MatBottomSheet} from '@angular/material/bottom-sheet';

// Librerias
import moment from 'moment';

// Componentes
import {ModalComponent} from '../../../shared/emergentes/modal/modal.component';
import {BottomSheetComponent} from '../../../shared/emergentes/bottom-sheet/bottom-sheet.component';

// Servicios
import {SolicitudService} from '../../servicios/solicitud.service' 

// Interfaces
import {Solicitud} from '../../modelos/solicitud'

@Component({
  selector: 'app-tabla-solicitud',
  standalone: true,
  imports: [
    MatTableModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatIconModule, 
    MatMenuModule,
    MatDialogModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './tabla-solicitud.component.html',
  styleUrl: './tabla-solicitud.component.scss'
})
export class TablaSolicitudComponent implements OnInit{
  arraySolicitudes: Solicitud[]=[];
  input_busqueda: string = '';

  constructor(
    private solicitudService: SolicitudService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
  ){}

  trackBySolicitud(index: number, solicitud: any): number {
    return index;
  }

  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    if(newValue.trim() === ''){
      this.filtrarSolicitudAfectado()
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.filtrarSolicitudAfectado()
    }
  }

  filtrarSolicitudAfectado() {
    console.log(this.input_busqueda);

    if(this.input_busqueda.trim() === ''){
      this.listarSolicitudes();
      return;
    }

    //buscar en el array de solicitudes el afectado que coincida con el input_busqueda
    let solicitudesFiltradas = this.arraySolicitudes.filter(solicitud => solicitud.busqueda!.toLowerCase().includes(this.input_busqueda.toLowerCase()));
    this.arraySolicitudes = solicitudesFiltradas;

  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, { data: { componente: 'persona' } });
    bottomSheetRef.afterDismissed().subscribe((res) => {
      if (res) {
        // verificar la respuesta
      }
    });
  }

  openModal(form: number,solicitud: any | null, opc: number): void {

    let data = {
      form: form,
      opc: opc,
      data:solicitud
    }

    console.log(data);

    let width =window.innerWidth;

    if(width<400){
      this.openBottomSheet();
    }
    else{
      const dialogRef =this.dialog.open(ModalComponent,{
        width: '600px',
        height: 'auto',
        data:data,
        autoFocus: false
      },);
    
      dialogRef.afterClosed().subscribe(res=>{
        if(res){

          console.log(res);
          // evaluar respuesta
          this.actualizarArray(res);
        }
      });   
    }

  }

  async actualizarArray(res: any) {
    if (res.accion === 'crear') {
      let solicitud = res.data;
      this.arraySolicitudes.push(solicitud);
      this.arraySolicitudes = await this.procesarSolicitudes(this.arraySolicitudes);
    } else if (res.accion === 'editar') {
      let solicitud = res.data;
      let index = this.arraySolicitudes.findIndex(solicitud => solicitud.idsolicitud == res.data.idsolicitud);
      this.arraySolicitudes[index] = solicitud; 
      this.arraySolicitudes = await this.procesarSolicitudes(this.arraySolicitudes);
    }
  }

  listarSolicitudes(){
    this.solicitudService.getSolicitudes()
    .subscribe(
      {
        next: async (solicitudes) => {
          this.arraySolicitudes = await this.procesarSolicitudes(solicitudes);
        },
        error: (error) => {
          console.error('Error al obtener solicitudes:', error);
        }
      }
    )
  }

  procesarSolicitudes(solicitudes: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        solicitudes.forEach(solicitud => {
          let proceso = solicitud.proceso as any[];
          let idterminacion = proceso.find(proceso => proceso.idterminacion);
          let idimplementacion = proceso.find(proceso => proceso.idimplementacion);
          let idevaluacion = proceso.find(proceso => proceso.idevaluacion);
  
          if (idterminacion) {
            solicitud.estado = 'Terminado';
            solicitud.estado2 = 4;
          } else if (idimplementacion) {
            solicitud.estado = 'Implementación';
            solicitud.estado2 = 3;
          } else if (idevaluacion) {
            solicitud.estado = 'Evaluación';
            solicitud.estado2 = 2;
          } else {
            solicitud.estado = 'Pendiente';
            solicitud.estado2 = 1;
          }

          solicitud.fecha_solicitud3 = moment(solicitud.fecha_solicitud, 'YYYY-MM-DD').format('DD/MM/YYYY');
          solicitud.fecha_creacion3 = moment(solicitud.fecha_creacion, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
          solicitud.busqueda = Object.keys(solicitud).map(key => key !== 'proceso' ? solicitud[key] : '').join(' ').toLowerCase();

          solicitud.fecha_solicitud2 = moment(solicitud.fecha_solicitud, 'YYYY-MM-DD').toDate();
          solicitud.fecha_creacion2 = moment(solicitud.fecha_creacion, 'YYYY-MM-DD HH:mm:ss').toDate();
        });

        //ordena las solicitudes por codigo
        solicitudes.sort((a, b) => {
          return a.idsolicitud > b.idsolicitud ? 1 : -1;
        });

        this.solicitudService.actualizarJsonLocalStorage(solicitudes);
  
        resolve(solicitudes);
      } catch (error) {
        reject(error);
      }
    });
  }

  openModalPorEstado(estado2: any, solicitud: any): void {

    console.log(estado2);
    console.log(solicitud);
    //llamar al modal segun el estado, y opcion 3 para ver
    if(estado2==2){
      this.openModal(2,solicitud,3);
    }
    else if(estado2==3){
      this.openModal(3,solicitud,3);
    }
    else if(estado2==4){
      this.openModal(4,solicitud,3);
    }
    
  }

  ngOnInit() {
    this.listarSolicitudes();
  }

}

/**  README
 
  Lista de formularios :
  1 = Formulario de solicitud
  2 = Formulario de evaluacion
  3 = Formulario de implementación
  4 = Formulario de terminacion

  Opciones de modal (opc):
  1 = Crear
  2 = Editar
  3 = Ver

  Jerarquia de estados
  1. Pendiente
  2. Evaluación
  3. Implementación
  4. Terminado 

*/
// Core angular
import {Component, Input, OnInit} from '@angular/core';
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
import {MatTooltipModule} from '@angular/material/tooltip';

// Librerias
import moment from 'moment';

// Componentes
import {ModalComponent} from '../../../shared/emergentes/modal/modal.component';
import {BottomSheetComponent} from '../../../shared/emergentes/bottom-sheet/bottom-sheet.component';

// Servicios
import {SolicitudService} from '../../servicios/solicitud.service' 

// Interfaces
import {Solicitud, ProcesoIntegrado} from '../../modelos/solicitud'

@Component({
  selector: 'app-tabla-procesos',
  standalone: true,
  imports: [
    MatTableModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatIconModule, 
    MatMenuModule,
    MatDialogModule,
    FormsModule,
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './tabla-procesos.component.html',
  styleUrl: './tabla-procesos.component.scss'
})
export class TablaProcesosComponent implements OnInit{

  @Input() Input_data: any;
  arrayProcesos:  any[]=[];
  input_busqueda: string = '';
  load:boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
  ){}

  listarProcesos(procesos: any[]){

    //recorrer los procesos y meter al array
    

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
        solicitudes.sort((a, b) => { return Number(a.idsolicitud) - Number(b.idsolicitud); });
        this.solicitudService.actualizarJsonLocalStorage(solicitudes);
  
        resolve(solicitudes);
      } catch (error) {
        reject(error);
      }
    });
  }

  trackByProcesos(index: number, proceso: any): number {
    return index;
  }

  ngOnInit() {

    let data = this.Input_data.data;
    console.log(data);

    let procesos = data.proceso as any[];
    console.log(procesos);  

    this.arrayProcesos = procesos.map(proceso => {
      let tipo = '';
      let descripcion = '';
      let fecha = '';
      let fecha_creacion = '';
      let id_pk = '';
      let id_fk = proceso.idsolicitud; // Suponiendo que el id de la solicitud está presente en todos los objetos

      // Determinar tipo y extraer propiedades comunes
      if (proceso.idevaluacion !== undefined) {
        tipo = 'Evaluacion';
        descripcion = proceso.evaluacion || proceso.solicitud_evaluacion;
        fecha = proceso.fecha_evaluacion;
        fecha_creacion = proceso.fecha_creacion;
        id_pk = proceso.idevaluacion;
      } else if (proceso.idimplementacion !== undefined) {
        tipo = 'Implementacion';
        descripcion = proceso.implementacion;
        fecha = proceso.fecha_implementacion;
        fecha_creacion = proceso.fecha_creacion;
        id_pk = proceso.idimplementacion;
      } else if (proceso.idterminacion !== undefined) {
        tipo = 'Terminacion';
        descripcion = proceso.terminacion;
        fecha = proceso.fecha_terminacion;
        fecha_creacion = proceso.fecha_creacion;
        id_pk = proceso.idterminacion;
      }

      // Retornar objeto normalizado
      return {
        tipo,
        descripcion,
        fecha,
        fecha_creacion,
        id_pk,
        id_fk
      };
    });

    console.log(this.arrayProcesos);
    
    //this.listarSolicitudes(procesos);
  }

}

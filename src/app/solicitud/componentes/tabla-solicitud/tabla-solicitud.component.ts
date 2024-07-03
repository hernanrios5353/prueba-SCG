// Core angular
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

// Angular Material
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import {MatBottomSheet} from '@angular/material/bottom-sheet';

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
    FormsModule
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
    let solicitudesFiltradas = this.arraySolicitudes.filter(solicitud => solicitud.afectado.toLowerCase().includes(this.input_busqueda.toLowerCase()));
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

  actualizarArray(res: any) {
    if (res.accion === 'crear') {
      let solicitud = res.data;
      this.arraySolicitudes.push(solicitud);
      
    } else if (res.accion === 'editar') {
      let solicitud = res.data;

      // actualizar el array de personas con la persona editada
      let index = this.arraySolicitudes.findIndex(solicitud => solicitud.idsolicitud == res.data.idsolicitud);
      this.arraySolicitudes[index] = solicitud; 
    }
  }


  listarSolicitudes(){
    this.solicitudService.getSolicitudes()
    .subscribe(
      {
        next: (solicitudes) => {
          this.arraySolicitudes = solicitudes;
        },
        error: (error) => {
          console.error('Error al obtener solicitudes:', error);
        }
      }
    )
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

*/
import { Component } from '@angular/core';

import { TablaSolicitudComponent } from '../tabla-solicitud/tabla-solicitud.component'

@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [TablaSolicitudComponent],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.scss'
})
export class SolicitudComponent {

  titulo = 'Solicitudes';

}

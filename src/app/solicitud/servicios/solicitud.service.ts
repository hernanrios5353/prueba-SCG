import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private solicitudesUrl = '../../../assets/json_examen_programador.json';  // URL to JSON file
  private solicitudes: any[] = [];
  
  constructor(private http: HttpClient) {}

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

getSolicitudes(): Observable<any[]> {
    try {
      if (this.isLocalStorageAvailable()) {
        const storedSolicitudes = localStorage.getItem('solicitudes');
        if (storedSolicitudes) {
          this.solicitudes = JSON.parse(storedSolicitudes);
          return of(this.solicitudes);
        }
      }
      
      return this.http.get<any>(this.solicitudesUrl).pipe(
        map(response => {
          this.solicitudes = response.solicitud || [];
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem('solicitudes', JSON.stringify(this.solicitudes));
          }
          return this.solicitudes;
        }),
        catchError(error => {
          console.error('Error al obtener solicitudes:', error);
          return of([]);
        })
      );
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      return of([]);
    }
  }
  
  updateSolicitud(solicitud: any): Observable<any> {
    try {
      let idsolicitud = solicitud.idsolicitud;
      let arraysolicitud = JSON.parse(localStorage.getItem('solicitudes') || '[]') as any[];

      // Buscar el índice de la solicitud a actualizar
      let index = arraysolicitud.findIndex(s => s.idsolicitud === idsolicitud);

      // Si la solicitud existe, actualizarla
      if (index !== -1) {
        arraysolicitud[index] = solicitud;
        // Almacenar en localStorage
        localStorage.setItem('solicitudes', JSON.stringify(arraysolicitud));
        // Retornar una respuesta en caso de éxito
        return of(solicitud);
      } else {
        // Si la solicitud no se encuentra, retornar un error
        return of({ error: 'Solicitud no encontrada' });
      }
    } catch (error) {
      console.error('Error al actualizar la solicitud:', error);
      return of({ error: 'Error al actualizar la solicitud' });
    }
  }

  // crear una nueva solicitud, incorporando la nueva solicitud al arreglo de solicitudes y almacenandola en localstorage
  // se debe de buscar el id de la solicitud mas alto y sumarle 1 para asignar el nuevo id

  createSolicitud(solicitud: any): Observable<any> {
    try {
      let arraysolicitud = JSON.parse(localStorage.getItem('solicitudes') || '[]') as any[];
      let idsolicitud = Math.max(...arraysolicitud.map(solicitud => parseInt(solicitud.idsolicitud))) + 1;
      solicitud.idsolicitud = idsolicitud.toString();
      arraysolicitud.push(solicitud);
      localStorage.setItem('solicitudes', JSON.stringify(arraysolicitud));
      return of(solicitud);
    } catch (error) {
      return of([]);
    }
  }


}
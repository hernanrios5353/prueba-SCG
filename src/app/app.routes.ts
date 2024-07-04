import { Routes } from '@angular/router';

import { SolicitudComponent } from '../app/solicitud/componentes/solicitud/solicitud.component';

export const routes: Routes = [

    { path: 'solicitud', component: SolicitudComponent },
    {
        path: '', redirectTo: '/solicitud', pathMatch: 'full'
    },
    { path: '**', redirectTo: '/solicitud' }

];

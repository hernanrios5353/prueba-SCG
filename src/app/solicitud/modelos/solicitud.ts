export interface Solicitud {
    idsolicitud: string;
    fecha_solicitud: string;
    fecha_solicitud2?: string;
    fecha_solicitud3?: string;
    solicitud: string;
    fecha_creacion: string;
    fecha_creacion2?: string;
    fecha_creacion3?: string;
    afectado: string;
    proceso: Proceso[];
    estado?: 'Pendiente' | 'Evaluación' | 'Implementación' | 'Terminado';
    estado2?: 1 | 2 | 3 | 4;
    busqueda?: string;
}

export interface Proceso {
    idevaluacion?: string;
    fecha_evaluacion?: string;
    evaluacion?: string;
    idimplementacion?: string;
    fecha_implementacion?: string;
    implementacion?: string;
    fecha_creacion: string;
}

export interface Evaluacion {
    idevaluacion: string;
    idsolicitud: string;
    fecha_evaluacion: string;
    evaluacion: string;
    fecha_creacion: string;
}

export interface Implementacion {
    idimplementacion: string;
    idsolicitud: string;
    fecha_implementacion: string;
    implementacion: string;
    fecha_creacion: string;
}

export interface Terminacion {
    idterminacion: string;
    idsolicitud: string;
    fecha_terminacion: string;
    terminacion: string;
    estado: '1' | '2';
    fecha_creacion: string;
}

// crear una interfaz que permita la integracion de evaluacion, implementacion que sera usada en una tabla
// para eso se debe incorporar un campo que permita identificar el tipo de proceso

export interface ProcesoIntegrado {
    idsolicitud:string
    idproceso: string;
    i_Evaluacion?: Evaluacion;
    i_Implementacion?: Implementacion;
    i_Terminacion?: Terminacion;
}
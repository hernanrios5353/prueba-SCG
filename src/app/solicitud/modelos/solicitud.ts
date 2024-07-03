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
    solicitud_evaluacion: string;
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
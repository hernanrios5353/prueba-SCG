export interface Solicitud {
    idsolicitud: string;
    fecha_solicitud: string;
    solicitud: string;
    fecha_creacion: string;
    afectado: string;
    proceso: Proceso[];
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
    estado: 'Satisfactoria' | 'Cancelación';
    fecha_creacion: string;
}
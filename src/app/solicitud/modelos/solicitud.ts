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
    fecha_evaluacion: string;
    evaluacion: string;
    fecha_creacion: string;
}

export interface Implementacion {
    idimplementacion: string;
    fecha_implementacion: string;
    implementacion: string;
    fecha_creacion: string;
}
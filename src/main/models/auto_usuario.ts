import { RowDataPacket } from "mysql2";

interface iAutoUsuario extends RowDataPacket {
    id_auto_usuario: number,
    cve_accion: number,
    cve_socio: number,
    tipo: 'auto' | 'camioneta',
    marca: string,
    modelo: string,
    color: string,
    placas: string,
    tag: 'tag' | 'repuve',
    repuve_tag: string,
    fecha_registro: Date,
    estatus: number,
    nombre: string,
    apellido_paterno: string,
    apellido_materno: string,
    accion_name: string,
    estatus_accion: number
}

export type { iAutoUsuario }
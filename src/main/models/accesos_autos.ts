import { RowDataPacket } from "mysql2";

interface iAccesosAutos extends RowDataPacket {   
    hora_entrada: number,
    tipo: 'auto' | 'camioneta',
    marca: string,
    modelo: string,
    color: string,
    placas: string,
    tag: 'tag' | 'repuve',   
    nombre: string,
    apellido_paterno: string,
    apellido_materno: string,
    accion_name: string,
}

interface iFlag extends RowDataPacket{
    flag?:number
}

interface iFlagExist extends RowDataPacket{
    exist:number,
    flag?:number
}

export type { iAccesosAutos,iFlag ,iFlagExist}
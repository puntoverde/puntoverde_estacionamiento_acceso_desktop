import dayjs from 'dayjs';
import { iAccesosAutos, iFlag, iFlagExist } from '../models/accesos_autos';
import { iAutoUsuario } from '../models/auto_usuario';
import AccionNoPagadaError from '../util/error_accion_no_pagada';
import AutoNoRegistradoError from '../util/error_auto_no_registrado';
import CupoAccionLlenoError from '../util/error_cupo_accion_lleno';
import HorarioAccesoError from '../util/error_horario_acceso';
import _DBPool from './../db'

async function getAccesosAutos(): Promise<iAccesosAutos[]> {
    try {        

        const [rows] = await _DBPool.query<iAccesosAutos[]>(`
                    SELECT 
                        CONCAT(acciones.numero_accion,CASE acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion_name,
                        acceso_auto.entrada AS hora_entrada,
                        autos_usuario.color,
                        autos_usuario.tipo,
                        autos_usuario.marca,
                        autos_usuario.modelo,
                        autos_usuario.placas,
                        autos_usuario.tag,
                        persona.nombre,
                        persona.apellido_paterno,
                        persona.apellido_materno
                    FROM acceso_auto
                    INNER JOIN autos_usuario ON acceso_auto.id_auto_usuario=autos_usuario.id_auto_usuario
                    INNER JOIN socios ON autos_usuario.cve_socio=socios.cve_socio
                    INNER JOIN persona ON socios.cve_persona=persona.cve_persona
                    INNER JOIN acciones ON socios.cve_accion=acciones.cve_accion
                    WHERE acceso_auto.fecha = CURDATE() ORDER BY acceso_auto.entrada DESC;`)
        return rows;

    } catch (error) {
        throw error
    }
}

async function getAutosByTag(tag: string): Promise<iAutoUsuario> {

    const conection=await _DBPool.getConnection()
    console.log('*****ONTIENE CONEXCION DEL POOL')
    try {

        console.log('*****INICIO TRANSACCION')
        await conection.beginTransaction()     

        const [rows_dia_horario]=await conection.query(`SELECT dia FROM configuracion_horario_estacionamiento WHERE dia= ? AND CURTIME() BETWEEN hora_inicio AND hora_fin`,[dayjs().day()+1]);


        console.log("🚀 ~ file: main_dao.ts:50 ~ getAutosByTag ~ rows_dia_horario:",dayjs().day()+1 ,rows_dia_horario);

        if(!Boolean(rows_dia_horario[0]))
            {
               console.log("*****YA NO ESTA EN EL HORARIO DE ACCESO")
               await  conection.query(`INSERT INTO acceso_auto_denegado(fecha,entrada,repuve_tag,motivo) VALUES(?,?,?,?)`,[new Date(),new Date(),tag.trim(),'YA NO ESTA HORARIO'])
               throw new HorarioAccesoError("FUERA HORARIO",tag.trim());
            }

        const [rows] = await conection.query<iAutoUsuario[]>(`
                    SELECT 
                            id_auto_usuario, 
                            acciones.cve_accion, 
                            autos_usuario.cve_socio, 
                            tipo, 
                            marca, 
                            modelo, 
                            color, 
                            placas, 
                            tag, 
                            repuve_tag, 
                            fecha_registro, 
                            CONVERT(autos_usuario.estatus,SIGNED) as estatus,
                            persona.nombre,
	                	    persona.apellido_paterno,
	                	    persona.apellido_materno,
                            CONCAT(numero_accion,CASE clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion_name,
                            acciones.estatus AS estatus_accion
                    FROM autos_usuario
                    INNER JOIN socios ON autos_usuario.cve_socio=socios.cve_socio
                    INNER JOIN persona ON socios.cve_persona=persona.cve_persona 
                    INNER JOIN acciones ON socios.cve_accion=acciones.cve_accion
                    WHERE tag=?;`, [tag.trim()]);        

        if(!Boolean(rows[0]))
        {
           console.log("*****AUTO NO REGISTRADO")
           await  conection.query(`INSERT INTO acceso_auto_denegado(fecha,entrada,repuve_tag,motivo) VALUES(?,?,?,?)`,[new Date(),new Date(),tag.trim(),'AUTO NO REGISTRADO'])
           throw new AutoNoRegistradoError("AUTO NO REGISTRADO",tag.trim());
        }

        const [rows_activo] = await conection.query<iFlag[]>(`SELECT acciones.estatus FROM acciones WHERE acciones.cve_accion=?`, [rows[0]?.cve_accion]);  

        if([2,3,'2','3'].includes(rows_activo[0]?.estatus)){
            await  conection.query(`INSERT INTO acceso_auto_denegado(id_auto_usuario,fecha,entrada) VALUES(?,?,?,?,?)`,[rows[0]?.id_auto_usuario,new Date(),new Date(),tag.trim(),'ACCION NO PAGADA O BLOQUEADA'])
            throw new AccionNoPagadaError("ACCION NO PAGADA",rows[0]);
        }
        

        const [rows_cupo] = await conection.query<iFlag[]>(`
                                SELECT 
                                    COUNT(*)>=IFNULL(cupo_estacionamiento_accion_config.cupo,3) AS flag 
                                FROM acceso_auto
                                INNER JOIN autos_usuario ON acceso_auto.id_auto_usuario=autos_usuario.id_auto_usuario 
                                INNER JOIN socios ON autos_usuario.cve_socio=socios.cve_socio
                                LEFT JOIN cupo_estacionamiento_accion_config ON socios.cve_accion=cupo_estacionamiento_accion_config.id_accion
                                WHERE fecha=CURDATE() AND salida IS NULL AND socios.cve_accion=? AND autos_usuario.tag!=?
                                GROUP BY socios.cve_accion`, [rows[0]?.cve_accion,tag.trim()]);  

        console.log("🚀 ~ file: main_dao.ts:82 ~ getAutosByTag ~ rows_cupo:", rows_cupo[0]);

        if(Boolean(rows_cupo[0]?.flag))
        {
            await  conection.query(`INSERT INTO acceso_auto_denegado(id_auto_usuario,fecha,entrada) VALUES(?,?,?,?,?)`,[rows[0]?.id_auto_usuario,new Date(),new Date(),tag.trim(),'CUPO LLENO'])
          console.log("ya esan todos los autos de la accion dentro")
          throw new CupoAccionLlenoError("CUPO LLENO",rows[0])
        }


        const [rows_exist_entrada] = await conection.query<iFlagExist[]>(`
                SELECT 
                    ifnull(acceso_auto.id_auto_usuario,0) AS exist,
                    ifNULL(TIMESTAMPDIFF(MINUTE,max(acceso_auto.entrada),CURTIME())>10,0) AS flag
                FROM acceso_auto
                WHERE fecha=CURDATE() AND salida IS NULL AND acceso_auto.id_auto_usuario=?
                GROUP BY acceso_auto.id_auto_usuario`, [rows[0]?.id_auto_usuario]);

        console.log("🚀 ~ file: main_dao.ts:101 ~ getAutosByTag ~ rows_exist_entrada:", rows_exist_entrada);

        
        if(!Boolean(rows_exist_entrada[0]?.exist) && !Boolean(rows_exist_entrada[0]?.flag))
        {
            console.log('ingresa por primera vez')
            await conection.query(`INSERT INTO acceso_auto(id_auto_usuario,fecha,entrada) VALUES(?,?,?)`,[rows?.[0]?.id_auto_usuario,new Date(),new Date()])
            // const [insert_]=await statement.execute([rows?.[0]?.id_auto_usuario,new Date(),new Date()]);
            // statement.close();
        }  
        
        if(Boolean(rows_exist_entrada?.[0]?.exist) && Boolean(rows_exist_entrada?.[0]?.flag))
        {
            console.log('ya tenia un acceso lo cierra y vuelve a ingresar')
               await  conection.query(`UPDATE acceso_auto SET salida=CURTIME() WHERE id_auto_usuario=? AND fecha=CURDATE()`,[rows[0]?.id_auto_usuario])                                   
                
                await  conection.query(`INSERT INTO acceso_auto(id_auto_usuario,fecha,entrada) VALUES(?,?,?)`,[rows[0]?.id_auto_usuario,new Date(),new Date()])                        
                               
        }  

           

        console.log('realiza commir de la transaccion')
        await conection.commit()

        

        return rows?.[0];

    } catch (error) {
        console.log("error realiza roolbaxk")
        await conection.rollback()   
        console.log("finalizo el roolbaxk")     
        throw error
    }
    finally{
        console.log('Libera en el sinally la conexion del pool y la coneccion')
        _DBPool.releaseConnection(conection);
        conection.release();
        console.log('termina liberacion de el finally')
    }
}

async function findAutoDatos(search:string):Promise<iAccesosAutos>
{
    try {        

        const [rows] = await _DBPool.query<iAccesosAutos[]>(`
                    SELECT 
                        CONCAT(acciones.numero_accion,CASE acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion_name,                        
                        autos_usuario.color,
                        autos_usuario.tipo,
                        autos_usuario.marca,
                        autos_usuario.modelo,
                        autos_usuario.placas,
                        autos_usuario.tag,
                        persona.nombre,
                        persona.apellido_paterno,
                        persona.apellido_materno
                    FROM autos_usuario
                    INNER JOIN socios ON autos_usuario.cve_socio=socios.cve_socio
                    INNER JOIN persona ON socios.cve_persona=persona.cve_persona
                    INNER JOIN acciones ON socios.cve_accion=acciones.cve_accion 
                    WHERE placas=? OR modelo=?;`,[search,search])
        return rows;

    } catch (error) {
        throw error
    }
}


export {getAccesosAutos, getAutosByTag,findAutoDatos }
import {getAccesosAutos,getAutosByTag,findAutoDatos} from './../dao/main_dao'

async function getAccesosAutosController()
{
    try {
       const data= await  getAccesosAutos()   
       return data     
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function setRegistrarEntrada(tag:string)
{
    try {
      return await getAutosByTag(tag)
    } catch (error) {
      throw error
    }
}

async function fnFindAutoDatos(search:string)
{
  try {
    const data= await  findAutoDatos(search)   
    return data     
 } catch (error) {
     console.log(error)
     throw error
 }
}

export {setRegistrarEntrada,getAccesosAutosController,fnFindAutoDatos}

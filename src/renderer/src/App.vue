<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FcNameUser from './components/functional/name-user'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'
import { Howl, Howler } from 'howler'
import error_ from './assets/sound/error_cupo.mp3'
import icon_ant from './assets/image/network-tower.svg'
import marca_ from './assets/image/car-contract-svgrepo-com.svg'


const sound = new Howl({
  src: [error_],
  html5: true,
  format: ['mp3', 'aac'],

  onloaderror(id, err) {
    console.warn('failed to load sound file:', { id, err })
  }
});

const { text, copy, copied, isSupported } = useClipboard()



const drawer = ref(null)
const antena = ref<boolean>(true)
const pluma = ref<boolean>(true)

const nombre = ref<string>()
const paterno = ref<string>()
const materno = ref<string>()

const name_accion = ref<string>()


const lst_accesos = ref<[]>([])
const lst_datos_auto = ref<[]>([])

const marca = ref<string>()
const modelo = ref<string>()
const tipo = ref<string>()
const color = ref<string>()
const placas = ref<string>()
const tag = ref<string>()

const snackbar = ref<boolean>(false)

const error = ref<string>("")

const dialog = ref<boolean>(false)

const search_datos_auto=ref<string>()



function fnGetAccesos(value) {

  nombre.value = value.nombre
  paterno.value = value.apellido_paterno
  materno.value = value.apellido_materno

  name_accion.value = value.accion_name

  marca.value = value.marca
  modelo.value = value.modelo
  tipo.value = value.tipo
  color.value = value.color
  placas.value = value.placas
  tag.value = value.tag


  lst_accesos.value.unshift({
    hora_entrada: Date(),
    tipo: value.tipo,
    marca: value.marca,
    modelo: value.modelo,
    color: value.color,
    placas: value.placas,
    tag: value.tag,
    nombre: value.nombre,
    apellido_paterno: value.apellido_paterno,
    apellido_materno: value.apellido_materno,
    accion_name: value.accion_name,
  })

  if (lst_accesos.value.length > 20) {
    lst_accesos.value.pop()
  }


}

function fnAutoNoRegistrado(value) {
  console.log('auto no registrado:', value)
  error.value = `AUTO NO REGISTRADO CON TAG: ${value}`
  sound.play()
}

function fnAccionBloqueada(value) {

  nombre.value = value.nombre
  paterno.value = value.apellido_paterno
  materno.value = value.apellido_materno

  name_accion.value = value.accion_name

  marca.value = value.marca
  modelo.value = value.modelo
  tipo.value = value.tipo
  color.value = value.color
  placas.value = value.placas
  tag.value = value.tag

  error.value = `SIN ACCESO POR FALTA DE PAGO EN ACCION: ${value.accion_name}`
  sound.play()

}

function fnCupoLleno(value) {

  nombre.value = value.nombre
  paterno.value = value.apellido_paterno
  materno.value = value.apellido_materno

  name_accion.value = value.accion_name

  marca.value = value.marca
  modelo.value = value.modelo
  tipo.value = value.tipo
  color.value = value.color
  placas.value = value.placas
  tag.value = value.tag

  error.value = `SIN ACCESO YA ESTAN DENTRO LOS AUTOS AUTORIZADOS PARA LA ACCION: ${value.accion_name}`
  sound.play()
}

function fnHorarioFuera(value) {

  error.value = `El HORARIO DE ACCESO NO ESTA DISPONIBLE`
  sound.play()
}


function fnGetDatosAuto(){
  console.log("entra a abuscar autos....")
  lst_datos_auto.value=window.api.getDatosAuto(search_datos_auto.value)
  
}

onMounted(() => {
  window.api.onCargarAccesos(fnGetAccesos)
  window.api.onAutoNoRegistrado(fnAutoNoRegistrado)
  window.api.onAccionBloqueado(fnAccionBloqueada)
  window.api.onCupoLleno(fnCupoLleno)
  window.api.onHorarioFuera(fnHorarioFuera)
})


</script>

<template>
  <v-app id="inspire">
    <v-system-bar color="grey-darken-1">
      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>

      <v-icon>mdi-circle</v-icon>

      <v-icon>mdi-triangle</v-icon>
    </v-system-bar>



    <v-navigation-drawer v-model="drawer" width="350" color="grey-lighten-3">
      <v-sheet class="pa-4" color="grey-lighten-5">
        <div class="d-flex" style="column-gap: 10px;">
          <v-avatar class="mb-4" color="grey" size="64">
          </v-avatar>
          <div class="bg-redx d-flex flex-column align-end" style="width: 100%;">
            <span class="text-subtitle-2">numero accion</span>
            <span class="text-h3 font-weight-bold">{{ name_accion }}</span>
          </div>
        </div>


        <div>
          <FcNameUser :nombre="nombre" :paterno="paterno" :materno="materno" />
        </div>
      </v-sheet>

      <v-divider></v-divider>

      <v-list lines="three">

        <v-list-item color="red">
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <v-icon>mdi-tag-arrow-left</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-h6 text-uppercase">{{ tag }}</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">TAG</v-list-item-subtitle>
          <template v-slot:append>
            <v-list-item-action>
              <v-btn :color="copied ? 'warning' : ''" :active="copied" @click="copy(tag)" variant="text"
                icon="mdi-content-copy" v-if="isSupported"></v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item color="red" id="marca">
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <!-- <v-icon>mdi-plus</v-icon> -->
              <v-img :src="marca_" height="32" width="32"></v-img>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-h6 text-uppercase">{{ marca }}</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">Marca</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item color="red">
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <v-icon>mdi-plus</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-h6 text-uppercase">{{ modelo }}</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">Modelo</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item>
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <v-icon>mdi-car-back</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-h6 text-uppercase">{{ tipo }}</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">Tipo</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>


        <v-list-item>
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <v-icon>mdi-palette</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="pt-2">
            <div :style="{ backgroundColor: color }" style="height: 30px;" class="rounded border"></div>
          </v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">Color</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item>
          <template #prepend>
            <v-avatar color="grey" tile rounded size="large">
              <v-icon>mdi-checkbook</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-h6 text-uppercase">{{ placas }}</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-subtitle-1">Placa</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

      </v-list>

      <v-sheet color="amber-lighten-4" height="calc(100% - 730px)" width="100%">
        <v-icon color="amber-darken-4" size="45px">mdi-bell</v-icon>
        <div class="pa-5 text-h6 font-weight-bold">
          {{ error }}
        </div>
      </v-sheet>

    </v-navigation-drawer>

    <v-app-bar color="grey" title="Sistema Acceso Estacionamiento" order="1" elevation="1">

      <v-toolbar-items>
        <v-btn :color="antena ? 'white' : 'grey-darken-1'"
          :class="{ 'animate__animated animate__pulse animate__infinite	infinite': antena }">
          <!-- <v-icon size="38">mdi-antenna</v-icon> -->
          <v-img height="38" width="38" :src="icon_ant" style="color:white;"></v-img>
        </v-btn>
      </v-toolbar-items>
      <v-divider vertical></v-divider>
      <v-toolbar-items>
        <v-btn :color="pluma ? 'white' : 'grey-darken-1'"
          :class="{ 'animate__animated animate__pulse animate__infinite	infinite': pluma }">
          <v-icon size="38">mdi-boom-gate</v-icon>
        </v-btn>
      </v-toolbar-items>
      <v-divider vertical></v-divider>
      <v-toolbar-items>
      <v-btn @click="dialog=true">Buscar auto</v-btn>
    </v-toolbar-items>

    </v-app-bar>

    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row>
          <v-col>
            <v-card>
              <v-list lines="two">
                <v-list-subheader>accesos</v-list-subheader>

                <template v-for="(n, index) in lst_accesos" :key="index">
                  <v-list-item :style="{ borderLeft: `10px solid ${n.color}` }" class="pr-15">
                    <template v-slot:prepend>
                      <v-sheet variant="outlined" rounded height="50" width="80" color="grey-darken-1x"
                        class="d-flex justify-center align-center text-h5">
                        {{ n.accion_name }}
                      </v-sheet>
                      <!-- <v-avatar tile rounded size="50" color="grey-darken-1"><v-icon>mdi-check</v-icon></v-avatar> -->
                    </template>

                    <v-list-item-title class="pl-10 d-flex justify-space-between">
                      <!-- {{ n.accion_name }} -->
                      <div>
                        <v-icon>mdi-account</v-icon>
                        <FcNameUser :nombre="n.nombre" :paterno="n.apellido_paterno" :materno="n.apellido_materno">
                        </FcNameUser>
                      </div>
                      <v-card class="px-2 font-weight-bold"><v-icon class="mr-2">mdi-tag-arrow-left</v-icon>{{ n.tag
                        }}</v-card>
                    </v-list-item-title>

                    <v-list-item-subtitle class="pl-10 d-flex justify-space-between">
                      <div>
                        <span class=" text-subtitle-1">Marca:</span> <span
                          class="font-weight-bold text-subtitle-1 text-uppercase">{{ n.marca }}</span>
                        <span class=" text-subtitle-1 ml-5 ">Modelo:</span> <span
                          class="font-weight-bold text-subtitle-1">{{
                            n.modelo }}</span>
                      </div>
                      <v-card variant="outlined" class="px-2 mt-1 text-black" max-height="20">{{ n.placas }}</v-card>
                    </v-list-item-subtitle>


                    <template v-slot:append>
                      <v-list-item-action>
                        <v-icon class="mr-3">mdi-clock</v-icon> {{ dayjs(n.hora_entrada).format("hh:mm") }}
                      </v-list-item-action>
                    </template>

                  </v-list-item>

                  <v-divider v-if="n !== 6" :key="`divider-${n}`" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    </v-main>


    <v-dialog v-model="dialog" width="700" persistent scrollable>
      <v-card rounded="xl">
        <v-toolbar extended extension-height="60">
          <v-toolbar-title>
            Buscar datos usuario
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="()=>{dialog=false;lst_datos_auto=[];search_datos_auto=''}"></v-btn>

          <template #extension>
            <div class="w-100 d-flex align-center pb-3 px-5 ga-2">
              <!-- <v-text-field label="Placa" variant="solo" hide-details></v-text-field> -->
              <v-text-field v-model="search_datos_auto" label="Placa o Modelo" variant="solo" hide-details></v-text-field>
              <v-btn variant="elevated bg-success" size="x-large" @click="fnGetDatosAuto"><v-icon size="large">mdi-magnify</v-icon></v-btn>
            </div>
          </template>
        </v-toolbar>
        <v-card-text>

          <v-list>
            <template v-for="auto_dato in lst_datos_auto">
              <v-list-item >
                <v-list-item-title>Nombre: {{auto_dato.nombre}}  <span class="font-weight-bold">{{ auto_dato.apellido_paterno }}</span> <span class="font-italic">{{ auto_dato.apellido_materno }}</span></v-list-item-title>
                <v-list-item-subtitle class="text-subtitle-1">
                  <span>Auto:</span> <span class="font-weight-bold">{{ auto_dato.marca }} {{ auto_dato.modelo }}</span>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-subtitle-1">
                  <span>placas</span> <span class="font-weight-bold">:{{ auto_dato.placas }}</span>
                </v-list-item-subtitle>
                <template #append>
                  <span>Accion: {{ auto_dato.accion_name }}</span>
                </template>
              </v-list-item>
              <v-divider inset></v-divider>
            </template>
          </v-list>

        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<style>
/* #marca{
  background-image: url('./assets/mazda.svg');
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 120px 120px;
  } */
</style>
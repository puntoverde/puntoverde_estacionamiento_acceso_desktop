import { h ,Fragment} from 'vue'

type fcProps = {
    nombre?: string,
    paterno?: string,
    materno?: string,
}

const FcNameUser = (props: fcProps) => {

   return h(Fragment,[
    h('span',props.nombre),
    h('span',{style:{fontWeight:'bold',margin:'0 5px'}},props.paterno),
    h('span',{style:{fontStyle: 'italic'}},props.materno),
   ]);

}

FcNameUser.props = {
    nombre: {
        type: String,
        required: false
    },
    paterno: {
        type: String,
        required: false
    },
    materno: {
        type: String,
        required: false
    }
}

export default FcNameUser;
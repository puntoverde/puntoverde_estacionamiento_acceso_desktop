type iPluma = {
    path: string,
    serialNumber: string,
    friendlyName: string,
    vendorId: string,
    productId: string
}

type schema_storage ={
    antena: {}
    pluma: iPluma
}

export default schema_storage
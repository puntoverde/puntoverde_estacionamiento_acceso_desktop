class AccionNoPagadaError extends Error {
    data;
    constructor(message,data) {
      super(message); // (1)
      this.name = "AccionNoPagadaError"; // (2)
      this.data=data;
    }
  }

  export default AccionNoPagadaError
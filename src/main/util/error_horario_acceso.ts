class HorarioAccesoError extends Error {
    data;
    constructor(message,data) {
      super(message); // (1)
      this.name = "HorarioAccesoError"; // (2)
      this.data=data;
    }
  }

  export default HorarioAccesoError
class CupoAccionLlenoError extends Error {
    data;
    constructor(message,data) {
      super(message); // (1)
      this.name = "CupoAccionLlenoError"; // (2)
      this.data=data;
    }
  }

  export default CupoAccionLlenoError
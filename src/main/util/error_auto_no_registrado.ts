class AutoNoRegistradoError extends Error {
    data;
    constructor(message,data) {
      super(message); // (1)
      this.name = "AutoNoRegistradoError"; // (2)
      this.data=data;
    }
  }

  export default AutoNoRegistradoError
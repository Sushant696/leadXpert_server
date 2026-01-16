class ApiError extends Error {
  status: number;

  constructor( status: number = 400,message: string) {
    super(message);
    this.status = status;
  }
}

export default ApiError;


class ApiResponse {
  status: number
  message: string
  data: any
  success: boolean

  constructor(status: number = 200, message: string = "", data: any = {}, success: boolean = true) {
    this.status = status
    this.message = message
    this.data = data
    this.success = success
  }
}

export default ApiResponse

const errorMessages = {
  USER: {
    NOT_FOUND: "The specified user does not exist in our system.",
    CREATION_FAILED:
      "We encountered an issue while creating your account. Please try again.",
    UPDATE_FAILED:
      "Unable to update the user information. Please check your input and try again.",
    DELETION_FAILED: "We couldn't delete the user. Please try again later.",
    INVALID_CREDENTIALS:
      "The credentials provided are incorrect. Please check and try again.",
    EXIST:
      "The user with same email or username already exists.",
    UNAUTHORIZED: "Unauthorized access.",
    USER_RESOURCES_MISSING: "Invalid Request, the complete the error meessage pleseeeeeee!!!!"
  },
  NAME: {
    REQUIRED: "Please provide your name. This field cannot be left empty.",
    INVALID:
      "The name entered contains invalid characters. Please use only alphabets.",
  },
  TOKEN: {
    NOT_FOUND: "Unauthorized, Missing Token",
    INVALID_TOKEN: "Unauthorized, Invalid Token",
    TOKEN_USER_NOT_FOUND: "Unauthorized, user not found!"
  },
  USERNAME: {
    CONFLICT:
      "The chosen username is already in use. Please select a different one.",
    REQUIRED: "Username is required. Please enter a valid username.",
    INVALID:
      "The username format is invalid. Ensure it meets the required criteria.",
  },
  EMAIL: {
    CONFLICT:
      "This email is already registered. Please log in or use a different email address.",
    REQUIRED: "An email address is required. Please enter a valid email.",
    INVALID: "The email format is incorrect. Please use a valid email address.",
  },
  PASSWORD: {
    REQUIRED: "A password is required. Please provide one.",
    LENGTH: "Your password must be between 8 to 16 characters long.",
    INVALID:
      "The password provided does not meet the required format. Please try again.",
  },
  VALIDATION: {
    FAILED:
      "Some of the input data is invalid. Please review the highlighted fields and try again.",
  },
  OTHER: {
    SERVER_ERROR:
      "An unexpected server error occurred. Please try again later.",
    INVALID_REQUEST:
      "The request is invalid. Please review your input and try again.",
  },
  MEMBERSHIP: {
    NOT_MEMBER: "Invalid membership request,make sure you have access to pipeline.",
    NOT_LOADED: "Membership not loaded. Use checkCompanyMembership middleware first.",
  },
  WORKSPACE: {
    NOT_MEMBER: "Operation failed, make sure you are member of this workspace.",
    NOT_LOADED: "Membership not loaded. Use checkCompanyMembership middleware first.",
  },
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSION: "You don't have access right to complete this operation."
  }
}

export default errorMessages

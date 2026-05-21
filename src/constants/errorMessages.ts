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
    EXIST: "The user with same email or username already exists.",
    UNAUTHORIZED: "Unauthorized access.",
    USER_RESOURCES_MISSING: "Invalid Request, Please try again later.",
    LOGIN_TIME_UPDATE_FAILED:
      "Failed to update login time. Please try again later.",
    EMAIL_REQUIRED:
      "Email is required. Please provide your correct email address.",
    FORGOT_PASSWORD_EMAIL_FAILED:
      "Failed to send password reset email. Please try again later.",
  },
  NAME: {
    REQUIRED: "Please provide your name. This field cannot be left empty.",
    INVALID:
      "The name entered contains invalid characters. Please use only alphabets.",
  },
  INVITE: {
    NOT_FOUND: "The specified invitation does not exist.",
    INVALID:
      "The invitation is invalid. Please check the details and try again.",
    EXPIRED: "The invitation has expired. Please request a new one.",
    ALREADY_USED: "This invitation has already been used.",
    CREATION_FAILED: "Failed to create the invitation. Please try again later.",
    REVOKE_FAILED: "Failed to revoke the invitation. Please try again later.",
    REVOKED: "The token has been revoked. Please request a new invitation.",
    MAX_USES_REACHED:
      "The maximum number of uses for this invitation has been reached.",
  },

  TOKEN: {
    NOT_FOUND: "Unauthorized, Missing Token",
    INVALID_TOKEN: "The token is invalid.",
    EXPIRED: "Unauthorized, Token has expired. Please login again.",
    TOKEN_USER_NOT_FOUND: "Unauthorized, user not found!",
    REFRESH_TOKEN_EXPIRED: "Refresh token has expired. Please login again.",
    INVALID_REFRESH_TOKEN: "Invalid refresh token. Please login again.",
    REFRESH_FAILED: "Refresh failed. Please login again.",
  },
  USERNAME: {
    CONFLICT:
      "The chosen username is already in use. Please select a different one.",
    REQUIRED: "Username is required. Please enter a valid username.",
    INVALID:
      "The username format is invalid. Ensure it meets the required criteria.",
  },
  VERIFY_TOKEN: {
    INVALID: "The verification token is invalid. Please try again.",
    EXPIRED: "The verification token has expired. Please request a new one.",
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
    NOT_MEMBER:
      "Invalid membership request,make sure you have access to pipeline.",
    NOT_LOADED:
      "Membership not loaded. Use checkCompanyMembership middleware first.",
  },
  WORKSPACE: {
    CREATE_FAILED: "Failed to create workspace. Please try again later.",
    UPDATE_FAILED: "Failed to update workspace. Please try again later.",
    NOT_FOUND: "The specified workspace does not exist.",
    ALREADY_EXISTS: "A workspace with the same name already exists.",
    NOT_MEMBER: "You are not a member of this workspace.",
  },
  WORkKSPACE_INVITATION: {
    INVALID: "The invitation link is invalid. Please check and try again.",
    EXPIRED: "The invitation link has expired. Please request a new one.",
    ALREADY_USED: "This invitation link has already been used.",
    NOT_FOUND: "Invitation not found. Please check the link and try again.",
  },
  WORKSPACE_MEMBERSHIP: {
    ALREADY_MEMBER: "You are already a member of this workspace.",
    NOT_MEMBER: "Operation failed, make sure you are member of this workspace.",
    NOT_LOADED:
      "Membership not loaded. Use checkCompanyMembership middleware first.",
  },
  PIPELINE: {
    NOT_FOUND: "The specified pipeline does not exist.",
    CREATE_FAILED: "Failed to create pipeline. Please try again later.",
  },
  PIPELINE_STAGE: {
    NOT_FOUND: "The specified pipeline stage does not exist.",
    CREATE_FAILED: "Failed to create pipeline stage. Please try again later.",
  },
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSION:
      "You don't have access right to complete this operation.",
  },
};

export default errorMessages;

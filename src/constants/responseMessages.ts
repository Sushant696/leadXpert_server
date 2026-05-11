const responseMessages = {
  USER: {
    CREATED: "User account has been created successfully.",
    LOGGED_IN: "You have logged in successfully. Welcome back!",
    LOGGED_OUT: "You have logged out successfully. See you next time!",
    UPDATED: "User details have been updated successfully.",
    DELETE_USER: "The user account has been deleted successfully.",
    RETRIEVED: "User data retrieved successfully.",
    DELETED: "The user has been deleted successfully.",
    REFRESH: "Your session has been refreshed successfully.",
  },
  UPLOAD: {
    CREATED: "The image has been created successfully.",
    DELETED: "The pipeline has been deleted successfully.",
  },
  MEMBER: {
    DELETED: "The member has been removed successfully.",
    ROLE_UPDATE: "The member's role has been updated successfully.",
  },
  MEMBERSHIP: {
    CREATED: "The membership relation has been created successfully.",
    DELETED: "The membership relation has been deleted successfully.",
    UPDATED: "The member role has been updated successfully.",
  },
  WORKSPACE: {
    CREATED: "The workspace has been created successfully.",
    UPDATED: "The workspace has been updated successfully.",
    DELETED: "The workspace has been deleted successfully.",
    RETRIEVED: "The workspace data has been retrieved successfully.",
    ALLRETRIEVED: "workspaces retrieved successfully.",
    MEMBERS_RETRIEVED: "The members of the workspace have been retrieved successfully.",
    INVITATION_LINK_GENERATED:
      "The invitation link has been generated successfully.",
    INVITATION_LINK_REVOKED:
      "The invitation link has been revoked successfully.",
    INVITATION_LINKS_RETRIEVED:
      "The invitation links have been retrieved successfully.",
    JOINED: "You have joined the workspace successfully.",
    EMAIL_INVITATION_SENT: "The email invitation has been sent successfully.",
  },
  PIPELINE: {
    CREATED: "The pipeline has been created successfully.",
    UPDATED: "The pipeline has been updated successfully.",
    DELETED: "The pipeline has been deleted successfully.",
    RETRIEVED: "The pipeline data has been retrieved successfully.",
  },
};

export default responseMessages;

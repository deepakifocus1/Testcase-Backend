const authController = {
  password: "Ifocus@123",
  requestBody: "Request body is required",
  userExist: "User with this email already exists",
  emailPassword: "Email and password are required",
};
const STATUS_MESSAGE = {
  SUCCESS: "success",
  FAILED: "failed",
};
const ERROR_MESSAGES = {
  SERVER_ERROR: "Internal server error",
  FAILED_PROJECT_CREATION: "Failed to create project in Jira",
  PROJECT_NOT_FOUND: "Project not found",
  TESTCASE_NOT_FOUND: "Testcase not found",
  TESTRUN_NOT_FOUND: "Test run not found",
  PLAN_NOT_FOUND: "Test plan not found",
  MODULE_NOT_FOUND: "Module not found",
  NO_USERS_FOUND: "No users found",
  INVALID_DATA: "Invalid Data",
  UPDATED_BY_REQUIRED: "Updated by is required",
  TESTCASE_DATA_REQUIRED: "Testcase data is  required",
  TESTPLAN_RUN_MODULE_ID:
    "Test plan ID, test run ID, and module ID are required",
  MODULE_PROJECTID_REQ: "Module name, project ID, and createdBy are required",
  NO_FILE_UPLOADED: "No  file Uploaded",
  VALID_ID_REQUIRED: "Valid id required",
  INVALID_ID: "Invalid Id found",
  EMAIL_EXIST: "Email is already in use by another user",
  USER_NOT_UPDATED: "User not found or updated",
  USER_NOT_DELETED: "User not found or  deleted",
  AUTH_TOKEN_REQUIRED: "Authentication token required",
  PERMISSION_DENIED: "You do not have permission to perform this action",
};
const SUCCESS_MESSAGES = {
  USER_CREATED: "User created Successfully",
  PROJECT_CREATED: "Project created Successfully",
  ISSUE_CREATED: "Issue created Successfully",
  ISSUE_FETCHED: "Issue fetched Successfully",
  PROJECT_DELETED: "Project  deleted Successfully",
  TESTCASE_DELETED: "Testcase deleted Successfully",
  TESTRUN_DELETED: "Test run deleted Successfully",
  TESTCASE_ADDED_PROJECT: "Testcase added to Project",
  TESTCASE_UPLOADED: "Testcase uploaded Successfully",
  USER_DELETED: "User deleted Successfully",
};

module.exports = {
  authController,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STATUS_MESSAGE,
};

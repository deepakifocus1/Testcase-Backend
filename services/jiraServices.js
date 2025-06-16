const axios = require("axios");
const { AppError } = require("../middleware/errorHandler");
require("dotenv").config();

const username = process.env.ATLASSIAN_USERNAME;
const password = process.env.ATLASSIAN_API_KEY;
const domain = process.env.DOMAIN;
const leadAccountID = process.env.LEAD_ACCT_ID;
const baseUrl = "https://" + domain + ".atlassian.net";

const auth = {
  username,
  password,
};

//CREATE PROJECT IN JIRA
async function createProject({ projectName, projKey }) {
  if (!username || !password || !domain || !leadAccountID) {
    throw new AppError("Missing required environment variables", 500);
  }

  try {
    const data = {
      key: projKey,
      name: projectName,
      projectTypeKey: "software",
      leadAccountId: leadAccountID,
    };

    const config = {
      headers: { "Content-Type": "application/json" },
      auth,
    };

    const response = await axios.post(
      `${baseUrl}/rest/api/3/project`,
      data,
      config
    );

    return response.data.key;
  } catch (error) {
    if (error.response) {
      throw new AppError(
        `Failed to create Jira project: ${JSON.stringify(
          error.response.data.errors
        )}`,
        error.response.status
      );
    } else if (error.request) {
      throw new AppError("No response received from Jira API", 504);
    } else {
      throw new AppError(`Error setting up request: ${error.message}`, 500);
    }
  }
}

//CREATE ISSUE IN JIRA
async function createIssue({ projectKey, issueType, description, summary }) {
  try {
    const data = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
      },
    };
    const config = {
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.post(
      `${baseUrl}/rest/api/2/issue`,
      data,
      config
    );
    return response.data.key;
  } catch (error) {
    if (error.response) {
      throw new AppError(
        `Failed to create Jira Issue: ${JSON.stringify(
          error.response.data.errors
        )}`,
        error.response.status
      );
    } else if (error.request) {
      throw new AppError("No response received from Jira API", 504);
    } else {
      throw new AppError(`Error setting up request: ${error.message}`, 500);
    }
  }
}

//GET ISSUES FROM JIRA
async function getIssues() {
  try {
    const config = {
      method: "get",
      url: baseUrl + "/rest/api/2/search",
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.request(config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new AppError(
        `Failed to Fetch Jira Issues: ${JSON.stringify(
          error.response.data.errorss
        )}`,
        error.response.status
      );
    } else if (error.request) {
      throw new AppError("No response received from Jira API", 504);
    } else {
      throw new AppError(`Error setting up request: ${error.message}`, 500);
    }
  }
}

//UPDATE ISSUE IN JIRA

module.exports = { createProject, createIssue, getIssues };

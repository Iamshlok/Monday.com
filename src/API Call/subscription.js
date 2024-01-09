import mondaySdk from "monday-sdk-js";

const monday = mondaySdk({ "clientId": process.env.REACT_APP_CLIENT_ID });
monday.setApiVersion("2023-10");
const getAccountPlan = async () => {
    try {
        const response = await monday.api(
            `query { account { plan { max_users period tier version } } }`
        );

        return response;
    } catch (e) {
        console.log(`Error Retrieving Plan: ${e} `);
    }
}

const getAppSubscription = async () => {
    try {
        const response = await monday.api(
           `query { app_subscription { billing_period days_left is_trial plan_id renewal_date } }`
        );

        return response;
    } catch (e) {
        console.log(`Error Retrieving Plan: ${e} `);
    }
}
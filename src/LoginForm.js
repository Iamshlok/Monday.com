// Your app details
const clientId = "d9f7723980443d9e6d6dc9d49836c1cc";
const redirectUri = "https://175e-2401-4900-1c32-5ab3-91c9-b723-8131-d6f3.ngrok-free.app/";
const clientSecret = "cf250cd44c9d904802289bc656eba713" ;
// Step 1: Redirect the user to Monday.com for authorization
const authorizeUrl = `https://auth.monday.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
window.location.href = authorizeUrl;

// Step 2: After user grants permission, Monday.com will redirect back to your specified redirect URI with an authorization code

// Step 3: Exchange the authorization code for an access token
// Extract the authorization code from the URL
const urlParams = new URLSearchParams(window.location.search);
const authorizationCode = urlParams.get("code");

// Make a request to exchange the authorization code for an access token
// ... (previous code remains unchanged)

// Make a request to exchange the authorization code for an access token
fetch("https://auth.monday.com/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Handle the response data
    const accessToken = data.access_token;
    console.log("Access Token:", accessToken);

    // Use the access token to make API requests, like getting the current user's information
    const mondayAPIEndpoint = "https://api.monday.com/v2";
    return fetch(`${mondayAPIEndpoint}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((userData) => {
    // Handle the user data
    console.log("Current User Information:", userData);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

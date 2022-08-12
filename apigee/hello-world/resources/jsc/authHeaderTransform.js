try {
    // If auth header exists and starts with BearerToken
    var authHeader = context.getVariable("request.header.Authorization");
    if (authHeader && authHeader.startsWith("BearerToken ")) {
        // Split the string and get the token
        // If check just to be cautious
        var token = authHeader.split(' ')[1];
        if (token) {
            // Define new Authorization header with Bearer prefix
            var newAuthHeader = "Bearer "+token;
            context.setVariable("request.header.Authorization", newAuthHeader);
        }
    }
} catch (err) {
    // Do nothing
}
# EM-Public Backend Interface

The APIs provided by this application take the form of HTTP REST-style resource endpoints which accept JSON payloads.

The standard input is a JSON object representing the object to be created/updated/deleted/acted upon.

The resource (http://host....com[/resource/path]?query) represents the operation to be performed.  This is not truly REST compliant, and may improve over time.

## Returning results from an operation:

The standard result takes the following form:

    {
        result: [object]
    }

or 

    {}

## Error reporting:

An error takes the following form:

    {
        error: {}
    }

or

    {
        error: {
            code: [errorCodeString],
            message: [error message string]
        }
    }

# API Endpoints

## User operations

### User Login

Input format:

    {
        email: "user@host.com",
        password: "unhashed password"
            OR
        token: "password reset token" (single use)
    }

Success Output:

    {
        email: "user@host.com",
        firstname: "Frist",
        lastname: "Last",
        auth: "auth token for future use",
        tocVersion: "version number"
        watchZones: [...]
    }

Errors:

    notFound - unable to find a user with this password
    wrongPassword - password provided does not match
    wrongToken - token provided does not match hash on file

### User Create

Resource endpoint:

    /user

Input format:

    {
        email: "user@host.com",
        firstname: "First",
        lastname: "Last",
        password: "unhashed password"
        tocVersion: "version number"
    }

Success Output:

    {
        email: "user@host.com",
        auth: "authorisation code for future use"
    }

Errors:

    emailExists - Email address already registered
    passwordComplexity - Password does not meet complexity rules

### User Update

Updates the email address and/or password of a user.  User must prove they are authenticated, either by reauthing with email/password or by providing email/auth code from previous login.

Resource endpoint:

    /user/update

Input format:

    {
        email: "user@host.com",
        password: "unhashed password"
            or
        auth: "authentication code from login"

        newPassword: "unhashed password" [optional]
        newEmail: "unhashed password" [optional]
        newWatchZones: [] [optional]
        newFirstname: "first name" [optional]
        newLastname: "last name" [optional]
        newTocVersion: "version number"
    }

Output format:

    {
        email: "user@host.com",
    }

Errors:

    notFound - Email address not found
    wrongPassword - Password does not match hash on file
    wrongAuth - Auth key provided does not match hash on file
    passwordComplexity - Password does not meet complexity rules
    emailExists - The newEmail is being used by another account(query base on  email/emailChangingTo)

### User Verify

Verifies a users' email address by presenting a verificationCode that was previously emailed to the user.  Sets the user's email address to the emailToVerify value and clears the verification attributes.

Resource endpoint:

    /user/verify

Input Format:

    {
        email: "user@host.com",
        code: "verification code"
    }

Output Format:

    {
        email: "user@host.com",
        code: "verification code"
    }

Errors:

    notFound - Email address not found
    invalidCode - Code does not match one on file

### User Password Reset

Creates a token for the user to use to authenticate and reset their password.  This can be exchanged for an auth token by login.  Emails the token to the user.

Resource endpoint:

    /user/pwreset

Input Format:

    {
        email: "user@host.com"
    }

Output Format:

    {
        email: "user@host.com"
    }

Errors:

    notFound - Email address not found

### User Deletion

Deletes a user account.

Resource endpoint:

    /user/delete

Input format:

    email: "user@host.com",
    auth: "authentication code from login"

Output format:

    {}

Errors:

    notFound - Email address not found
    wrongAuth - Auth key provided does not match hash on file

# API Data Model

The data model used by the application is described below:

## User

User model:

    {
        userid: string - unique id for the user account
        password: string - current base64 hash of password
        firstname: string - user's first name (optional)
        lastname: string - user's last name (optional)
        tocVersion: string - last terms and conditions accepted by the user (required)
        email: string - current active validated email address for the user account (optional - present only if verified)
        emailChangingTo: string - email address that is currently being validated (optional - present only if being verified)
        emailValidationCode: string - code used to validate new email address (optional - present only if email is being verified)
        pwresetValidationCode: string - code used to reset password (optional - present only if pwreset requested)
        watchZones: [
            {
                name: string - name of the watch zone
                radius: number - radius in metres of the watch zone
                latitude: number - latitude of the watch zone
                longitude: number - longitude of the watch zone	,
                enableNotification: boolean, allow recieve notification for this watch zone.
            }
        ]
    }

User states:

1. User does not exist in database
2. User registered, not validated
3. User has registered and validated
4. User has changed their email address, not validated new address
5. User has reset their password, must change password

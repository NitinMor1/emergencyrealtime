# Documentation of routes for devs

# auth Routes

### url : /api/auth/login

method : **POST**

requestBody : {
"passkey" <_string_> :"27CD64"
}

RESPONSE <br><br>
STATUS : 404 <br>
Response Body :

```json
{ "error": "Invalid Passkey" }
```

STATUS : 200<BR>
Response Body :

```yaml
{
  "user": {
        "hospitalId": "hos_1A3D31",
        "role": "pharma",
        "empId": "66a75196ddfd565bdc25c69b",
        "expiresAt": "2025-07-29T08:26:18.266Z",
        "beds": 10,
        "wards":["ward_1", "ward_2"],
        "ambulance": ["amb_1", "amb_2"],
        "emergency": ["em_1", "em_2"],
        "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJob3NwaXRhbElkIjoiaG9zXzFBM0QzMSIsInBhc3NrZXkiOiI4RUU5NkYiLCJpYXQiOjE3MjIyNDk4MDZ9.DVBf2iwa-vB2OdwvNZtpQx2UJhpwp8yOwIlkD2GqUxk"
    }
}
```

STATUS : 500 <br>
Response Body :

```json
{ "error": "Internal Server Error" }
```


### url : /api/passkey/createPasskey? empId = {mongo Object Id} & role = nurse & hospitalId = hos_1A3D31

method : **POST**

requestBody : 
{
  empty
}

RESPONSE <br><br>
STATUS : 404 <br>
Response Body :

```json
{ "error": "Invalid Passkey" }
```

STATUS : 200<BR>

Response Body :

```yaml
{
    "success": true,
    "message": "Passkey created successfully"
}
```

STATUS : 500 <br>
Response Body :

```json
{ "error": "Internal Server Error" }
```

### url : /api/auth/superUser

method : **POST**

requestBody : {
"passkey" <_string_> :"27CD64"
}

RESPONSE <br><br>
STATUS : 404 <br>
Response Body :

```json
{ "error": "Invalid Passkey" }
```

STATUS : 200<BR>

Response Body :

```yaml
{
   "user": {
        "hospitalId": "hos_1A3D31",
        "name": "Medoc_Hospital",
        "phoneNumber": "",
        "email": "",
        "address": "",
        "listOfDoctors": [],
        "ambulance": [],
        "emergency": [],
        "labs": [],
        "paraMedic": [],
        "beds": 0,
        "wards": [],
        "depts": [],
        "passkeys": [
            {
                "role": "hr",
                "empId": "66a7517fddfd565bdc25c69a",
                "expiresAt": "2025-07-29T08:25:48.885Z",
                "key": "71A4CA"
            },
            {
                "role": "pharma",
                "empId": "66a75196ddfd565bdc25c69b",
                "expiresAt": "2025-07-29T08:26:18.266Z",
                "key": "8EE96F"
            },
            {
                "role": "paramedics",
                "empId": "66a751a1ddfd565bdc25c69c",
                "expiresAt": "2025-07-29T08:26:39.420Z",
                "key": "17A180"
            },
            {
                "role": "nurse",
                "empId": "66a751a8ddfd565bdc25c69d",
                "expiresAt": "2025-07-29T08:26:55.637Z",
                "key": "BF4FF5"
            }
        ],
        "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJob3NwaXRhbElkIjoiaG9zXzFBM0QzMSIsInBhc3NrZXkiOiIiLCJpYXQiOjE3MjIyNTAyMTZ9.k3zqCOEcrIESX3AUfFrRTH-5ero91p6-9R4GGlS7ASU"
    }
}
```
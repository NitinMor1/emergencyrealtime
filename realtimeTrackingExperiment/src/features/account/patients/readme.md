### Documentation of routes for devs


### Payload
```json
{
    "hospitalId": "hos_7BA7CF",
    "username": "john123",
    "email": "john123@gmail.com",
    "name": "John Doe",
    "password": "john123",
    "age": 45,
    "weight": "70",
    "height": "5.8",
    "bloodGroup": "A+",
    "phoneNumber": "1234567890",
    "dob":"1990-01-01",
    "gender":"male",
    "family": [
        {
            "id": "pat_123",
            "relation": "parent"
        }
    ],
    "vitals": [
        {
            "bodyTemperature": "98.6",
            "pulseRate": "72",
            "respirationRate": "15",
            "bloodPressure": "120/80"
        }
    ],
    "profileUrl": "https://www.google.com"
}
```





# Patient Routes

### url: /api/patient/getPatients?hospitalId=hos_7BA7CF&patientInfo={"username":"John Doe","phoneNumber":"1234567890","email":"abc@gmail.com"}

method: **GET**
```yaml
requestBody: <*query*> 
{
  {
    hospitalId: <*string*>"hos_7BA7CF",
    patientInfo: <*object*>{"username":"John Doe","phoneNumber":"1234567890","email":"abc@gmail"}
  }
}
```
RESPONSE: <br><br>
STATUS:200<br>

```yaml
{
  success: true,
  message: "Patients fetched successfully.",
  patients: [
  {
    hospitalId: <*string*>"hos_7BA7CF",
    username: <*string*>"johnDoe",
    email: <*string*>"JohnDoe@gmail.com",
    name: <*string*>"john",
    password: <*string*>"password",
    age: <*number*>"30",
    weight: <*string*>"70",
    height: <*string*>"5.8",
    bloodGroup: <*string*>"A+",
    phoneNumber: <*string*>"1234567890",
    dob: <*string*>"1990-01-01",
    gender: <*string*>"male",
    family: <*array*> <*Ifamily*>[
        {
            id: <*string*>"johnDoe",
            relation: <*string*>"parent"
        }
    ],
    "vitals": <*array*>[
        {
            "bodyTemperature": <*string*>"98.6",
            "pulseRate": <*string*>"72",
            "respirationRate": <*string*>"15",
            "bloodPressure": <*string*>"120/80"
        }
    ],
    "profileUrl": <*string*>"https://www.google.com"
}
  ]
  }
``` 

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{
  success: true,
  message: "Patients not found."
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{
    success: false,
    message: "Internal server error."
}
```


### url: /api/patient/addPatients

method: **POST**
```yaml
requestBody: {
    {
    hospitalId: <*string*>"hos_7BA7CF",
    username: <*string*>"johnDoe",
    email: <*string*>"JohnDoe@gmail.com",
    name: <*string*>"john",
    password: <*string*>"password",
    age: <*number*>"30",
    weight: <*string*>"70",
    height: <*string*>"5.8",
    bloodGroup: <*string*>"A+",
    phoneNumber: <*string*>"1234567890",
    dob: <*string*>"1990-01-01",
    gender: <*string*>"male",
    family: <*array*> <*Ifamily*>[
        {
            id: <*string*>"johnDoe",
            relation: <*string*>"parent"
        }
    ],
    "vitals": <*array*>[
        {
            "bodyTemperature": <*string*>"98.6",
            "pulseRate": <*string*>"72",
            "respirationRate": <*string*>"15",
            "bloodPressure": <*string*>"120/80"
        }
    ],
    "profileUrl": <*string*>"https://www.google.com"
}
}
```


RESPONSE: <br><br>
STATUS: 200<br>

```yaml
{
  success: true,
  message: "Patient added successfully."
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{
  success: false,
  message: "Internal server error."
}
```


### url: /api/patient/updatePatient?hospitalId=hos_7BA7CF&username={username field}

method: **POST**

```yaml
requestBody: <*body*> 
{
  {
    hospitalId: <*string*>"hos_7BA7CF",
    username: <*string*>"johnDoe",
    email: <*string*>"JohnDoe@gmail.com",
    name: <*string*>"john",
    password: <*string*>"password",
    age: <*number*>"30",
    weight: <*string*>"70",
    height: <*string*>"5.8",
    bloodGroup: <*string*>"A+",
    phoneNumber: <*string*>"1234567890",
    dob: <*string*>"1990-01-01",
    gender: <*string*>"male",
    family: <*array*> <*Ifamily*>[
        {
            id: <*string*>"johnDoe",
            relation: <*string*>"parent"
        }
    ],
    "vitals": <*array*>[
        {
            "bodyTemperature": <*string*>"98.6",
            "pulseRate": <*string*>"72",
            "respirationRate": <*string*>"15",
            "bloodPressure": <*string*>"120/80"
        }
    ],
    "profileUrl": <*string*>"https://www.google.com"
}
}
```
RESPONSE: <br><br>
STATUS: 201<br>

```yaml
{
  success: true,
  message: "Patient updated successfully."
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{
  success: false,
  message: "Patient not found."
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{
  success: false,
  message: "Internal server error."
}
```

### url: /api/patient/getAllPatients?hospitalId=hos_7BA7CF

method: **GET**
```yaml
requestBody: <*query*> 
{
  {
    hospitalId: <*string*>"hos_7BA7CF"
  }
}
```

RESPONSE: <br><br>

STATUS: 200<br>

```yaml
{
  success: true,
  message: "Patients fetched successfully.",
  patients: [
  {
    hospitalId: <*string*>"hos_7BA7CF",
    username: <*string*>"johnDoe",
    email: <*string*>"JohnDoe@gmail.com",
    name: <*string*>"john",
    password: <*string*>"password",
    age: <*number*>"30",
    weight: <*string*>"70",
    height: <*string*>"5.8",
    bloodGroup: <*string*>"A+",
    phoneNumber: <*string*>"1234567890",
    dob: <*string*>"1990-01-01",
    gender: <*string*>"male",
    family: <*array*> <*Ifamily*>[
        {
            id: <*string*>"johnDoe",
            relation: <*string*>"parent"
        }
    ],
    "vitals": <*array*>[
        {
            "bodyTemperature": <*string*>"98.6",
            "pulseRate": <*string*>"72",
            "respirationRate": <*string*>"15",
            "bloodPressure": <*string*>"120/80"
        }
    ],
    "profileUrl": <*string*>"https://www.google.com"
}
  ]
}
```


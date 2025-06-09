# Documentation of routes for devs

# ipd Payload
```json
{
"hospitalId":"hos_7BA7CF",
"id":"ipd_67DB86",
"patient":{
    "username":"johndoe@123",
    "name":"John Doe"
},
"admissionDate":"2022-12-12",
"dischargeDate":"2022-12-15",
"bed":{
    "id":"bed_12",
    "number":101
},
"room":{
    "id":"room_1",
    "number":101
},
"isbedOccupied":true,
"diagnosis":"Fever",
"medications":["Paracetamol","Ibuprofen"],
"procedures":["Blood test","X-ray"],
"diet":"No sugar",
"allergies":["Penicillin"],
"visitHistory":["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
    "id":"isur_27CD64",
    "provider":"XYZ Insurance"
},
"attendingPhysician":{
    "id":"doc_44186",
    "name":"Dr. Smith"
},
"nurse":{
    "id":"nur_69CD69",
    "name":"Nurse Jane"
},
"familyContact":{
    "name":"Jane Doe",
    "relation":"Spouse",
    "phoneNumber":"1234567890"
},
"notes":"Patient requires extra care."
}
```


# IPD Routes

### url: /api/ipd/addPatients

method: **POST**
```yaml
requestBody : {
"hospitalId": <*string*>"hos_7BA7CF",
"id":<*string*>ipd*67DB86,
"patient":<*object*>{
"username":<*number*>johndoe@123,
"name":<*string*>"John Doe"
},
"admissionDate":<*string*> | <*Date*>"2022-12-12",
"dischargeDate":<*string*> | <*Date*>"2022-12-15",
"bed":{
"id":<*string*>bed*12,
"number":<*number*>101
},
"room":{
"id":<*string*>room_1,
"number":<*number*>"101"
},
"isbedOccupied":<*boolean*>true,
"diagnosis":<*string*>"Fever",
"medications":<*string[]*>["Paracetamol","Ibuprofen"],
"procedures":<*string[]*>["Bloodtest","X-ray"],
"diet":<*string*>"No sugar",
"allergies":<*string[]*>["Penicillin"],
"visitHistory":<*date[]*>["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
"id":<*number*>isur_27CD64,
"provider":<*string*>"XYZ Insurance"
},
"attendingPhysician":{
"id":<*number*>doc_44186,
"name":<*string*>"Dr. Smith"
},
"nurse":{
"id":<*number*>nur_69CD69,
"name":<*string*>"Nurse Jane"
},
"familyContact":{
"name":<*string*>"Jane Doe",
"relation":<*string*>"Spouse",
"phoneNumber":<*string*>"1234567890"
},
"notes":<*string*>"Patient requires extra care."
}
```
RESPONSE: <br><br>
STATUS: 400<br>

```yaml
{ "success": "true", "message": "All field are required" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in adding the patient" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response Body:
  {
"hospitalId":"hos_7BA7CF",
"id":"ipd_67DB86",
"patient":{
    "username":"johndoe@123",
    "name":"John Doe"
},
"admissionDate":"2022-12-12",
"dischargeDate":"2022-12-15",
"bed":{
    "id":"bed_12",
    "number":101
},
"room":{
    "id":"room_1",
    "number":101
},
"isbedOccupied":true,
"diagnosis":"Fever",
"medications":["Paracetamol","Ibuprofen"],
"procedures":["Blood test","X-ray"],
"diet":"No sugar",
"allergies":["Penicillin"],
"visitHistory":["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
    "id":"isur_27CD64",
    "provider":"XYZ Insurance"
},
"attendingPhysician":{
    "id":"doc_44186",
    "name":"Dr. Smith"
},
"nurse":{
    "id":"nur_69CD69",
    "name":"Nurse Jane"
},
"familyContact":{
    "name":"Jane Doe",
    "relation":"Spouse",
    "phoneNumber":"1234567890"
},
"notes":"Patient requires extra care."
}
```

### url: /api/ipd/getPatients?hospitalId=hos_7BA7CF

method: **GET**

requestBody: {
NULL
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "success": "true", "message": "No Patient found" }
```

Response: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in fetching the patient" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
Response Body:
  {
"hospitalId":"hos_7BA7CF",
"id":"ipd_67DB86",
"patient":{
    "username":"johndoe@123",
    "name":"John Doe"
},
"admissionDate":"2022-12-12",
"dischargeDate":"2022-12-15",
"bed":{
    "id":"bed_12",
    "number":101
},
"room":{
    "id":"room_1",
    "number":101
},
"isbedOccupied":true,
"diagnosis":"Fever",
"medications":["Paracetamol","Ibuprofen"],
"procedures":["Blood test","X-ray"],
"diet":"No sugar",
"allergies":["Penicillin"],
"visitHistory":["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
    "id":"isur_27CD64",
    "provider":"XYZ Insurance"
},
"attendingPhysician":{
    "id":"doc_44186",
    "name":"Dr. Smith"
},
"nurse":{
    "id":"nur_69CD69",
    "name":"Nurse Jane"
},
"familyContact":{
    "name":"Jane Doe",
    "relation":"Spouse",
    "phoneNumber":"1234567890"
},
"notes":"Patient requires extra care."
}
```

### url: /api/ipd/updatePatient?hos_7BA7CF&id={id}
```yaml
requestBody : {
"hospitalId": <*string*>"hos_7BA7CF",
"id":<*string*>ipd*67DB86,
"patient":<*object*>{
"username":<*number*>johndoe@123,
"name":<*string*>"John Doe"
},
"admissionDate":<*string*> | <*Date*>"2022-12-12",
"dischargeDate":<*string*> | <*Date*>"2022-12-15",
"bed":{
"id":<*string*>bed*12,
"number":<*number*>101
},
"room":{
"id":<*string*>room_1,
"number":<*number*>"101"
},
"isbedOccupied":<*boolean*>true,
"diagnosis":<*string*>"Fever",
"medications":<*string[]*>["Paracetamol","Ibuprofen"],
"procedures":<*string[]*>["Bloodtest","X-ray"],
"diet":<*string*>"No sugar",
"allergies":<*string[]*>["Penicillin"],
"visitHistory":<*date[]*>["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
"id":<*number*>isur_27CD64,
"provider":<*string*>"XYZ Insurance"
},
"attendingPhysician":{
"id":<*number*>doc_44186,
"name":<*string*>"Dr. Smith"
},
"nurse":{
"id":<*number*>nur_69CD69,
"name":<*string*>"Nurse Jane"
},
"familyContact":{
"name":<*string*>"Jane Doe",
"relation":<*string*>"Spouse",
"phoneNumber":<*string*>"1234567890"
},
"notes":<*string*>"Patient requires extra care."
}
```
RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "message": "No Patient found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in updating patient" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
Response Body: {
"hospitalId":"hos_7BA7CF",
"id":"ipd_67DB86",
"patient":{
    "username":"johndoe@123",
    "name":"John Doe"
},
"admissionDate":"2022-12-12",
"dischargeDate":"2022-12-15",
"bed":{
    "id":"bed_12",
    "number":101
},
"room":{
    "id":"room_1",
    "number":101
},
"isbedOccupied":true,
"diagnosis":"Fever",
"medications":["Paracetamol","Ibuprofen"],
"procedures":["Blood test","X-ray"],
"diet":"No sugar",
"allergies":["Penicillin"],
"visitHistory":["2022-12-12T10:00:00","2022-12-13T11:00:00"],
"insurance":{
    "id":"isur_27CD64",
    "provider":"XYZ Insurance"
},
"attendingPhysician":{
    "id":"doc_44186",
    "name":"Dr. Smith"
},
"nurse":{
    "id":"nur_69CD69",
    "name":"Nurse Jane"
},
"familyContact":{
    "name":"Jane Doe",
    "relation":"Spouse",
    "phoneNumber":"1234567890"
},
"notes":"Patient requires extra care."
}
```

### url: /api/ipd/deletePatient?hospitalId=hos_7BA7CF&id={id}

requestBody: {
NULL;
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "success": "true", "message": "No Patient found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in deleting the patient" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
Response Body: { "message": "Patient deleted successfully" }
```


### url: /api/ipd/addVitals?hospitalId=hos_7BA7CF&username=JohnDoe@medoc

method: **POST**

```yaml
requestBody:
  {
    bodyTemperature: <*number*>98.6,
    pulseRate: <*number*>72,
    bloodPressure: <*number*>120/80,
    respiratoryRate: <*number*>16,
  }
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
{ "success": "true", "message": "All field are required" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in adding the vitals" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
Response Body:
  {
    bodyTemperature: <*number*>98.6,
    pulseRate: <*number*>72,
    bloodPressure: <*number*>120/80,
    respiratoryRate: <*number*>16,
  }
```

## Add Drug Order Sheet

### url: /api/ipd/addDrugOrderSheet?hospitalId=hos_7BA7CF&username=JohnDoe@medoc

### Method

**POST**

### Query Parameters

- `hospitalId`: (Required) The unique identifier of the hospital where the patient is being treated.
- `username`: (Required) The username of the patient for whom the drug order sheet is being added.

### Request Body

- `date`: (Required) The date when the drug was ordered.
- `time`: (Required) The time when the drug was ordered.
- `drugName`: (Optional) The name of the drug.
- `dosage`: (Optional) The dosage of the drug.
- `Route`: (Optional) The route of administration for the drug.
- `frequency`: (Optional) The frequency of administration for the drug.
- `nurse`: (Required) The nurse responsible for the drug order.
- `witness`: (Required) The witness for the drug order.
- `pharmacist`: (Required) The pharmacist responsible for the drug order.
- `doctor`: (Required) The doctor who prescribed the drug.

### Responses

**STATUS: 201**

```yaml
{
  "success": true,
  "message": "Drug Order Sheet added successfully",
  "data":
    {
      {
        "success": true,
        "message": "Drug Order Sheet added successfully",
        "data":
          {
            "username": "JohnDoe@medoc",
            "listOfHospitals": ["hos_7BA7CF"],
            "dos":
              [
                {
                  "date": "2024-08-21",
                  "time": "14:00",
                  "drugName": "Aspirin",
                  "dosage": "500 mg",
                  "Route": "Oral",
                  "frequency": "Daily",
                  "nurse": { "id": "nurse123", "name": "Nurse Amy" },
                  "witness": { "id": "witness456", "name": "Witness John" },
                  "pharmacist":
                    { "id": "pharmacist789", "name": "Pharmacist Eve" },
                  "doctor": { "id": "doctor101", "name": "Dr. Smith" },
                },
              ],
          },
      },
    },
}
```

- The message indicates that the drug order sheet has been added successfully.

**STATUS: 400**

```yaml
{ "success": false, "message": "Please provide all the required fields" }
```

- This indicates that one or more required fields are missing from the request.

**STATUS: 404**

```yaml
{ "success": false, "message": "Patient not found" }
```

- This indicates that the patient was not found in the database.

**STATUS: 500**

```yaml
{ "success": false, "message": "Internal Server Error" }
```

- This indicates that an error occurred while processing the request.

### Notes

- The `addDrugOrderSheet` endpoint adds a new drug order sheet to the patient's record in the specified hospital. It records the details of the drug prescribed, including the nurse, witness, pharmacist, and doctor involved.

---

## Add Drug Infusion Sheet

### url: /api/ipd/addDrugInfusionSheet?hospitalId=hos_7BA7CF&username=JohnDoe@medoc

### Method

**POST**

### Query Parameters

- `hospitalId`: (Required) The unique identifier of the hospital where the patient is being treated.
- `username`: (Required) The username of the patient for whom the drug infusion sheet is being added.

### Request Body

- `date`: (Required) The date when the drug infusion was started.
- `time`: (Required) The time when the drug infusion was started.
- `drugName`: (Optional) The name of the drug being infused.
- `dosage`: (Optional) The dosage of the drug being infused.
- `diluent`: (Optional) The diluent used in the infusion.
- `diluentVolume`: (Optional) The volume of the diluent used.
- `infusionRate`: (Optional) The rate of infusion.
- `route`: (Optional) The route of administration for the infusion.
- `frequency`: (Optional) The frequency of the infusion.
- `goal`: (Optional) The goal of the infusion.
- `nurse`: (Required) The nurse responsible for the drug infusion.
- `witness`: (Required) The witness for the drug infusion.
- `pharmacist`: (Required) The pharmacist responsible for the drug infusion.

### Responses

**STATUS: 201**

```yaml
{
  "success": true,
  "message": "Drug Infusion Sheet added successfully",
  "data":
    {
      {
        "success": true,
        "message": "Drug Infusion Sheet added successfully",
        "data":
          {
            "username": "JohnDoe@medoc",
            "listOfHospitals": ["hos_7BA7CF"],
            "DIO":
              [
                {
                  "date": "2024-08-21",
                  "time": "15:00",
                  "drugName": "Saline",
                  "dosage": "1 L",
                  "diluent": "None",
                  "diluentVolume": "0",
                  "infusionRate": "100 ml/h",
                  "route": "IV",
                  "frequency": "Once",
                  "goal": "Hydration",
                  "nurse": { "id": "nurse123", "name": "Nurse Amy" },
                  "witness": { "id": "witness456", "name": "Witness John" },
                  "pharmacist":
                    { "id": "pharmacist789", "name": "Pharmacist Eve" },
                },
              ],
          },
      },
    },
}
```

- The message indicates that the drug infusion sheet has been added successfully.

**STATUS: 400**

```yaml
{ "success": false, "message": "Please provide all the required fields" }
```

- This indicates that one or more required fields are missing from the request.

**STATUS: 404**

```yaml
{ "success": false, "message": "Patient not found" }
```

- This indicates that the patient was not found in the database.

**STATUS: 500**

```yaml
{ "success": false, "message": "Internal Server Error" }
```

- This indicates that an error occurred while processing the request.

### Notes

- The `addDrugInfusionSheet` endpoint adds a new drug infusion sheet to the patient's record in the specified hospital. It records the details of the drug being infused, including the nurse, witness, and pharmacist involved.
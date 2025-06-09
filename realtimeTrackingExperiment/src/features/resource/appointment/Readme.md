# Documentation of routes for devs

# Payload

```json
{
  "hospitalId": "hos_7BA7CF",
  "title": "Appointment",
  "time": "2021-10-10",
  "location": "location",
  "type": "Appointment",
  "patientUsername": "pat_12BA23",
  "doctorUsername": "doc_45CD59",
  "eventData": {
    "date": "2021-10-10",
    "timeSlot": "1000-1200",
    "problem": "fever",
    "appointment_number": 1001,
    "priority": 1,
    "medocCardUrl": "url"
  }
}
```

# Appointment Routes

### url: /api/appointment/addAppointments

method: **POST**

```yaml
requesBody:
{
    {
    "hospitalId":<*string*> "hos_7BA7CF",
    "title": <*string*> "appointment",
    "time": <*string*>| <*Date*> "2021-10-10T10:00:00",
    "location": <*string*> "hospital",
    "type": <_EventType_> "Appointment",
    "patientUsername": <*string*> "pat_12BA23",
    "doctorUsername": <*string*> "doc_45CD59",
    "eventData":<*IAppointmentData*> {
          "date": <*string*> | <*Date*>"2021-10-10",
          "timeSlot": <*string*> "0800-1000",
          "problem": <*string*> "fever",
          "appointment_number": <*number*> 1,
          "priority": <*number*> 1,
          "medocCardUrl": <*string*> "url"
    }
  }
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body: { { "success": "true", "message": "All field are required" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in scheduling the appointment" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    "success": "true",
    "message": "Appointment created successfully",
    "data":
      {
        "hospitalId": "hos_7BA7CF",
        "title": "Appointment",
        "time": "2021-10-10",
        "location": "location",
        "type": "Appointment",
        "patientUsername": "pat_12BA23",
        "doctorUsername": "doc_45CD59",
        "eventData":
          {
            "date": "2021-10-10",
            "timeSlot": "1000-1200",
            "problem": "fever",
            "appointment_number": 1001,
            "priority": 1,
            "medocCardUrl": "url",
          },
      },
  }
```

### url: /api/appointment/fetchAppointment?hospitalId=hos_7BA7CF&doctorUsername=doc_441886&timeSlot=0800-1000&date=2022-12-10

method: **GET**

```yaml
requestBody: {
<*query*> hospitalId=hos_7BA7CF&doctorUsername=doc_441886&timeSlot=0800-1000&date=2022-12-10
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Appointment found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in fetching the appointment" } }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response body:
  {
    {
      "hospitalId": "hos_7BA7CF",
      "title": "Appointment",
      "time": "2021-10-10",
      "location": "location",
      "type": "Appointment",
      "patientUsername": "pat_12BA23",
      "doctorUsername": "doc_45CD59",
      "eventData":
        {
          "date": "2021-10-10",
          "timeSlot": "1000-1200",
          "problem": "fever",
          "appointment_number": 1001,
          "priority": 1,
          "medocCardUrl": "url",
        },
    },
  }
```

### url: /api/fetchAllAppointment?hospitalId=hos_7BA7CF

method: **GET**

```yaml
requestBody: {
<*query*> hospitalId=hos_7BA7CF
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Appointment found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in fetching the appointment" } }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response body:
  {
    {
      "hospitalId": "hos_7BA7CF",
      "title": "Appointment",
      "time": "2021-10-10",
      "location": "location",
      "type": "Appointment",
      "patientUsername": "pat_12BA23",
      "doctorUsername": "doc_45CD59",
      "eventData":
        {
          "date": "2021-10-10",
          "timeSlot": "1000-1200",
          "problem": "fever",
          "appointment_number": 1001,
          "priority": 1,
          "medocCardUrl": "url",
        },
    },
  }
```

### url: /api/appointment/updateAppointment?hospitalId=hos_7BA7CF&id={id}

method: **POST**

```yaml
requestBody: {
    {
    "hospitalId":<*string*> "hos_7BA7CF",
    "title": <*string*> "appointment",
    "time": <*string*>| <*Date*> "2021-10-10T10:00:00",
    "location": <*string*> "hospital",
    "type": <_EventType_> "Appointment",
    "patientUsername": <*string*> "pat_12BA23",
    "doctorUsername": <*string*> "doc_45CD59",
    "eventData":<*IAppointmentData*> {
    "date": <*string*> | <*Date*>"2021-10-10",
    "timeSlot": <*string*> "0800-1000",
    "problem": <*string*> "fever",
    "appointment_number": <*number*> 1,
    "priority": <*number*> 1,
    "medocCardUrl": <*string*> "url"
    }
  }
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Appointments found" } }
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "All fields are required" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in updating the appointment" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    [
      {
        "hospitalId": "hos_7BA7CF",
        "title": "appointment",
        "time": "2021-10-10T10:00:00",
        "location": "hospital",
        "type": "Appointment",
        "PatientUsername": "pat_12BA23",
        "doctorUsername": "doc_45CD59",
        "eventData":
          {
            "date": "2021-10-10",
            "timeSlot": "0800-1000",
            "problem": "fever",
            "appointment_number": 1,
            "priority": 1,
            "medocCardUrl": "url",
          },
      },
    ],
  }
```

### url: /api/appointment/deleteAppointment?hospitalId=hos_7BA7CF&id={id}

method: **POST**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Appointment found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in deleting the appointment" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    [
      {
        "hospitalId": "hos_7BA7CF",
        "title": "appointment",
        "time": "2021-10-10T10:00:00",
        "location": "hospital",
        "type": "Appointment",
        "PatientUsername": "pat_12BA23",
        "doctorUsername": "doc_45CD59",
        "eventData":
          {
            "date": "2021-10-10",
            "timeSlot": "0800-1000",
            "problem": "fever",
            "appointment_number": 1,
            "priority": 1,
            "medocCardUrl": "url",
          },
      },
    ],
  }
```

# LabScan Routes

# payload

```json
{
  "hospitalId": "hos_7BA7CF",
  "patientUsername": "pat_12BA23",
  "patientName": "John Doe",
  "date": "2021-10-10",
  "hospitalName": "Hospital",
  "DOB": "1990-10-10",
  "type": "Lab Scan",
  "prescipDoctor": "doc_45CD59",
  "performingDoc": "doc_45CD59",
  "note": "note",
  "contents": [
    {
      "test_name": "test1",
      "result_value": "value1",
      "unit": "unit1",
      "ref_range": "range1"
    },
    {
      "test_name": "test2",
      "result_value": "value2",
      "unit": "unit2",
      "ref_range": "range2"
    }
  ],
  "file_path": "path",
  "uploaded_by": "doc_45CD59",
  "uploaded_At": "2021-10-10",
  "downloaded_by": ["doc_45CD59"],
  "downloaded_at": ["2021-10-10"],
  "createdAt": "2021-10-10",
  "updatedAt": "2021-10-10",
  "department": "department"
}
```

### url: /api/appointment/addScan

method: **POST**

```yaml
requesBody: {
{
"hospitalId":<*string*> "hos_7BA7CF
"patientUsername": <*string*> "pat_12BA23",
"patientName": <*string*> "John Doe",
"date": <*string*> "2021-10-10",
"hospitalName": <*string*> "Apollo Hospital",
"DOB": <*string*> "1990-10-10",
"type": <*string*> "Scan",
"presciPDoctor": <*string*> "doc_45CD59",
"performingDoc": <*string*> "doc_45CD59",
"note": <*string*> "Blood Test",
"contents":[
  {
    "test_name": <*string*> "CBC",
    "result_value": <*string*> "10",
    "unit": <*string*> "mg/dl",
    "ref_range": <*string*> "10-20",
  }
],
"file_path": <*string*> "https://path",
"uploaded_by": <*string*> "doc_45CD59",
"uploaded_At": <*string*> "2021-10-10",
"downloaded_by": <*string[]*> ["doc_45CD59"],
"downloaded_at": <*string[]*> ["2021-10-10"],
"createdAt": <*string*> "2021-10-10",
"updatedAt": <*string*> "2021-10-10",
"department": <*string*> "lab"
}
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body: { { "success": "false", "message": "All field are required" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in uploading the lab scan" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    "success": "true",
    "message": "Scan created successfully",
    "data":
      {
        "hospitalId": "hos_7BA7CF",
        "patientUsername": "pat_12BA23",
        "patientName": "John Doe",
        "date": "2021-10-10",
        "hospitalName": "Hospital",
        "DOB": "1990-10-10",
        "type": "Lab Scan",
        "prescipDoctor": "doc_45CD59",
        "performingDoc": "doc_45CD59",
        "note": "note",
        "contents":
          [
            {
              "test_name": "test1",
              "result_value": "value1",
              "unit": "unit1",
              "ref_range": "range1",
            },
            {
              "test_name": "test2",
              "result_value": "value2",
              "unit": "unit2",
              "ref_range": "range2",
            },
          ],
        "file_path": "path",
        "uploaded_by": "doc_45CD59",
        "uploaded_At": "2021-10-10",
        "downloaded_by": ["doc_45CD59"],
        "downloaded_at": ["2021-10-10"],
        "createdAt": "2021-10-10",
        "updatedAt": "2021-10-10",
        "department": "department",
      },
  }
```

### url: /api/appointment/allScans?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Scan found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in fetching the scan" } }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    "success": "true",
    "message": "Scan fetched successfully",
    "data":
      [
        {
          "hospitalId": "hos_7BA7CF",
          "patientUsername": "pat_12BA23",
          "patientName": "John Doe",
          "date": "2021-10-10",
          "hospitalName": "Hospital",
          "DOB": "1990-10-10",
          "type": "Lab Scan",
          "prescipDoctor": "doc_45CD59",
          "performingDoc": "doc_45CD59",
          "note": "note",
          "contents":
            [
              {
                "test_name": "test1",
                "result_value": "value1",
                "unit": "unit1",
                "ref_range": "range1",
              },
              {
                "test_name": "test2",
                "result_value": "value2",
                "unit": "unit2",
                "ref_range": "range2",
              },
            ],
          "file_path": "path",
          "uploaded_by": "doc_45CD59",
          "uploaded_At": "2021-10-10",
          "downloaded_by": ["doc_45CD59"],
          "downloaded_at": ["2021-10-10"],
          "createdAt": "2021-10-10",
          "updatedAt": "2021-10-10",
          "department": "department",
        },
      ],
  }
```

### url: /api/appointment/updateLabScan?hospitalId=hos_7BA7CF&id={id}

method: **POST**

```yaml
requesBody: {
{
      "hospitalId":<*string*> "hos_7BA7CF
      "patientUsername": <*string*> "pat_12BA23",
      "patientName": <*string*> "John Doe",
      "date": <*string*> "2021-10-10",
      "hospitalName": <*string*> "Apollo Hospital",
      "DOB": <*string*> "1990-10-10",
      "type": <*string*> "Scan",
      "presciPDoctor": <*string*> "doc_45CD59",
      "performingDoc": <*string*> "doc_45CD59",
      "note": <*string*> "Blood Test",
      "contents":[
        {
          "test_name": <*string*> "CBC",
          "result_value": <*string*> "10",
          "unit": <*string*> "mg/dl",
          "ref_range": <*string*> "10-20",
        }
      ],
      "file_path": <*string*> "https://path",
      "uploaded_by": <*string*> "doc_45CD59",
      "uploaded_At": <*string*> "2021-10-10",
      "downloaded_by": <*string[]*> ["doc_45CD59"],
      "downloaded_at": <*string[]*> ["2021-10-10"],
      "createdAt": <*string*> "2021-10-10",
      "updatedAt": <*string*> "2021-10-10",
      "department": <*string*> "lab"
}
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Scan found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in updating the scan" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    "success": "true",
    "message": "Scan updated successfully",
    "data":
      {
        "hospitalId": "hos_7BA7CF",
        "patientUsername": "pat_12BA23",
        "patientName": "John Doe",
        "date": "2021-10-10",
        "hospitalName": "Hospital",
        "DOB": "1990-10-10",
        "type": "Lab Scan",
        "prescipDoctor": "doc_45CD59",
        "performingDoc": "doc_45CD59",
        "note": "note",
        "contents":
          [
            {
              "test_name": "test1",
              "result_value": "value1",
              "unit": "unit1",
              "ref_range": "range1",
            },
            {
              "test_name": "test2",
              "result_value": "value2",
              "unit": "unit2",
              "ref_range": "range2",
            },
          ],
        "file_path": "path",
        "uploaded_by": "doc_45CD59",
        "uploaded_At": "2021-10-10",
        "downloaded_by": ["doc_45CD59"],
        "downloaded_at": ["2021-10-10"],
        "createdAt": "2021-10-10",
        "updatedAt": "2021-10-10",
        "department": "department",
      },
  }
```

### url: /api/appointment/deleteLabScan?hospitalId=hos_7BA7CF&id={id}

method: **POST**

requesBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: { { "success": "true", "message": "No Scan found" } }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
  { { "success": "false", "message": "Error in deleting the scan" } }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    "success": "true",
    "message": "Scan deleted successfully",
    "data":
      {
        "hospitalId": "hos_7BA7CF",
        "patientUsername": "pat_12BA23",
        "patientName": "John Doe",
        "date": "2021-10-10",
        "hospitalName": "Hospital",
        "DOB": "1990-10-10",
        "type": "Lab Scan",
        "prescipDoctor": "doc_45CD59",
        "performingDoc": "doc_45CD59",
        "note": "note",
        "contents":
          [
            {
              "test_name": "test1",
              "result_value": "value1",
              "unit": "unit1",
              "ref_range": "range1",
            },
            {
              "test_name": "test2",
              "result_value": "value2",
              "unit": "unit2",
              "ref_range": "range2",
            },
          ],
        "file_path": "path",
        "uploaded_by": "doc_45CD59",
        "uploaded_At": "2021-10-10",
        "downloaded_by": ["doc_45CD59"],
        "downloaded_at": ["2021-10-10"],
        "createdAt": "2021-10-10",
        "updatedAt": "2021-10-10",
        "department": "department",
      },
  }
```

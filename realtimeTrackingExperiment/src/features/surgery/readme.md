# Documentation of routes for devs

# Payload for Surgery

```json
{
    {
    "hospitalId": "hos_7BA7CF",
    "time": "12:30",
    "ot": "OT-1",
    "patientRoom": "Room-1",
    "procedure": "Appendectomy",
    "remarks": "N/A",
    "surgeon": "Dr. John Doe",
    "nurse_team": "Nurse Team 1",
    "anaesthesiologist": "Dr. Jane Doe",
    "anaesthesiaType": "General",
    "scrub": "Nurse 1",
    "circulatory": "Nurse 2",
    "patientUsername": "patient1",
    "patientName": "Patient 1",
    "date": "2021-08-12",
    "hospitalName": "Hospital 1",
    "type": "surgery",
    "prescipDoctor": "Dr. Jane Doe",
    "performingDoc": "Dr. John Doe",
    "note": "N/A",
    "contents": [
        {
            "test_name": "Blood Pressure",
            "result_value": "120/80",
            "unit": "mmHg",
            "ref_range": "120/80 - 140/90"
        },
        {
            "test_name": "Heart Rate",
            "result_value": "72",
            "unit": "bpm",
            "ref_range": "60 - 100"
        }
    ],
    "file_path": "file_path",
    "uploaded_by": "Dr. John Doe",
    "uploaded_At": "2021-08-12",
    "downloaded_by": [],
    "downloaded_at": [],
    "status": "Pending"
}
}
```

# Surgery Routes

### url: /api/surgery/getAllSurgeries?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}
RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "No surgeries found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching the surgeries" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    "success": true,
    "message": "Surgeries fetched successfully",
    "data":
      [
        {
          "hospitalId": "hos_7BA7CF",
          "time": "12:30",
          "ot": "OT-1",
          "patientRoom": "Room-1",
          "procedure": "Appendectomy",
          "remarks": "N/A",
          "surgeon": "Dr. John Doe",
          "nurse_team": "Nurse Team 1",
          "anaesthesiologist": "Dr. Jane Doe",
          "anaesthesiaType": "General",
          "scrub": "Nurse 1",
          "circulatory": "Nurse 2",
          "patientUsername": "patient1",
          "patientName": "Patient 1",
          "date": "2021-08-12",
          "hospitalName": "Hospital 1",
          "type": "surgery",
          "prescipDoctor": "Dr. Jane Doe",
          "performingDoc": "Dr. John Doe",
          "note": "N/A",
          "contents":
            [
              {
                "test_name": "Blood Pressure",
                "result_value": "120/80",
                "unit": "mmHg",
                "ref_range": "120/80 - 140/90",
              },
              {
                "test_name": "Heart Rate",
                "result_value": "72",
                "unit": "bpm",
                "ref_range": "60 - 100",
              },
            ],
          "file_path": "file_path",
          "uploaded_by": "Dr. John Doe",
          "uploaded_At": "2021-08-12",
          "downloaded_by": [],
          "downloaded_at": [],
          "status": "Pending",
        },
      ],
  }
```

### url: /api/surgery/addSurgery

method: **POST**

```yaml
requestBody : {
    "hospitalId": <*string*>"7BA7CF",
    "time": <*string*>"12:30",
    "ot": <*string*>"OT-1",
    "patientRoom": <*string*>"Room-1",
    "procedure": <*string*>"Appendectomy",
    "remarks": <*string*>"N/A",
    "surgeon": <*string*>"Dr. John Doe",
    "nurse_team": <*string*>"Nurse Team 1",
    "anaesthesiologist": <*string*>"Dr. Jane Doe",
    "anaesthesiaType": <*string*>"General",
    "scrub": <*string*>"Nurse 1",
    "circulatory": <*string*>"Nurse 2",
    "patientUsername":<*string*> "pat_11BA72",
    "patientName": <*string*>"Patient 1",
    "date": <*string*>"2021-09-01",
    "hospitalName": <*string*>"Hospital 1",
    "type": <*TYPE*>"Surgery",
    "prescipDoctor": <*string*>"Doctor 1",
    "performingDoc": <*string*>"Doctor 2",
    "note": <*string*> | <*undefined*>"Note 1",
    "contents": <*ITestResult[]*> [
        {
            "test_name": <*string*>"Test 1",
            "result_value": <*string*>"Result 1",
            "unit": <*string*>"Unit 1",
            "ref_range": <*string*>"Ref Range 1"
        }
    ],
    "file_path": <*string*>"http://medoc.com/file_path",
    "uploaded_by": <*string*>"Doctor 1",
    "uploaded_At": <*string*>"2021-09-01",
    "downloaded_by": <*string[]*>["Doctor 1"],
    "downloaded_at": <*string[]*>["2021-09-01"],
    "status": <*string*>"Pending"
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
{ success: false, message: "All fields are required." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in creating a surgery" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```json
response body:
  {
    {
    "hospitalId": "hos_7BA7CF",
    "time": "12:30",
    "ot": "OT-1",
    "patientRoom": "Room-1",
    "procedure": "Appendectomy",
    "remarks": "N/A",
    "surgeon": "Dr. John Doe",
    "nurse_team": "Nurse Team 1",
    "anaesthesiologist": "Dr. Jane Doe",
    "anaesthesiaType": "General",
    "scrub": "Nurse 1",
    "circulatory": "Nurse 2",
    "patientUsername": "patient1",
    "patientName": "Patient 1",
    "date": "2021-08-12",
    "hospitalName": "Hospital 1",
    "type": "surgery",
    "prescipDoctor": "Dr. Jane Doe",
    "performingDoc": "Dr. John Doe",
    "note": "N/A",
    "contents": [
        {
            "test_name": "Blood Pressure",
            "result_value": "120/80",
            "unit": "mmHg",
            "ref_range": "120/80 - 140/90"
        },
        {
            "test_name": "Heart Rate",
            "result_value": "72",
            "unit": "bpm",
            "ref_range": "60 - 100"
        }
    ],
    "file_path": "file_path",
    "uploaded_by": "Dr. John Doe",
    "uploaded_At": "2021-08-12",
    "downloaded_by": [],
    "downloaded_at": [],
    "status": "Pending"
}
  }
```

### url: /api/surgery/updateSurgery?hospitalId=hos_7BA7CF&id={mongo ObjectId}

method: **POST**

```yaml
requestBody : {
    "hospitalId": <*string*>"7BA7CF",
    "time": <*string*>"12:30",
    "ot": <*string*>"OT-1",
    "patientRoom": <*string*>"Room-1",
    "procedure": <*string*>"Appendectomy",
    "remarks": <*string*>"N/A",
    "surgeon": <*string*>"Dr. John Doe",
    "nurse_team": <*string*>"Nurse Team 1",
    "anaesthesiologist": <*string*>"Dr. Jane Doe",
    "anaesthesiaType": <*string*>"General",
    "scrub": <*string*>"Nurse 1",
    "circulatory": <*string*>"Nurse 2",
    "patientUsername":<*string*> "pat_11BA72",
    "patientName": <*string*>"Patient 1",
    "date": <*string*>"2021-09-01",
    "hospitalName": <*string*>"Hospital 1",
    "type": <*TYPE*>"Surgery",
    "prescipDoctor": <*string*>"Doctor 1",
    "performingDoc": <*string*>"Doctor 2",
    "note": <*string*> | <*undefined*>"Note 1",
    "contents": <*ITestResult[]*> [
        {
            "test_name": <*string*>"Test 1",
            "result_value": <*string*>"Result 1",
            "unit": <*string*>"Unit 1",
            "ref_range": <*string*>"Ref Range 1"
        }
    ],
    "file_path": <*string*>"http://medoc.com/file_path",
    "uploaded_by": <*string*>"Doctor 1",
    "uploaded_At": <*string*>"2021-09-01",
    "downloaded_by": <*string[]*>["Doctor 1"],
    "downloaded_at": <*string[]*>["2021-09-01"],
    "status": <*string*>"Pending"
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Surgery Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in updating a surgery" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    {
      "hospitalId": "hos_7BA7CF",
      "time": "12:30",
      "ot": "OT-1",
      "patientRoom": "Room-1",
      "procedure": "Appendectomy",
      "remarks": "N/A",
      "surgeon": "Dr. John Doe",
      "nurse_team": "Nurse Team 1",
      "anaesthesiologist": "Dr. Jane Doe",
      "anaesthesiaType": "General",
      "scrub": "Nurse 1",
      "circulatory": "Nurse 2",
      "patientUsername": "patient1",
      "patientName": "Patient 1",
      "date": "2021-08-12",
      "hospitalName": "Hospital 1",
      "type": "surgery",
      "prescipDoctor": "Dr. Jane Doe",
      "performingDoc": "Dr. John Doe",
      "note": "N/A",
      "contents":
        [
          {
            "test_name": "Blood Pressure",
            "result_value": "120/80",
            "unit": "mmHg",
            "ref_range": "120/80 - 140/90",
          },
          {
            "test_name": "Heart Rate",
            "result_value": "72",
            "unit": "bpm",
            "ref_range": "60 - 100",
          },
        ],
      "file_path": "file_path",
      "uploaded_by": "Dr. John Doe",
      "uploaded_At": "2021-08-12",
      "downloaded_by": [],
      "downloaded_at": [],
      "status": "Pending",
    },
  }
```

### url: /api/surgery/deleteSurgery?hospitalId=hos_7BA7CF&id={mongo ObjectId}

method: **POST**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Surgery Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in deleting a surgery" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Surgery deleted successfully.",
      "data":
        {
          "hospitalId": "hos_7BA7CF",
          "time": "12:30",
          "ot": "OT-1",
          "patientRoom": "Room-1",
          "procedure": "Appendectomy",
          "remarks": "N/A",
          "surgeon": "Dr. John Doe",
          "nurse_team": "Nurse Team 1",
          "anaesthesiologist": "Dr. Jane Doe",
          "anaesthesiaType": "General",
          "scrub": "Nurse 1",
          "circulatory": "Nurse 2",
          "patientUsername": "patient1",
          "patientName": "Patient 1",
          "date": "2021-08-12",
          "hospitalName": "Hospital 1",
          "type": "surgery",
          "prescipDoctor": "Dr. Jane Doe",
          "performingDoc": "Dr. John Doe",
          "note": "N/A",
          "contents":
            [
              {
                "test_name": "Blood Pressure",
                "result_value": "120/80",
                "unit": "mmHg",
                "ref_range": "120/80 - 140/90",
              },
              {
                "test_name": "Heart Rate",
                "result_value": "72",
                "unit": "bpm",
                "ref_range": "60 - 100",
              },
            ],
          "file_path": "file_path",
          "uploaded_by": "Dr. John Doe",
          "uploaded_At": "2021-08-12",
          "downloaded_by": [],
          "downloaded_at": [],
          "status": "Pending",
        },
    },
  }
```

### url: /api/surgery/getEquipment?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Equipment Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in getting Equipment" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
    {
        "success":true,
        "message":"Equipment fetched Successfully",
        "data":[
            {
                "hospitalId": "hos_7BA7CF",
                "itemId": "equip_123",
                "name": "stethoscope",
                "type": "device",
                "roomId": "room_12BC23",
                "issuedOn": "2022-12-12",
                "returnedOn": "2022-12-12",
                "issuedFrom": "hos_7BA7CF",
                "issuedTo": "hos_7BA7CF",
                "quantity": 100
            }
        ]
    }
}
```

### url: /api/surgery/getMedicines?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Medicines Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in getting Medicines" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success":true,
        "message":"Medicines fetched Successfully",
        "data":[
            {
                "hospitalId": "hos_7BA7CF",
                "vendorName": "vendor1",
                "vendorId": "ven_123",
                "itemType": "medicine",
                "name": "paracetamol",
                "expiry": "2022-12-12",
                "batchNo": "123",
                "hsnNo": "123",
                "packing": "30ml",
                "subType": "tablet",
                "quantity": 100,
                "price": 10
            }
        ]
    }
}
```

### url: /api/surgery/getRoomFromIpd?hospitalId=hos_7BA7CF&patientUsername=johndoe@123&id={mongo ObjectId}

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Room Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in getting Room from Ipd" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
    {
        "success":true,
        "message":"Room fetched Successfully",
        "data":
            {
                "hospitalId":"hos_7BA7CF",
                "id":"ipd_67DB86",
                "patient":{
                "username":"johndoe@123",
                "name":"John Doe",
                "DOS":[{
                    "date":"2022-12-12",
                    "time":"10:00:00",
                    "drugName":"Paracetamol",
                    "dosage":"500mg",
                    "Route":"Oral",
                    "frequency":"8 hourly",
                    "nurse":{
                        "id":"nur_69CD69",
                        "name":"Nurse Jane"
                    },
                    "witness":{
                        "id":"nur_69CD69",
                        "name":"Nurse Jane"
                    },
                    "pharmacist":{
                        "id":"phar_69CD69",
                        "name":"Pharmacist Jane"
                    },
                    "doctor":{
                        "id":"doc_44186",
                        "name":"Dr. Smith"
                    }
                    }],
                "DIO":[{
                    "date":"2022-12-12",
                    "time":"10:00:00",
                    "drugName":"Paracetamol",
                    "dosage":"500mg",
                    "diluent":"Water",
                    "diluentVolume":"100ml",
                    "infusionRate":"20ml/hr",
                    "route":"Oral",
                    "frequency":"8 hourly",
                    "goal":"Fever",
                    "nurse":{
                        "id":"nur_69CD69",
                        "name":"Nurse Jane"
                    },
                    "witness":{
                        "id":"nur_69CD69",
                        "name":"Nurse Jane"
                    },
                    "pharmacist":{
                        "id":"phar_69CD69",
                        "name":"Pharmacist Jane"
                    },
                    "doctor":{
                        "id":"doc_44186",
                        "name":"Dr. Smith"
                    },
                    "PhysicianSign":{
                        "id":"doc_44186",
                        "name":"Dr. Smith"
                    }
                }],
                    "nonDrugOrder":[{
                    "date":"2022-12-12",
                    "time":"10:00:00",
                    "order":{
                        "laboratory":"Blood test",
                        "radiology":"X-ray",
                        "otherDiagnosticOrder":"ECG"
                    },
                    "PhysicianSign":{
                        "id":"doc_44186",
                        "name":"Dr. Smith"
                    }
                    }]
                },
                "admissionDate":"2022-12-12",
                "dischargeDate":"2022-12-15",
                "room":{
                    "type":"General",
                    "roomNumber":15,
                    "Beds":{
                        "id":"bed_01",
                        "number":1
                        },
                    "numberOfBeds":1
                "isbedOccupied":true,
                "diagnosis":"Fever",
                "medications":["Paracetamol","Ibuprofen"],
                "procedures":["Blood test","X-ray"],
                "diet":"No sugar",
                "allergies":["Penicillin"],
                "visitHistory":[{
                    "date":"2022-12-12",
                    "time":"10:00:00",
                    "relativeName":"John Doe",
                    "relation": "Father",
                    "phoneNumber":"1234567890"
                    },{
                    "date":"2022-12-13",
                    "time":"11:00:00",
                    "relativeName":"Jane Doe",
                    "relation": "Mother",
                    "phoneNumber":"1234567890"
                    }],
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
            }
    }
}
```

### url: /api/surgery/addNurseToTeam?hospitalId=hos_7BA7CF&id={mongo ObjectId}

method: **POST**

```yaml
requestBody:
{
    nurse:{
        nurseName: <*string*>,
        nurseId: <*string*>;
    }
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Surgery Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in adding nurse to team" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
   {
        "success":true,
        "message":"Room fetched Successfully",
        "data":{
            "hospitalId": "hos_7BA7CF",
            "time": "12:30",
            "ot": "OT-1",
            "patientRoom": "Room-1",
            "procedure": "Appendectomy",
            "remarks": "N/A",
            "surgeon": "Dr. John Doe",
            "nurse_team": [
                {
                    "nurseName": <*string*>;
                    "nurseId": <*string*>;
                }
            ],
            "anaesthesiologist": "Dr. Jane Doe",
            "anaesthesiaType": "General",
            "scrub": "Nurse 1",
            "circulatory": "Nurse 2",
            "patientUsername": "patient1",
            "patientName": "Patient 1",
            "date": "2021-08-12",
            "hospitalName": "Hospital 1",
            "type": "surgery",
            "prescipDoctor": "Dr. Jane Doe",
            "performingDoc": "Dr. John Doe",
            "note": "N/A",
            "contents": [
                {
                    "test_name": "Blood Pressure",
                    "result_value": "120/80",
                    "unit": "mmHg",
                    "ref_range": "120/80 - 140/90"
                },
                {
                    "test_name": "Heart Rate",
                    "result_value": "72",
                    "unit": "bpm",
                    "ref_range": "60 - 100"
                }
            ],
            "file_path": "file_path",
            "uploaded_by": "Dr. John Doe",
            "uploaded_At": "2021-08-12",
            "downloaded_by": [],
            "downloaded_at": [],
            "status": "Pending"
            }
   }
}
```

### url: /api/surgery/addMedicinesToSurgery?hospitalId=hos_7BA7CF&id={mongo ObjectId}&quantity={number}

method: **POST**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
{ success: true, message: "Quantity of medicine is not available." }
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Medicines Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in adding medicines to surgery" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
    {
        "success":true,
        "message":"Medicines added to surgery successfully",
        "data":{
            "hospitalId": "hos_7BA7CF",
            "vendorName": "vendor1",
            "vendorId": "ven_123",
            "itemType": "medicine",
            "name": "paracetamol",
            "expiry": "2022-12-12",
            "batchNo": "123",
            "hsnNo": "123",
            "packing": "30ml",
            "subType": "tablet",
            "quantity": 100,
            "price": 10
        }
    }
}
```

### url: /api/surgery/addEquipmentToSurgery?hospitalId=hos_7BA7CF&id={mongo ObjectId [equipment id]}&quantity={number}&surgerId={surgery id}

method: **POST**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
{ success: true, message: "Quantity of Equipment is not available." }
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Equipment Not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in adding Equipment to surgery" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
    {
        "success":true,
        "message":"Equipment added to surgery successfully",
        "data":{
            "hospitalId": "hos_7BA7CF",
            "itemId": "equip_123",
            "name": "stethoscope",
            "type": "device",
            "roomId": "room_12BC23",
            "issuedOn": "2022-12-12",
            "returnedOn": "2022-12-12",
            "issuedFrom": "hos_7BA7CF",
            "issuedTo": "hos_7BA7CF",
            "quantity": 100
        }
    }
}
```

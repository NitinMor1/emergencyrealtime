### Emergency Documentation for Devs and routes 

### Payload

```json
{
    "hospitalId": "hos_1A3D31",
    "emergencyId": "123",
    "emergencyType": "Accident",
    "emergencyLocation": "Bangalore",
    "emergencyTime": "2021-10-10T10:10:10",
    "driver":  {
    "hospitalId": "hos_1A3D31",
    "employeeId": "emp_11BA72",
    "name": "rishabh",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "phoneNumber": "1234567890",
    "email": "johnDoe123@gamil.com",
    "address": "123, abc street, xyz city",
    "joining_date": "2020-01-01",
    "leaving_date": null,
    "salary": 10000,
    "role": "driver",
    "department": "Ambulance",
    "supervisor": "Dr. Smith",
    "no_of_leave": 0,
    "leave_on_date": [],
    "no_of_absent": 0,
    "absent_on_date": [],
    "leave_reason": [],
    "performance_remarks": [
        {
        "date": "2021-01-01",
        "employeeId": "emp_11BA72",
        "reviewerName": "Dr. Smith",
        "review_title": "Annual Review",
        "review_purpose": "Annual Performance Review",
        "review_rating": 4,
        "task": "surgery",
        "work_done": "performed 10 surgeries",
        "blockages": "none",
        "accomplishments": "completed 10 surgeries",
        "training": "attended 2 training sessions"
        }
    ],
    "history_payroll": [
        {
            "allowances": 2000,
            "deductions": 1000,
            "status": "pending",
            "payment_dates": "2021-01-01"
        },
        {
            "allowances": 2000,
            "deductions": 1000,
            "status": "paid",
            "payment_dates": "2022-11-01"
        },
        {
            "allowances": 2000,
            "deductions": 1000,
            "status": "pending",
            "payment_dates": "2021-01-01"
        },
        {
            "allowances": 2000,
            "deductions": 1000,
            "status": "pending",
            "payment_dates": "2021-01-01"
        }
    ]
},
    "vehicleNumber": "123",
    "vehicleLocation": "Bangalore",
    "available": true,
    "patient": {
    "hospitalId": "hos_1A3D31",
    "username": "johnDoe",
    "email": "john@gmail.com",
    "name": "john",
    "password": "password",
    "weight": "70",
    "height": "5.8",
    "bloodGroup": "A+",
    "phoneNumber": "1234567890",
    "dob":"1990-01-01",
    "gender":"male",
    "family": [
        {
            "id": "johnDoe",
            "relation": "parent"
        }
    ],
    "listOfHospitals":["hos_1A3D31"],
    "listOfDoctors":[]
}
}
```


### Routes

# url: /api/emergency/getEmergency?hospitalId=hos-7BA7CF

method **GET**

Request body 
        <*query*>
{
    ?hospitalId = hos_7BA7CF
}
Status code : 200

```yaml
Response Body 
{
    success: true,
    message: "Emergency fetched successfully",
    data: {
    "hospitalId": <*string*>"hos-7BA7CF",
    "emergencyId": <*string*>"123",
    "emergencyType": <*string*>"Accident",
    "emergencyLocation": <*string*>"Bangalore",
    "emergencyTime": <*string*>"2021-10-10T10:10:10",
    "driver":  {
        "hospitalId": <*string*>"hos_7BA7CF",
        "employeeId": <*string*>"emp_11BA72",
        "name": <*string*>"hello world",
        "date_of_birth": <*string*>"1990-01-10",
        "gender": <*string*>"male",
        "phoneNumber": <*string*>"1234567890",
        "email": <*string*>"johndoe123@gmail.com",
        "address": <*string*>"123, abc street, xyz city",
        "joining_date": <*string*>"2020-01-01",
        "leaving_date": <*string*>"2020-01-01",
        "salary": <*number*>10000,
        "role": <*string*>"doctor",
        "department": <*string*>"surgery",
        "supervisor": <*string*>"Dr. Smith",
        "no_of_leave": <*number*>0,
        "leave_on_date": [],
        "no_of_absent": <*number*>0,
        "absent_on_date": [],
        "leave_reason": [],
        "performance_remarks": [
            {
                "date": <*string*>"2021-01-01",
                "employeeId": <*string*>"emp_11BA72",
                "reviewerName": <*string*>"Dr. Smith",
                "review_title": <*string*>"Annual Review",
                "review_purpose": <*string*>"Annual Performance Review",
                "review_rating": <*number*>4,
                "task": <*string*>"surgery",
                "work_done": <*string*>"performed 10 surgeries",
                "blockages": <*string*>"none",
                "accomplishments": <*string*>"completed 10 surgeries",
                "training": <*string*>"attended 2 training sessions"
            }
        ],
        "history_payroll": [
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"paid",
                "payment_dates": <*string*>"2022-11-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            }
        ]
    },
    "vehicleNumber": <*string*>"123",
    "vehicleLocation": <*string*>"Bangalore",
    "available": <*boolean*>true,
    "patient": {
        "hospitalId": <*string*>"hos_7BA7CF",
        "username": <*string*>"johnDoe",
        "email": <*string*>"johnDoe123@gmail.com",
        "name": <*string*>"john",
        "password": <*string*>"password",
        "weight": <*string*>"70",
        "height": <*string*>"5.8",
        "bloodGroup": <*string*>"A+",
        "phoneNumber": <*string*>"1234567890",
        "dob": <*string*>"1990-01-01",
        "gender": <*string*>"male",
        "family": [
            {
                "id": <*string*>"johnDoe",
                "relation": <*string*>"parent"
            }
        ]
    }
    }
}
```

Error Response <br><br>
status code: 404
```yaml
{
    success: true,
    message: "Emergency not found",
}
```

Error Response <br><br>
status code: 500
```yaml
{
    success: false,
    message: "Internal Server Error",
}
```

# url: /api/emergency/createEmergency

method **POST**

```yaml
Request Body 
{
    "hospitalId": <*string*>"hos-7BA7CF",
    "emergencyId": <*string*>"123",
    "emergencyType": <*string*>"Accident",
    "emergencyLocation": <*string*>"Bangalore",
    "emergencyTime": <*string*>"2021-10-10T10:10:10",
    "driver":  {
        "hospitalId": <*string*>"hos_7BA7CF",
        "employeeId": <*string*>"emp_11BA72",
        "name": <*string*>"hello world",
        "date_of_birth": <*string*>"1990-01-10",
        "gender": <*string*>"male",
        "phoneNumber": <*string*>"1234567890",
        "email": <*string*>"johndoe123@gmail.com",
        "address": <*string*>"123, abc street, xyz city",
        "joining_date": <*string*>"2020-01-01",
        "leaving_date": <*string*>"2020-01-01",
        "salary": <*number*>10000,
        "role": <*string*>"doctor",
        "department": <*string*>"surgery",
        "supervisor": <*string*>"Dr. Smith",
        "no_of_leave": <*number*>0,
        "leave_on_date": [],
        "no_of_absent": <*number*>0,
        "absent_on_date": [],
        "leave_reason": [],
        "performance_remarks": [
            {
                "date": <*string*>"2021-01-01",
                "employeeId": <*string*>"emp_11BA72",
                "reviewerName": <*string*>"Dr. Smith",
                "review_title": <*string*>"Annual Review",
                "review_purpose": <*string*>"Annual Performance Review",
                "review_rating": <*number*>4,
                "task": <*string*>"surgery",
                "work_done": <*string*>"performed 10 surgeries",
                "blockages": <*string*>"none",
                "accomplishments": <*string*>"completed 10 surgeries",
                "training": <*string*>"attended 2 training sessions"
            }
        ],
        "history_payroll": [
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"paid",
                "payment_dates": <*string*>"2022-11-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            }
        ]
    },
    "vehicleNumber": <*string*>"123",
    "vehicleLocation": <*string*>"Bangalore",
    "available": <*boolean*>true,
    "patient": {
        "hospitalId": <*string*>"hos_7BA7CF",
        "username": <*string*>"johnDoe",
        "email": <*string*>"johnDoe123@gmail.com",
        "name": <*string*>"john",
        "password": <*string*>"password",
        "weight": <*string*>"70",
        "height": <*string*>"5.8",
        "bloodGroup": <*string*>"A+",
        "phoneNumber": <*string*>"1234567890",
        "dob": <*string*>"1990-01-01",
        "gender": <*string*>"male",
        "family": [
            {
                "id": <*string*>"johnDoe",
                "relation": <*string*>"parent"
            }
        ]
    }
}
```
Response Body 
Status code : 201
```yaml
{
    success: true,
    message: "Emergency created successfully",
    data:
{
    "hospitalId": <*string*>"hos-7BA7CF",
    "emergencyId": <*string*>"123",
    "emergencyType": <*string*>"Accident",
    "emergencyLocation": <*string*>"Bangalore",
    "emergencyTime": <*string*>"2021-10-10T10:10:10",
    "driver":  {
        "hospitalId": <*string*>"hos_7BA7CF",
        "employeeId": <*string*>"emp_11BA72",
        "name": <*string*>"hello world",
        "date_of_birth": <*string*>"1990-01-10",
        "gender": <*string*>"male",
        "phoneNumber": <*string*>"1234567890",
        "email": <*string*>"johndoe123@gmail.com",
        "address": <*string*>"123, abc street, xyz city",
        "joining_date": <*string*>"2020-01-01",
        "leaving_date": <*string*>"2020-01-01",
        "salary": <*number*>10000,
        "role": <*string*>"doctor",
        "department": <*string*>"surgery",
        "supervisor": <*string*>"Dr. Smith",
        "no_of_leave": <*number*>0,
        "leave_on_date": [],
        "no_of_absent": <*number*>0,
        "absent_on_date": [],
        "leave_reason": [],
        "performance_remarks": [
            {
                "date": <*string*>"2021-01-01",
                "employeeId": <*string*>"emp_11BA72",
                "reviewerName": <*string*>"Dr. Smith",
                "review_title": <*string*>"Annual Review",
                "review_purpose": <*string*>"Annual Performance Review",
                "review_rating": <*number*>4,
                "task": <*string*>"surgery",
                "work_done": <*string*>"performed 10 surgeries",
                "blockages": <*string*>"none",
                "accomplishments": <*string*>"completed 10 surgeries",
                "training": <*string*>"attended 2 training sessions"
            }
        ],
        "history_payroll": [
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"paid",
                "payment_dates": <*string*>"2022-11-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            }
        ]
    },
    "vehicleNumber": <*string*>"123",
    "vehicleLocation": <*string*>"Bangalore",
    "available": <*boolean*>true,
    "patient": {
        "hospitalId": <*string*>"hos_7BA7CF",
        "username": <*string*>"johnDoe",
        "email": <*string*>"johnDoe123@gmail.com",
        "name": <*string*>"john",
        "password": <*string*>"password",
        "weight": <*string*>"70",
        "height": <*string*>"5.8",
        "bloodGroup": <*string*>"A+",
        "phoneNumber": <*string*>"1234567890",
        "dob": <*string*>"1990-01-01",
        "gender": <*string*>"male",
        "family": [
            {
                "id": <*string*>"johnDoe",
                "relation": <*string*>"parent"
            }
        ]
    }
}
}
```

Error Response <br><br>
status code: 500
```yaml
{
    success: false,
    message: "Internal Server Error",
}
```

# url: /api/emergency/updateEmergency?hospitalId=hos_7BA7CF&id={mongoId}

method **POST**

```yaml
Request Body 
{
    "hospitalId": <*string*>"hos-7BA7CF",
    "emergencyId": <*string*>"123",
    "emergencyType": <*string*>"Accident",
    "emergencyLocation": <*string*>"Bangalore",
    "emergencyTime": <*string*>"2021-10-10T10:10:10",
    "driver":  {
        "hospitalId": <*string*>"hos_7BA7CF",
        "employeeId": <*string*>"emp_11BA72",
        "name": <*string*>"hello world",
        "date_of_birth": <*string*>"1990-01-10",
        "gender": <*string*>"male",
        "phoneNumber": <*string*>"1234567890",
        "email": <*string*>"johndoe123@gmail.com",
        "address": <*string*>"123, abc street, xyz city",
        "joining_date": <*string*>"2020-01-01",
        "leaving_date": <*string*>"2020-01-01",
        "salary": <*number*>10000,
        "role": <*string*>"doctor",
        "department": <*string*>"surgery",
        "supervisor": <*string*>"Dr. Smith",
        "no_of_leave": <*number*>0,
        "leave_on_date": [],
        "no_of_absent": <*number*>0,
        "absent_on_date": [],
        "leave_reason": [],
        "performance_remarks": [
            {
                "date": <*string*>"2021-01-01",
                "employeeId": <*string*>"emp_11BA72",
                "reviewerName": <*string*>"Dr. Smith",
                "review_title": <*string*>"Annual Review",
                "review_purpose": <*string*>"Annual Performance Review",
                "review_rating": <*number*>4,
                "task": <*string*>"surgery",
                "work_done": <*string*>"performed 10 surgeries",
                "blockages": <*string*>"none",
                "accomplishments": <*string*>"completed 10 surgeries",
                "training": <*string*>"attended 2 training sessions"
            }
        ],
        "history_payroll": [
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"paid",
                "payment_dates": <*string*>"2022-11-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            }
        ]
    },
    "vehicleNumber": <*string*>"123",
    "vehicleLocation": <*string*>"Bangalore",
    "available": <*boolean*>true,
    "patient": {
        "hospitalId": <*string*>"hos_7BA7CF",
        "username": <*string*>"johnDoe",
        "email": <*string*>"johnDoe123@gmail.com",
        "name": <*string*>"john",
        "password": <*string*>"password",
        "weight": <*string*>"70",
        "height": <*string*>"5.8",
        "bloodGroup": <*string*>"A+",
        "phoneNumber": <*string*>"1234567890",
        "dob": <*string*>"1990-01-01",
        "gender": <*string*>"male",
        "family": [
            {
                "id": <*string*>"johnDoe",
                "relation": <*string*>"parent"
            }
        ]
    }
}
```
Status code : 201
```json
Response Body {
    success: true,
    message: "Emergency updated successfully",
    data: {
    "hospitalId": <*string*>"hos-7BA7CF",
    "emergencyId": <*string*>"123",
    "emergencyType": <*string*>"Accident",
    "emergencyLocation": <*string*>"Bangalore",
    "emergencyTime": <*string*>"2021-10-10T10:10:10",
    "driver":  {
        "hospitalId": <*string*>"hos_7BA7CF",
        "employeeId": <*string*>"emp_11BA72",
        "name": <*string*>"hello world",
        "date_of_birth": <*string*>"1990-01-10",
        "gender": <*string*>"male",
        "phoneNumber": <*string*>"1234567890",
        "email": <*string*>"johndoe123@gmail.com",
        "address": <*string*>"123, abc street, xyz city",
        "joining_date": <*string*>"2020-01-01",
        "leaving_date": <*string*>"2020-01-01",
        "salary": <*number*>10000,
        "role": <*string*>"doctor",
        "department": <*string*>"surgery",
        "supervisor": <*string*>"Dr. Smith",
        "no_of_leave": <*number*>0,
        "leave_on_date": [],
        "no_of_absent": <*number*>0,
        "absent_on_date": [],
        "leave_reason": [],
        "performance_remarks": [
            {
                "date": <*string*>"2021-01-01",
                "employeeId": <*string*>"emp_11BA72",
                "reviewerName": <*string*>"Dr. Smith",
                "review_title": <*string*>"Annual Review",
                "review_purpose": <*string*>"Annual Performance Review",
                "review_rating": <*number*>4,
                "task": <*string*>"surgery",
                "work_done": <*string*>"performed 10 surgeries",
                "blockages": <*string*>"none",
                "accomplishments": <*string*>"completed 10 surgeries",
                "training": <*string*>"attended 2 training sessions"
            }
        ],
        "history_payroll": [
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"paid",
                "payment_dates": <*string*>"2022-11-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            },
            {
                "allowances": <*number*>2000,
                "deductions": <*number*>1000,
                "status": <*string*>"pending",
                "payment_dates": <*string*>"2021-01-01"
            }
        ]
    },
    "vehicleNumber": <*string*>"123",
    "vehicleLocation": <*string*>"Bangalore",
    "available": <*boolean*>true,
    "patient": {
        "hospitalId": <*string*>"hos_7BA7CF",
        "username": <*string*>"johnDoe",
        "email": <*string*>"johnDoe123@gmail.com",
        "name": <*string*>"john",
        "password": <*string*>"password",
        "weight": <*string*>"70",
        "height": <*string*>"5.8",
        "bloodGroup": <*string*>"A+",
        "phoneNumber": <*string*>"1234567890",
        "dob": <*string*>"1990-01-01",
        "gender": <*string*>"male",
        "family": [
            {
                "id": <*string*>"johnDoe",
                "relation": <*string*>"parent"
            }
        ]
    }
}
}
```

Error Response <br><br>
status code: 500
```yaml
{
    success: false,
    message: "Internal Server Error",
}
```

Error Response <br><br>
status code: 404
```yaml
{
    success: false,
    message: "Emergency not found",
}
```

# url: /api/emergency/deleteEmergency?hospitalId=hos_7BA7CF&id={mongoId}

method **POST**

```yaml
Request Body 
{
null
}
```

Status code : 201
```yaml
Response Body 
{
    success: true,
    message: "Emergency deleted successfully",
}
```

Error Response <br><br>
status code: 500
```yaml
{
    success: false,
    message: "Internal Server Error",
}
```

Error Response <br><br>
status code: 404
```yaml
{
    success: false,
    message: "Emergency not found",
}
```

# url: /api/emergency/getAmbulanceList?hospitalId=hos_7BA7CF

method **POST**

#### Description:
The `getAmbulanceList` function is an asynchronous function that retrieves the list of ambulances associated with a specific hospital from the database. It looks up the hospital by its `hospitalId` and returns the ambulance list if found.

#### Parameters:
- `req: Request`: The HTTP request object containing the query parameters.
  - `req.query.hospitalId: string` - The ID of the hospital whose ambulance list is to be retrieved.
  
- `res: Response`: The HTTP response object used to send back the response.

#### Returns:
- **Status 200 (OK)**: The ambulance list was successfully retrieved.
  - Example response:
    ```json
    {
      "success": true,
      "message": "Ambulance fetched successfully",
      "data": [
        "Ambulance 1",
        "Ambulance 2",
        // ...other ambulances
      ]
    }
    ```
- **Status 404 (Not Found)**: No ambulance list was found for the specified hospital.
  - Example response:
    ```json
    {
      "success": true,
      "message": "Ambulance not found"
    }
    ```
- **Status 500 (Internal Server Error)**: There was an error while fetching the ambulance list.
  - Example response:
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```


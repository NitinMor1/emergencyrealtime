# Documentation of routes for devs

# payload

```json
  {
  "hospitalId": "hos_1A3D31",
    "name": "sudhanshu joshi",
    "email": "sudhanshuj@gmail.com",
    "phoneNumber": "6263041577",
    "address": "c1, 304, shubham res. indore",
    "dateOfBirth": "2002-08-03",
    "gender": "male",
    "employeeId": "emp_9NZ",
    "joining_date": "2024-08-03",
    "total_payable_salary": 0,
    "total_paid_salary": 120000,
    "leaving_date": null,
    "salary": 100000,
    "role": "paramedics",
    "department": "Transport",
    "supervisor": "other",
    "no_of_leave": 0,
    "no_of_absent": 1,
    "attendance": [],
    "performance_remarks": [],
    "history_payroll": [
      {
        "allowances": 20000,
        "deductions": 0,
        "status": "paid",
        "payment_dates": "2024-08-24"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": [{
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }]
  }
```



# HRMS Routes

### url: /api/hr/getAllEmployee?hospitalId=hos_7BA7CF

method: **GET**

requesBody:{
<*query*> hospitalId=hos_7BA7CF
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ error: "No employees found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ error: "Error in fetching the employees" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Employees fetched successfully.",
      "data":
        [
          {
      {
  "hospitalId": "string",
  "ContactDetails": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "employeeId": "string"
  },
  "HR":{
    "joining_date": "string",
    "total_payable_salary": 0,
    "total_paid_salary": 0,
    "leaving_date": "string",
    "salary": 0,
    "role": "admin",
    "department": "string",
    "supervisor": "string",
    "no_of_leave": 0,
    "no_of_absent": 0,
    "attendance": [
      {
        "date": "string",
        "checkInTime": "string",
        "checkOutTime": "string",
        "onLeave": true,
        "leave_reason": "string",
        "absent": true,
        "approved": true,
        "leaveType": "casual leave"
      }
    ],
    "performance_remarks": [
      {
        "date": "string",
        "employeeId": "string",
        "reviewerName": "string",
        "review_title": "string",
        "review_purpose": "string",
        "review_rating": 0,
        "task": "string",
        "work_done": "string",
        "blockages": "string",
        "accomplishments": "string",
        "training": "string",
        "durationOfOverTime": 0
      }
    ],
    "history_payroll": [
      {
        "allowances": 0,
        "deductions": 0,
        "status": "pending",
        "payment_dates": "string"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": {
      "date": "string",
      "shift": "morning",
      "employeeId": "string",
      "location": "string",
      "availability": true
    }
  }
  }
    }
    }
    }
```

### url: /api/hr/getEmployeeById?id={id}&hospitalId=hos_7BA7CF

method: **GET**

requesBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in fetching the employee',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Employee fetched successfully.",
      "data":
        [
           {
  "hospitalId": "string",
  "ContactDetails": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "employeeId": "string"
  },
  "HR":{
    "joining_date": "string",
    "total_payable_salary": 0,
    "total_paid_salary": 0,
    "leaving_date": "string",
    "salary": 0,
    "role": "admin",
    "department": "string",
    "supervisor": "string",
    "no_of_leave": 0,
    "no_of_absent": 0,
    "attendance": [
      {
        "date": "string",
        "checkInTime": "string",
        "checkOutTime": "string",
        "onLeave": true,
        "leave_reason": "string",
        "absent": true,
        "approved": true,
        "leaveType": "casual leave"
      }
    ],
    "performance_remarks": [
      {
        "date": "string",
        "employeeId": "string",
        "reviewerName": "string",
        "review_title": "string",
        "review_purpose": "string",
        "review_rating": 0,
        "task": "string",
        "work_done": "string",
        "blockages": "string",
        "accomplishments": "string",
        "training": "string",
        "durationOfOverTime": 0
      }
    ],
    "history_payroll": [
      {
        "allowances": 0,
        "deductions": 0,
        "status": "pending",
        "payment_dates": "string"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": {
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }
  }
  }
        ],
    },
  }
```

### url: /api/hr/addEmployee

method: **POST**

```yaml
requestBody:
  {
  "hospitalId": "string",
  "ContactDetails": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "employeeId": "string"
  },
  "HR":{
    "joining_date": "string",
    "total_payable_salary": 0,
    "total_paid_salary": 0,
    "leaving_date": "string",
    "salary": 0,
    "role": "admin",
    "department": "string",
    "supervisor": "string",
    "no_of_leave": 0,
    "no_of_absent": 0,
    "attendance": [
      {
        "date": "string",
        "checkInTime": "string",
        "checkOutTime": "string",
        "onLeave": true,
        "leave_reason": "string",
        "absent": true,
        "approved": true,
        "leaveType": "casual leave"
      }
    ],
    "performance_remarks": [
      {
        "date": "string",
        "employeeId": "string",
        "reviewerName": "string",
        "review_title": "string",
        "review_purpose": "string",
        "review_rating": 0,
        "task": "string",
        "work_done": "string",
        "blockages": "string",
        "accomplishments": "string",
        "training": "string",
        "durationOfOverTime": 0
      }
    ],
    "history_payroll": [
      {
        "allowances": 0,
        "deductions": 0,
        "status": "pending",
        "payment_dates": "string"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": {
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }
  }
  }
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Please provide all the required fields."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in adding the employee',
    }
}
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee added successfully.",
        "data":
           {
  "hospitalId": "string",
  "ContactDetails": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "employeeId": "string"
  },
  "HR":{
    "joining_date": "string",
    "total_payable_salary": 0,
    "total_paid_salary": 0,
    "leaving_date": "string",
    "salary": 0,
    "role": "admin",
    "department": "string",
    "supervisor": "string",
    "no_of_leave": 0,
    "no_of_absent": 0,
    "attendance": [
      {
        "date": "string",
        "checkInTime": "string",
        "checkOutTime": "string",
        "onLeave": true,
        "leave_reason": "string",
        "absent": true,
        "approved": true,
        "leaveType": "casual leave"
      }
    ],
    "performance_remarks": [
      {
        "date": "string",
        "employeeId": "string",
        "reviewerName": "string",
        "review_title": "string",
        "review_purpose": "string",
        "review_rating": 0,
        "task": "string",
        "work_done": "string",
        "blockages": "string",
        "accomplishments": "string",
        "training": "string",
        "durationOfOverTime": 0
      }
    ],
    "history_payroll": [
      {
        "allowances": 0,
        "deductions": 0,
        "status": "pending",
        "payment_dates": "string"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": {
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }
  }
  }
}
```

### url: /api/hr/updateEmployee?id={id}

method: **POST**

requestBody:
{
    "hospitalId": <*string*>"hos_7BA7CF",
    "employeeId": <*string*>"emp_11BA72",
    "name": <*string*>"John Doe",
    "date_of_birth": <*string*>"1990-01-01",
    "gender": <*string*>"male",
    "phoneNumber": <*string*>"1234567890",
    "email": <*string*>"johnDoe123@gamil.com",
    "address": <*string*>"123, abc street, xyz city",
    "joining_date": <*string*>"2020-01-01",
    "leaving_date": <*string*> | null,
    "salary": <*number*>10000,
    "role": <*string*>"driver",
    "department": <*string*>"surgery",
    "supervisor": <*string*>"Dr. Smith",
    "no_of_leave": <*number*>0,
    "leave_on_date": <*string*>[],
    "no_of_absent": <*number*>0,
    "absent_on_date": <*string*>[] | *null*,
    "leave_reason": <*string*>[] | *null*,
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
    ]
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in updating the employee',
    }
}
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
[
    {
        "success": true,
        "message": "Employee updated successfully.",
        "data":{

        }
    }
]
```


### url: /api/hr/deleteEmployee?id={id}

method: **POST**

requestBody:{
    null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in deleting the employee',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee deleted successfully."
    }
}
```


### url: /api/hr/updatePendingPayroll?hospitalId=hos_7BA7CF&id={mongoid}

method: **POST**

requestBody:   {
  "hospitalId": "string",
  "ContactDetails": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "employeeId": "string"
  },
  "HR":{
    "joining_date": "string",
    "total_payable_salary": 0,
    "total_paid_salary": 0,
    "leaving_date": "string",
    "salary": 0,
    "role": "admin",
    "department": "string",
    "supervisor": "string",
    "no_of_leave": 0,
    "no_of_absent": 0,
    "attendance": [
      {
        "date": "string",
        "checkInTime": "string",
        "checkOutTime": "string",
        "onLeave": true,
        "leave_reason": "string",
        "absent": true,
        "approved": true,
        "leaveType": "casual leave"
      }
    ],
    "performance_remarks": [
      {
        "date": "string",
        "employeeId": "string",
        "reviewerName": "string",
        "review_title": "string",
        "review_purpose": "string",
        "review_rating": 0,
        "task": "string",
        "work_done": "string",
        "blockages": "string",
        "accomplishments": "string",
        "training": "string",
        "durationOfOverTime": 0
      }
    ],
    "history_payroll": [
      {
        "allowances": 0,
        "deductions": 0,
        "status": "pending",
        "payment_dates": "string"
      }
    ],
    "shift": "morning",
    "actual_working_hours": 0,
    "extra_working_hours": 0,
    "dutyRoster": {
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }
  }
  }

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "No pending payrolls found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in updating the payrolls',
    }
}
```


RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Payrolls updated successfully."
    }
}
```

### url: /api/hr/updateAttendance?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f
method: **POST**

// only one at a time
requestBody: {
    "isCheckIn": true,  OR "isCheckOut": true,
}

#### Returns:
- **Status 200 (OK)**: The attendance was successfully updated.
  - Example response:
    ```json
    {
      "success": true,
      "message": "Attendance updated successfully",
      "data": {
        // The updated employee document
      }
    }
    ```
- **Status 404 (Not Found)**: The specified employee was not found.
  - Example response:
    ```json
    {
      "success": false,
      "message": "Employee not found."
    }
    ```
- **Status 400 (Bad Request)**: The employee attempted to check out without checking in first.
  - Example response:
    ```json
    {
      "success": false,
      "message": "Please check in first"
    }
    ```
- **Status 500 (Internal Server Error)**: There was an error while updating the attendance.
  - Example response:
    ```json
    {
      "success": false,
      "message": "Error in updating the attendance",
      "error": "Detailed error message"
    }
    ```



### url: /api/hr/markLeave?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f

method: **POST**

<!-- for single date -->
requestBody:{
    startDate: <*string*>"2021-01-01",
    endDate: <*string*>"",
    onLeave: <*boolean*>true,
    leave_reason: <*string*>".....",
    leaveType: <*string*>"casual leave"
}

<!-- for multiple dates -->
requestBody:{
    startDate: <*string*>"2021-01-01",
    endDate: <*string*>"2021-01-05",
    onLeave: <*boolean*>true,
    leave_reason: <*string*>"....."
}


RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in marking the leave',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Leave marked successfully."
    }
}
```

### url: /api/hr/approveLeave?hospitalId=hos_7BA7CF&leaveid=66c4cb75759f49d9c996aa8f&approved=rejected || approved || pending

method: **POST**

requestBody:{
    null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in approving the leave',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Leave approved successfully."
    }
}
```

### url: /api/hr/getAllLeave?hospitalId=hos_7BA7CF

method: **GET**


RESPONSE: <br><br>

STATUS: 404<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "No leaves found."
    }
}
```


RESPONSE: <br><br>

STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in fetching the leaves',
    }
}
```

RESPONSE: <br><br>

STATUS: 200<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Leaves fetched successfully.",
        "data":
        [
            {
                "date": "string",
                "employeeId": "string",
                "onLeave": true,
                "leave_reason": "string",
                "approved": true
            }
        ]
    }
}
```


### url: /api/hr/getDutyRoster?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f

method: **GET**

requestBody:{
    null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found.",
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in fetching the duty roster',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Duty roster fetched successfully.",
        "data":
        [
            {
                "date": "string",
                "shift": "morning",
                "employeeId": "string",
                "location": "string",
                "availability": true
            }
        ]
    }
}
```

### url: /api/hr/updateDutyRoster?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f&date=2021-01-01

method: **POST**

requestBody:{
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in updating the duty roster',
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Duty roster updated successfully."
    }
}
```

### url: /api/hr/addDutyRoster

method: **POST**

requestBody:{
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }

RESPONSE: <br><br>
STATUS: 400<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Please provide all the required fields."
    }
}
```

RESPONSE: <br><br>

STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in adding the duty roster',
    }
}
```

RESPONSE: <br><br>

STATUS: 201<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Duty roster added successfully."
    }
}
```
### url: /api/hr/updateDutyRoster?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f&date=2021-01-01

method: **POST**

requestBody:{
      "date": null,
      "shift": "morning",
      "employeeId": "emp_9NZ",
      "location": "ward-1",
      "availability": true,
      "start":"2024-09-01T09:00:00.000Z",
      "end":"2024-09-01T11:30:00.000Z",
    }

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in updating the duty roster',
    }
}
```

RESPONSE: <br><br>

STATUS: 200<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Duty roster updated successfully."
    }
}
```

### url: /api/hr/getGazettedLeaves?hospitalId=hos_7BA7CF 

method: **GET**

requestBody:{
    null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "No gazetted leaves found."
    }
}
```

RESPONSE: <br><br>

STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in fetching the gazetted leaves',
    }
}
```

RESPONSE: <br><br>

STATUS: 200<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Gazetted leaves fetched successfully.",
        "data":
        [
            {
                "date": "string",
                "leave_reason": "string"
            }
        ]
    }
}
```



### url: /api/hr/addAndUpdatePerformanceRemark?hospitalId=hos_1A3D31&id=66e86539c266e2838f7cc8f7&date=""

method: **POST**

requestBody:{
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

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>

STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in adding the performance remark',
    }
}
```

RESPONSE: <br><br>

STATUS: 201<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Performance remark added successfully."
    }
}
```


### url: /api/hr/addHistoryPayrolls?hospitalId=hos_7BA7CF&id=66c4cb75759f49d9c996aa8f

method: **POST**

requestBody:{
    "allowances": <*number*>1000,
    "deductions": <*number*>500,
    "status": <*string*>"paid",
    "payment_dates": <*string*>"2021-01-01"
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>

STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in adding the history payrolls',
    }
}
```

RESPONSE: <br><br>

STATUS: 201<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "History payrolls added successfully."
    }
}
```

### url: /api/hr/onBoardDoctor?/api/hr/onBoardDoctor?hospitalId=hos_1A3D31&id=66efb813dddaef0b52575a74

method: **POST**

requestBody:{
  "doctorName": "Alok Tiwari",
  "username": "Alok_Tiwari@medoc",
  "phoneNumber": "9926778966",
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Employee not found."
    }
}
```

RESPONSE: <br><br>

STATUS: 500<br>

```yaml

response body:
{
    {
        success: false,
        message: 'Error in onboarding the doctor',
    }
}
```

RESPONSE: <br><br>

STATUS: 201<br>

```yaml

response body:
{
    {
        "success": true,
        "message": "Doctor onboarded successfully."
    }
}
```
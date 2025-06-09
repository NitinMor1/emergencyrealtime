### Documentation for Developer 

### payload
```json
{
    "hospitalId":"hos-7BA7CF",
    "message": "string",
    "sender": "string",
    "receiver": "string",
    "timestamp": "string"
}
```

### url: /api/chats/send
### method: POST

### request body
```json
{
    "hospitalId":"hos-7BA7CF",
    "message": "string",
    "sender": "{nurse "employeeId" / doctor "username"}",
    "receiver": " {nurse "employeeId"/ doctor "username"}",
    "timestamp": "ISODATE TIME"
}
```

### response
```json
{
    "status": "success",
    "message": "Chat added successfully"
}
```

### url: /api/chats/get?hospitalId=hos_7BA7CF&sender={nurse "employeeId" / doctor "username"}&receiver={nurse "employeeId" / doctor "username"}
### method: GET

### request query
```json
{
    "hospitalId":"hos-7BA7CF",
    "sender": "{nurse / doctor "username"}",
    "receiver": " {nurse / doctor "username"}"
}
```

### response
```json
{
    "status": "success",
    "message": "Chat fetched successfully",
    "data": [
        {
            "message": "string",
            "sender": "{nurse "employeeId" / doctor "username"}",
            "receiver": " {nurse "employeeId"/ doctor "username"}",
            "timestamp": "ISODATE TIME"
        }
    ]
}
```


ERROR:
```json
{
    "status": 500,
    "message": "internal server error"
}
```
```JSON 
{
    "status": 200,
    "message": "Chat fetched successfully",
}
```

### url: /api/chats/getNursesChat?hospitalId=hos_7BA7CF
### method: GET

### request query
```json
{
    "hospitalId":"hos-7BA7CF"
}
```



### response
```json
{
    "status": "success",
    "message": "Chat fetched successfully",
    "data": [
        {
            "name": "nurse.name",
            "employeeId": "nurse.employeeId",
        }
    ]
}
```

ERROR:
```json
{
    "status": 500,
    "message": "internal server error"
}
```
```JSON 
{
    "status": 404,
    "message": "No nurse found",
}
```JSON 
{
    "status": 200,
    "message": "Chat fetched successfully",
}
```


### url: /api/chats/getDoctorChat?hospitalId=hos_7BA7CF

### method: GET

### request query
```json
{
    "hospitalId":"hos-7BA7CF"
}
```

### response
```json
{
    "status": "success",
    "message": "Chat fetched successfully",
    "data": [
        {
            "name": "doctor.name",  
            "username": "doctor.username"
        }
    ]
}
```

ERROR:
```json
{
    "status": 500,
    "message": "internal server error"
}
```
```JSON 
{
    "status": 404,
    "message": "No doctor found",
}
```JSON 
{
    "status": 200,
    "message": "Chat fetched successfully",
}
```

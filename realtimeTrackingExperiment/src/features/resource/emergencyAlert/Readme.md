# Documentation of routes for devs

# emergency routes & payload

```yaml
    hospitalId: hos_7BA7CF,
    doctorUsername: doc_7BA7CF,
    message: "Patient is in critical condition",
    status: "Critical"
```

### url: api/alert/createAlert

method: **POST**
```yaml
requestBody: {
    {
    "hospitalId": <*String*>"hos_7BA7CF",
    "doctorUsername":<*String*> "doc_7BA7CF",
    "message": <*String*>"Patient is in critical condition",
    "status": <*alertStatus*>"Critical",
    }
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
responseBody: {
    {
        success: "true",
        message: "All fields are required",
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body: {
    {
        success: "true",
        message: "Alert added successfully",
    }
}
```

```yaml
response body: {
    { 
    "success": "false",
    "message": "Error in adding alert", 
    }
}
```

### url: api/alert/getAlerts?hospitalId=hos_7BA7CF

method: **GET**

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body: {
    {
        success: "true",
        message: "Alerts fetched successfully",
        alerts: [
            {
                hospitalId: "hos_7BA7CF",
                doctorUsername: "doc_7BA7CF",
                message: "Patient is in critical condition",
                status: "Critical"
            }
        ]
    }
}
```

Response: <br><br>
STATUS: 404<br>

```yaml
response body: {
    { 
    "success": "true",
    "message": "No alerts found", 
    }
}
```

Response: <br><br>
STATUS: 500<br>

```yaml
response body: {
    { 
    "success": "false",
    "message": "Error in fetching alerts", 
    }
}
```

### url: api/alert/deleteAlert?hospitalId=hos_7BA7CF&id={mongoid}

method: **POST**

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body: {
    {
        success: "true",
        message: "Alert deleted successfully",
    }
}
```

Response: <br><br>
STATUS: 404<br>

```yaml
response body: {
    { 
    "success": "true",
    "message": "No alerts found", 
    }
}
```

Response: <br><br>
STATUS: 500<br>

```yaml
response body: {
    { 
    "success": "false",
    "message": "Error in deleting alert", 
    }
}
```


### url: api/alert/updateAlert?hospitalId=hos_7BA7CF&id={mongoid}

method: **POST**
```yaml
requestBody: {
    {
    "hospitalId": <*String*>"hos_7BA7CF",
    "doctorUsername":<*String*> "doc_7BA7CF",
    "message": <*String*>"Patient is in critical condition",
    "status": <*alertStatus*>"Critical",
    }
}
```
RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body: {
    {
        success: "true",
        message: "Alert updated successfully",
    }
}
```

Response: <br><br>
STATUS: 404<br>

```yaml
response body: {
    { 
    "success": "true",
    "message": "No alerts found", 
    }
}
```

Response: <br><br>
STATUS: 500<br>

```yaml
response body: {
    { 
    "success": "false",
    "message": "Error in updating alert", 
    }
}
```
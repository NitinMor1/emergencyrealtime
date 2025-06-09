# Documentation of routes for devs

# payload 
```json
{
  "hospitalId": "hos_7BA7CF",
  "creatorId": "cre_12GH45",
  "assignedTo": "ass_09GJ98",
  "title": "testing the errors",
  "description": "testing the all fields required error",
  "status": "Pending"
}
```

# Todo Routes

### url: /api/todo/get?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
<*query*> hospitalId=hos_7BA7CF
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "No task found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching the task" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Todo fetched successfully.",
      "data":
        [
          {
            "_id": "66540b0c9c385d3f91cce72a",
            "hospitalId": "hos_7BA7CF",
            "creatorId": "cre_12GH45",
            "assignedTo": "ass_09GJ98",
            "title": "testing the errors",
            "description": "testing the all fields required error",
            "status": "Pending",
          },
        ],
    },
  }
```

### url: /api/todo/add?hospitalId=hos_7BA7CF

method: **POST**
```yaml
requestBody: {
"hospitalId": "hos_7BA7CF",
"creatorId": "cre_12GH45",
"assignedTo": "ass_09GJ98",
"title": "testing the errors",
"description": "testing the all fields required error",
"status": "Pending"
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
{ success: false, message: "Error in creating a task" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Task created successfully.",
      "data":
        {
          "_id": "66540b0c9c385d3f91cce72a",
          "hospitalId": "hos_7BA7CF",
          "creatorId": "cre_12GH45",
          "assignedTo": "ass_09GJ98",
          "title": "testing the errors",
          "description": "testing the all fields required error",
          "status": "Pending",
        },
    },
  }
```

### url: /api/todo/update?id={id}&hospitalId=hos_7BA7CF

method: **POST**
```yaml
requestBody: {
"hospitalId": "hos_7BA7CF",
"creatorId": "cre_12GH45",
"assignedTo": "ass_09GJ98",
"title": "testing the errors",
"description": "testing the all fields required error",
"status": "Pending"
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: false, message: "Task not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in updating a task" }
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Task updated successfully.",
      "data":
        {
          "_id": "66540b0c9c385d3f91cce72a",
          "hospitalId": "hos_7BA7CF",
          "creatorId": "cre_12GH45",
          "assignedTo": "ass_09GJ98",
          "title": "testing the errors",
          "description": "testing the all fields required error",
          "status": "Pending",
        },
    },
  }
```

### url: /api/todo/delete?id={id}&hospitalId=hos_7BA7CF

method: **POST**
```yaml
requestBody: {
"hospitalId": "hos_7BA7CF",
"creatorId": "cre_12GH45",
"assignedTo": "ass_09GJ98",
"title": "testing the errors",
"description": "testing the all fields required error",
"status": "Pending"
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: false, message: "Task not found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in deleting a task" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Task deleted successfully.",
      "data":
        {
          "_id": "66540b0c9c385d3f91cce72a",
          "hospitalId": "hos_7BA7CF",
          "creatorId": "cre_12GH45",
          "assignedTo": "ass_09GJ98",
          "title": "testing the errors",
          "description": "testing the all fields required error",
          "status": "Pending",
        },
    },
  }
```

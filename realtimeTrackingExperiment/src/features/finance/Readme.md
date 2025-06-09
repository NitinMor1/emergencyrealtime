# Finance Routes

### url: /api/finance/getTotalFinance?hospitalId=hos_7BA7CF

method: **GET**
requestBody : {
}

RESPONSE: <br><br>
STATUS: 500 <br>
Response Body :

```json
{
  "success": "false",
  "message": "Internal Server Error"
}
```

STATUS: 200<br>
Response Body :

```yaml
{
  "success": "true",
  "message": "Finance updated successfully",
  "date":
    { 
        "hospitalId": "hos_7BA7CF", 
        "amountPending": 0, 
        "outgoingAmount": 0 
    },
}
```

### Documentation of routes for devs

# Account Routes

### url: /api/account/updateAccount?hospitalId=hos_7BA7CF


method: **POST**
```yaml
requestBody: {
  {
    name: <*string*>"John Doe",
    email: <*string*>"john@gmail.com",
    phoneNumber: <*string*>"+91-1234567890",
    address: <*string*>"123 Health Street, Cityville",
    wards: <*string[]*> ["ward1", "ward2"],
    beds: <*number*>10,
  }
}
```
```yaml
RESPONSE: <br><br>
Status: 201
{
  "status": "success",
  "message": "Account updated successfully",
}
```

```yaml
RESPONSE: <br><br>
Status: 404
{
  "status": "true",
  "message": "Account details not found",
}
```
```yaml
RESPONSE: <br><br>
Status: 500
{
  "status": "false",
  "message": "Error in updating account details",
}
```
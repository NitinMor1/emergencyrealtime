# Documentation of routes for devs

# Payload
```yaml
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
```

# Equipments Routes

### url: /api/equipment/addEquipments

method: **POST**
```yaml
requestBody : {
"hospitalId": <*string*> : "hos_7BA7CF",
"itemId": <*string*>"equip_123",
"name": <*string*> "stethoscope",
"type": <*ITEMTYPE*>"device",
"roomId": <*string*> "room_12BC23",
"issuedOn": <*string*> "2022-12-12",
"returnedOn": <*string*> "2022-12-12",
"issuedFrom": <*string*> "hos_7BA7CF",
"issuedTo": <*string*> "hos_7BA7CF",
"quantity": <*number*>100
}
```

RESPONSE: <br><br>
STATUS: 400 <br>


```yaml
Response Body :
{
  "success": "true",
  "message": "all fields are required"
}
```

STATUS: 201<br>

```yaml
Response Body :
{
  "message": "Equipment added successfully",
  "data":
    {
      "equipmentId": "equip_123",
      "name": "stethoscope",
      "type": "device",
      "roomId": "room_12BC23",
      "issuedOn": "2022-12-12",
      "returnedOn": "2022-12-12",
      "issuedFrom": "hos_7BA7CF",
      "issuedTo": "hos_7BA7CF",
      "quantity": 100,
    },
}
```

### url: /api/equipment/getEquipments?hospitalId=hos_7BA7CF

method: **GET**
RequestBody:{
  <*query*> hospitalId=hos_7BA7CF
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "success": "true", "message": NO Equipment Found }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "false", "message": "Error in fetching the equipment" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response Body:
  {
    "message": "Equipment fetched successfully",
    "data":
      [
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
          "quantity": 100,
        },
      ],
  }
```

### url: /api/equipment/updateEquipments?hospitalId=hos_7BA7CF&id={id}

method: **POST**
```yaml
requestBody : {
"hospitalId": <*string*> : "hos_7BA7CF",
"itemId": <*string*>"equip_123",
"name": <*string*> "stethoscope",
"type": <*ITEMTYPE*>"device",
"roomId": <*string*> "room_12BC23",
"issuedOn": <*string*> "2022-12-12",
"returnedOn": <*string*> "2022-12-12",
"issuedFrom": <*string*> "hos_7BA7CF",
"issuedTo": <*string*> "hos_7BA7CF",
"quantity": <*number*>100
}
```
RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "success": "true", "message": "No Equipment found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in updating equipments" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response Body:
  {
    "message": "Equipment updated successfully",
    "data":
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
          "quantity": 100,
      },
  }
```

### url: /api/equipment/deleteEquipment?hospitalId=hos_7BA7CF&id={id}

method: **POST**
requestBody : {
NULL
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ "success": "true", "message": "No equipment found" }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ "success": "true", "message": "Error in deleting the equipment" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
Response Body:
  {
    "message": "Equipment deleted successfully",
    "data":
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
          "quantity": 100,
      },
  }
```

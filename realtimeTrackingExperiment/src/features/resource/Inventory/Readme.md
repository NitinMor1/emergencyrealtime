# Documentation of routes for devs

# payload

```json
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
```


# Inventory Routes

### url: /api/inventory/getAllItems?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
<*query*> hospitalId=hos_7BA7CF
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "No item found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching the item" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Items fetched successfully.",
      "data":
        [
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
        },
        ],
    },
  }
```

### url: /api/inventory/getAllMedicine?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "No medicine found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching the medicine" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Medicine fetched successfully.",
      "data":
        [
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
        },
        ],
    },
  }
```

### url: /api/inventory/getAllDevice?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
null
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "No device found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching the device" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Device fetched successfully.",
      "data":
        [
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
        },
        ],
    },
  }
```

### url: /api/inventory/createItem

method: **POST**
```yaml
requestBody:
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
```
RESPONSE: <br><br>
STATUS: 401<br>

```yaml
response body:
{
    {
        success: false,
        message: 'All fields are required',
    }
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body:
{
success: false,
message: "Expiry is required for medicine.",
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body:
{
    success: false,
    message: "Invalid subType for medicine.",
}
```

RESPONSE: <br><br>
STATUS: 400<br>

```yaml
response body:
{
    success: false,
    message: "Invalid subType for device.",
}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
response body:
{
    {
        success: false,
        message: 'Error in adding the item',
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
        "message": "Item created successfully.",
        "data":
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
    }
}
```

### url: /api/inventory/updateItem?id={id}&hospitalId=hos_7BA7CF

method: **POST**
```yaml
requestBody:
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
```
RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body:
{
    {
        "success": true,
        "message": "Item not found."
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
        message: 'Error in updating the item',
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
        "message": "Item updated successfully.",
        "data":
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
    }
]
```

### url: /api/inventory/deleteItem?id={id}&hospitalId=hos_7BA7CF

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
        success: true,
        message: "Item not found.",
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
        message: 'Error in deleting the item',
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
        "message": "Item deleted successfully.",
        "data":
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
    }
]
```

### url: /api/inventory/getItemById?hospitalId=hos_7BA7CF

method: **GET**

requestBody:{
  <*query*> hospitalId=hos_7BA7CF
}

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{ success: true, message: "Item not found." }
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{ success: false, message: "Error in fetching a item" }
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body:
  {
    {
      "success": true,
      "message": "Item fetched successfully.",
      "data":
        [
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
          },
        ],
    },
  }
```
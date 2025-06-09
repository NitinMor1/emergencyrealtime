# Documentation of routes for devs

# Invoice Routes

### url: /api/invoice/generateInvoice

method: **POST**

```yaml
requestBody: {
  {
    trnId: <*string*>"TRN_123",
    hospitalId: <*string*>"hos_7BA7CF",
    customerName: <*string*>"John Doe",
    customerUsername: <*string*> | <*undefined*>"cus_7BA7CF",
    type: <*TRNTYPE*>"internal",
    date: <*string*> | <*Date*>"2021-10-10",
    totalAmount: <*number*>10000,
    packaging: <*number*>1000,
    freight: <*number*>500,
    taxable_amount: <*number*>100,
    tax_collected_at_source: <*number*>10,
    round_off: <*number*>0,
    grand_total: <*number*>11110,
    method_of_payment: <*string*>"Cash",
    contents:[
        {
            "itemType": <*ITEMTYPE*>"medicine",
            "name": <*string*>"Paracetamol",
            "expiry": <*string*> | <*null*>"2022-01-01",
            "batchNo": <*string*>"BATCH-001",
            "hsnNo": <*string*>"HSN-001",
            "sgst": <*number*>5,
            "cgst": <*number*>5,
            "packing": <*string*>"30ml bottle",
            "subType": <*string*>"tablet",
            "quantity": <*SUBTYPE*>10,
            "price": <*number*>100,
            "amount": <*number*>1000
        },{
            "itemType": <*ITEMTYPE*>"medicine",
            "name": <*string*>"Paracetamol",
            "expiry": <*string*> | <*null*>"2022-01-01",
            "batchNo": <*string*>"BATCH-001",
            "hsnNo": <*string*>"HSN-001",
            "sgst": <*number*>5,
            "cgst": <*number*>5,
            "packing": <*string*>"30ml bottle",
            "subType": <*string*>"tablet",
            "quantity": <*SUBTYPE*>10,
            "price": <*number*>100,
            "amount": <*number*>1000
        }
    ],
    paymentStatus: <*string*>pending,
    inventoryId: <*string*>inv_7BA7CF
    }
  }
```

RESPONSE: <br><br>
STATUS:500<br>

```yaml
 { 
  success: false, 
  message: "Error in generating invoice."
  }
```


RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body: {
    {
        "success": true,
        "message": "Invoice generated successfully."
        "data":{
    "trnId": "TRN-0001",
    "hospitalId": "hos_7BA7CF",
    "customerName": "John Doe", 
    "customerUsername": "CUST-0001",
    "type": "internal",
    "date": "2022-01-01",
    "totalAmount": 1000,
    "packaging": 100,
    "freight": 100,
    "taxable_amount": 1000,
    "tax_collected_at_source": 100,
    "round_off": 0,
    "grand_total": 1200,
    "method_of_payment": "cash",
    "contents": [
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        },
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        }
    ],
    "paymentStatus": "pending",
    "inventoryId": "inv_7BA7CF"
}
}
```

### url: /api/invoice/getInvoices?hospitalId=hos_7BA7CF

method: **GET**

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
response body: {
    {
        "success": true,
        "message": "Invoices not found."
    }
}
```

RESPONSE: <br><br>
STATUS: 200<br>

```yaml
response body: {
    {
        "success": true,
        "message": "Invoices fetched successfully.",
        "data":
            [
                {
                    "trnId": "TRN-0001",
                    "hospitalId": "hos_7BA7CF",
                    "customerUsername": "CUST-0001",
                    "type": "internal",
                    "date": "2022-01-01",
                    "totalAmount": 1000,
                    "packaging": 100,
                    "freight": 100,
                    "taxable_amount": 1000,
                    "tax_collected_at_source": 100,
                    "round_off": 0,
                    "grand_total": 1200,
                    "method_of_payment": "cash",
                    "contents": [
                        {
                            "itemType": "medicine",
                            "name": "Paracetamol",
                            "expiry": "2022-01-01",
                            "batchNo": "BATCH-001",
                            "hsnNo": "HSN-001",
                            "sgst": 5,
                            "cgst": 5,
                            "packing": "30ml bottle",
                            "subType": "tablet",
                            "quantity": 10,
                            "price": 100,
                            "amount": 1000
                        },
                        {
                            "itemType": "medicine",
                            "name": "Paracetamol",
                            "expiry": "2022-01-01",
                            "batchNo": "BATCH-001",
                            "hsnNo": "HSN-001",
                            "sgst": 5,
                            "cgst": 5,
                            "packing": "30ml bottle",
                            "subType": "tablet",
                            "quantity": 10,
                            "price": 100,
                            "amount": 1000
                        }
                    ]
                    "paymentStatus": "pending",
                    "inventoryId": "inv_7BA7CF"
                }
            ],
    },
}
```


### url: /api/invoice/updateInvoice?hospitalId=hos_7BA7CF&id={mongo id}

method: **POST**

```yaml
requestBody: {
  {
    trnId: <*string*>"TRN_123",
    hospitalId: <*string*>"hos_7BA7CF",
    customerName: <*string*>"John Doe",
    customerUsername: <*string*>"cus_7BA7CF",
    type: <*TRNTYPE*>"internal",
    date: <*string*>"2021-10-10",
    totalAmount: <*number*>10000,
    packaging: <*number*>1000,
    freight: <*number*>500,
    taxable_amount: <*number*>100,
    tax_collected_at_source: <*number*>10,
    round_off: <*number*>0,
    grand_total: <*number*>11110,
    method_of_payment: <*string*>"Cash",
    contents:[
        {
            "itemType": <*ITEMTYPE*>"medicine",
            "name": <*string*>"Paracetamol",
            "expiry": <*string*>"2022-01-01",
            "batchNo": <*string*>"BATCH-001",
            "hsnNo": <*string*>"HSN-001",
            "sgst": <*number*>5,
            "cgst": <*number*>5,
            "packing": <*string*>"30ml bottle",
            "subType": <*string*>"tablet",
            "quantity": <*SUBTYPE*>10,
            "price": <*number*>100,
            "amount": <*number*>1000
        },{
            "itemType": <*ITEMTYPE*>"medicine",
            "name": <*string*>"Paracetamol",
            "expiry": <*string*>"2022-01-01",
            "batchNo": <*string*>"BATCH-001",
            "hsnNo": <*string*>"HSN-001",
            "sgst": <*number*>5,
            "cgst": <*number*>5,
            "packing": <*string*>"30ml bottle",
            "subType": <*string*>"tablet",
            "quantity": <*SUBTYPE*>10,
            "price": <*number*>100,
            "amount": <*number*>1000
        }
    ],
    "paymentStatus": "pending",
    "inventoryId": "inv_7BA7CF"
    }
}
```

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{success: false, message: "Invoice not found."}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{success: false, message: "Error in updating invoice."}
```

RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body: {
    {
        "success": true,
        "message": "Invoice updated successfully."
        "data":{
    "trnId": "TRN-0001",
    "hospitalId": "hos_7BA7CF",
    "customerName": "John Doe", 
    "customerUsername": "CUST-0001",
    "type": "internal",
    "date": "2022-01-01",
    "totalAmount": 1000,
    "packaging": 100,
    "freight": 100,
    "taxable_amount": 1000,
    "tax_collected_at_source": 100,
    "round_off": 0,
    "grand_total": 1200,
    "method_of_payment": "cash",
    "contents": [
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        },
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        }
    ],
    "paymentStatus": "pending",
    "inventoryId": "inv_7BA7CF"
}
}
```


### url: /api/invoice/deleteInvoice?hospitalId=hos_7BA7CF&id={mongo id}

method: **POST**

RESPONSE: <br><br>
STATUS: 404<br>

```yaml
{success: false, message: "Invoice not found."}
```

RESPONSE: <br><br>
STATUS: 500<br>

```yaml
{success: false, message: "Error in deleting invoice."}
```


RESPONSE: <br><br>
STATUS: 201<br>

```yaml
response body: {
    {
        "success": true,
        "message": "Invoice deleted successfully."
    }
}
```

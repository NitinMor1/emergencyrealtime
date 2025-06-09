### Dev Documentation for PdfUpload


# url: /api/appointment/upload
# Method: POST

```json
Request Body:
{
    "hospitalId": "hos_7BA7CF",
    "title":"pdf1",
    "file": file.pdf
}
```

Error Response:
```json
{
    "status": 400,
    "message": "File not uploaded"
}
```

Error Response:
```json
{
    "status": 500,
    "message": "Internal Server Error"
}
```

Success Response:
```json
{
    "status": 200,
    "message": "File uploaded successfully"
}
```

# url: /api/appointment/getPdfsList?hospitalId=hos_1A3D31
# Method: GET

Error Response:
```json
{
    "status": 404,
    "message": "No pdfs found"
}
```

```json
{
    "status": 500,
    "message": "Internal Server Error"
}
```
Success Response:
```json
{
    "success": true,
    "message": "List of PDFs retrieved successfully",
    "data": [
        {
            "id": "66c0ec7e1b1bceee6d0ce4a8",
            "filename": "DT20245575581_Application (1).pdf",
            "uploadDate": "2024-08-17T18:31:27.980Z",
            "size": 30723,
            "metadata": {
                "hospitalId": "hos_7BA7CF",
                "title": "Pdf1"
            }
        }
    ]
}
```

# url: /api/appointment/downloadPdf/hos_7BA7CF/66c0ec7e1b1bceee6d0ce4a8
# Method: GET
Error Response:
```json
{
    "status": 404,
    "message": "Pdf not found"
}
```

```json
{
    "status": 500,
    "message": "Internal Server Error"
}
```
<!-- This route will download the pdf file give it a try and run it on google chrome -->



# url: /api/appointment/deletePdf/hos_7BA7CF/{mongo Object Id}
# Method: POST

Error Response:
```json
{
    "status": 404,
    "message": "Pdf not found"
}
```

```json
{
    "status": 500,
    "message": "Internal Server Error"
}
```

Success Response:
```json
{
    "status": 200,
    "message": "Pdf deleted successfully"
}
```

<!-- This route can only change the metadata not the pdf file you need to delete and then reupload the file -->

# url: /api/appointment/updatePdf/hos_7BA7CF/{mongo Object Id}
# Method: POST

```json
Request Body{
    "title":"pdf1",
}
```
```
request query:
{
    "hospitalId": "hos_7BA7CF",
    "title":"pdf1",
    "fileId": {mongo Object Id} 
}
```

Error Response:
```json
{
    "status": 404,
    "message": "Pdf not found"
}
```

```json
{
    "status": 500,
    "message": "Internal Server Error"
}
```

Success Response:
```json
{
    "status": 200,
    "message": "Pdf updated successfully"
}
```


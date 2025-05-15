# JobBuilder Server

This is the backend server for the JobBuilder application.

## Job Categories CSV Import

The system supports importing job categories via CSV file. Here's how to use this feature:

### CSV Format

The CSV file should have the following columns:

- `Name` (required): The name of the job category
- `Description` (optional): A description of the job category
- `ParentCategoryName` (optional): The name of the parent category if this is a subcategory

### Example CSV

```csv
Name,Description,ParentCategoryName
Technology,All technology related jobs,
Software Development,Programming and software engineering jobs,Technology
```

### API Endpoint

**URL**: `/job-categories/upload`
**Method**: `POST`
**Authentication**: Required (HR or Admin role)
**Content-Type**: `multipart/form-data`

The CSV file should be sent as a file field named `file`.

### Response

A successful response will include:

- `success`: Boolean indicating success
- `message`: Success message
- `imported`: Number of successfully imported categories
- `errors`: Array of any categories that could not be imported with reasons

## Running the Server

1. Install dependencies: `npm install`
2. Create a `.env` file with required configuration
3. Run the server: `npm run dev`

## Build

To build the server for production:

```bash
npm run build
```

This will create a `dist` directory with the compiled JavaScript files.

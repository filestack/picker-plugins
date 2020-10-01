# Picker Plugin: Google File Picker

## Requirements:

- clientId - The Client ID obtained from the Google API Console
- developerKey - The Browser API key obtained from the Google API 
- scope - Scope to use to access user's Drive items - (default 'https://www.googleapis.com/auth/drive.file')



## Usage: 

### Importing library:
```js
import { FsGooglePicker } from '@filestack/google-file-picker';

```

### Basic setup: 
```js 
  const googlePickerOption = {
    clientId: 'YOUR_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/drive', // default
    developerKey: 'YOUR_DEVELOPER_KEY',
  };

  const customSource = new plugins.FsGooglePicker(googlePickerOption).toSource();
```

### Usage in picker: 
```js
  const apikey = 'YOUR_API_KEY';
  const client = filestack.init(apikey);
  const options = {
    maxFiles: 20,
    uploadInBackground: false,
    fromSources: [
      'local_file_system',
      'unsplash',
      'url',
      'imagesearch',
      'facebook',
      'instagram',
      customSource, // custom source class
    ],
    onOpen: () => console.log('opened!'),
    onUploadDone: (res) => console.log(res),
  };

  client.picker(options).open();
```

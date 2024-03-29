# Picker Plugin: Example

## Usage: 

### Importing library:
```js
import { FsExamplePicker } from '@filestack/example';

```

### Basic setup: 
```js 
  const customSource = new plugins.FsExample().toSource();
```

### Usage in picker: 
```js
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

<p align="center">
  <a href="https://www.filestack.com"><img src="https://static.filestackapi.com/filestack-js.svg?refresh" align="center" width="250" /></a>  
</p>
<p align="center">
  <strong>Filestack Picker Plugins</strong>
</p>

**Table of Contents**

<!-- toc -->
- [What's in the box?](#whats-in-the-box)
    - [SRI](#sri)
- [Releases Info](#releases-info)
- [Debugging](#debugging)
  - [Node](#node)
  - [Browser](#browser)
- [Versioning](#versioning)
- [Contributing](#contributing)

## What's in the box?

- Google File Picker Plugin [https://github.com/filestack/picker-plugins/tree/develop/packages/google-file-picker]


#### SRI
Subresource Integrity (SRI) is a security feature that enables browsers to verify that files they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched file must match

To obtain sri hashes for filestack-js library check manifest.json file on CDN:

```
https://static.filestackapi.com/picker-plugins/{PLUGIN_NAME}/{LIBRARY_VERSION}/manifest.json
```

```HTML
<script src="//static.filestackapi.com/picker-plugins/{PLUGIN_NAME}/{LIBRARY_VERSION}/{PLUGIN_NAME}.js" integrity="{FILE_HASH}" crossorigin="anonymous"></script>
```

Where ```{LIBRARY_VERSION}``` is currently used library version and ```{FILE_HASH}``` is one of the hashes from integrity field in manifest.json file


## Releases Info

Major releases will bo listed (with detailed examples) in releases folder starting from version 3.0.0


## Debugging

Filestack-js uses [`debug`](https://github.com/visionmedia/debug), so just run with environmental variable `DEBUG` set to `fs.*`.

### Node
```js
DEBUG=fs.* node example_upload.js
```

### Browser
Debug's enable state is persisted by localStorage

```js
localStorage.debug = 'fs:*'
```

And then refresh the page.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags](https://github.com/filestack/picker-plugins/tags) on this repository.

## Contributing

We follow the [conventional commits](https://conventionalcommits.org/) specification to ensure consistent commit messages and changelog formatting.

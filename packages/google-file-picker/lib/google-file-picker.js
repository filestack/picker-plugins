const GOOGLE_DOCS_EXPORT_MAP = {
  'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.google-apps.drawing': 'image/jpeg',
  'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const GOOGLE_API_URL = 'https://apis.google.com/js/api.js';

export class FsGooglePicker {
  constructor({ clientId, developerKey, scope = 'https://www.googleapis.com/auth/drive.readonly' }) {
    this.clientId = clientId;
    this.developerKey = developerKey;
    this.scope = scope;
    this.loaded = false;

    this.loadScript();
  }

  loadScript() {
    const scriptTag = document.createElement('script');
    scriptTag.src = GOOGLE_API_URL;
    scriptTag.onload = () => this.onScripLoaded();

    document.body.appendChild(scriptTag);
  }

  onScripLoaded() {
    gapi.load('auth2', () => {
      gapi.load('picker', () => {
        gapi.load('client', () => {
          gapi.client.load('drive', 'v2', () => {
            this.loaded = true;
          });
        });
      });
    });
  }

  initView(el, actions, options) {
    this.actions = actions;

    const custom = this.createElement();
    el.appendChild(custom);
    return custom;
  }

  unmounted() {}

  createElement() {
    const div = document.createElement('div');
    div.classList.add('fsp-custom-source-button');

    const button = document.createElement('span');
    button.classList.add('fsp-button');
    button.classList.add('fsp-button--primary');

    button.innerHTML = 'Open Google Picker';

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.authorize();
    });

    div.appendChild(button);
    return div;
  }

  authorize() {
    // wait until script will be loaded
    if (!this.loaded) {
      if (!this.retry) {
        this.retry = 1;
      } else {
        if (this.retry > 10) {
          throw new Error('Google api is not loaded');
        }

        this.retry++;
      }

      return setTimeout(() => this.authorize(), 100);
    }

    if (this.oauthToken) {
      this.createPicker();
    } else {
      gapi.auth2.authorize(
        {
          client_id: this.clientId,
          scope: this.scope,
          immediate: false,
        },
        (authResult) => {
          if (authResult && !authResult.error) {
            this.oauthToken = authResult.access_token;
            this.createPicker();
          }
        },
      );
    }
  }

  createPicker() {
    if (!this.picker) {
      this.picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setOAuthToken(this.oauthToken)
        .setDeveloperKey(this.developerKey)
        .setCallback((res) => {
          if (res.action === 'picked') {
            const files = res.docs;

            files.forEach((file) => {
              let url;
              let mimetype;
              let thumbnailLink;

              // export to prefered mimetype
              if (file.mimeType && GOOGLE_DOCS_EXPORT_MAP[file.mimeType] !== undefined) {
                url = `https://content.googleapis.com/drive/v2/files/${file.id}/export?mimeType=${encodeURIComponent(GOOGLE_DOCS_EXPORT_MAP[file.mimeType])}`;
                mimetype = GOOGLE_DOCS_EXPORT_MAP[file.mimeType];
              } else {
                url = `https://www.googleapis.com/drive/v2/files/${file.id}?alt=media`;
              }

              gapi.client.drive.files.get({
                  'fileId' : file.id
              }).then((res) => {
                const file = res.result;

                if (!mimetype) {
                  mimetype = file.mimeType;
                  thumbnailLink =  file.iconLink;
                } else {
                  thumbnailLink = file.thumbnailLink;
                }

                let customOptions = {
                  type: mimetype,
                  display_name: file.title,
                  filename: file.originalFilename || file.title,
                  thumbnail: thumbnailLink,
                  headers: {
                    'Authorization': `Bearer ${this.oauthToken}`,
                  },
                  url
                };

                this.actions.addCustomUrl(customOptions);
              });
            });
          }
        })
        .build();
    }

    this.picker.setVisible(true);

    setTimeout(() => {
      document.querySelector('.picker-dialog').style['z-index'] = parseInt(window.getComputedStyle(document.querySelector('.fsp-picker'))['z-index']) + 1;
    }, 10);

    return this.picker;
  }

  toSource() {
    const t = this;

    return {
      label: 'Google Picker',
      name: 'googlepicker',
      icon:
        '<svg height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><circle cx="18" cy="18" fill="#fff" r="18"/><path d="m27 20h-6.286l-5.714-10h6.286z" fill="#ffd04d"/><path d="m13 26h10.571l3.429-5h-10.857z" fill="#4688f4"/><path d="m9 20.808 3.194 5.192 5.806-9.23-3.484-5.77z" fill="#1da362"/></g></svg>',
      mounted(element, actions, options) {
        t.initView.call(t, element, actions, options);
      },
    };
  }
};

export class FsGooglePicker {

  constructor({ clientId, developerKey, scope }) {
    this.clientId = clientId;
    this.developerKey = developerKey;
    this.scope = scope;

    this.initialized = false;
    this.isAppended = false;
  }

  init() {
    return this.appendApiScript();
  }

  initView(el, actions, options) {
    const custom = this.createElement();
    el.appendChild(custom);
    return custom;
  }

  appendApiScript() {
    if (this.isAppended) {
      return Promise.resolve();
    }

    const script = document.createElement('script');
    script.src = `https://apis.google.com/js/api.js?onload=apiLoadedCallback`;
    script.async = true;
    script.defer = true;

    return new Promise((resolve) => {
      window.apiLoadedCallback = () => {
        gapi.load('auth2', () => {
          gapi.load('picker',() => {
            gapi.load('client',() => {
              this.initialized = true;
              resolve();
            });
          });
        });
      }

      this.isAppended = true;
      document.body.appendChild(script);
    })
  }

  unmounted() {

  }

  createElement() {
    const div = document.createElement('div');
    div.classList.add('fsp-custom-source-button');

    const button = document.createElement('span');
    button.classList.add('fsp-button');
    button.classList.add('fsp-button--primary');

    button.innerHTML = 'Open Google Picker'

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
    if (!this.initialized) {
      this.appendApiScript();

      if (!this.retry) {
        this.retry = 1;
      } else {
        if (this.retry > 10) {
          throw new Error('Google api is not loaded');
        }

        this.retry++;
      }

      return setTimeout(() => this.authorize(), 200);
    }

    if (this.oauthToken) {
      this.createPicker();
    } else {
      gapi.auth2.authorize(
      {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false
      }, (authResult) => {
        if (authResult && !authResult.error) {
          this.oauthToken = authResult.access_token;
          this.createPicker();
        } else {
          console.warn('Cannot authorize user')
        }
      });
    }
  }

  createPicker() {
    if (!this.picker) {
      this.picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.DOCS).
        enableFeature(google.picker.Feature.NAV_HIDDEN).
        setOAuthToken(this.oauthToken).
        setDeveloperKey(this.developerKey).
        setCallback((res) => {
          if (res.action === 'picked') {
            const files = res.docs;

            files.forEach((file) => {
              gapi.client.request({
                  'path': '/drive/v3/files/' + file.id + '?alt=media',
                  'method': 'GET',
                  callback: function (res, resfile) {
                    console.log(res, resfile, 'altmedia');
                    // gapi.client.request({
                    //   'path': '/drive/v2/files/' + file.id + '/export?mimeType=' + res.mimeType,
                    //   'method': 'GET',
                    //     callback: function (res) {
                    //       console.log(res);
                    //     }
                    // });
                  }
              });
            });
          }
        }).

        build();
      }

      this.picker.setVisible(true);

      setTimeout(() => {
        document.querySelector('.picker-dialog').style['z-index'] = parseInt(window.getComputedStyle(document.querySelector('.fsp-picker'))['z-index']) + 1;
      }, 10)

    return this.picker;
  }

  toSource() {
    const t = this;

    return {
      label: 'Google Picker',
      name: 'googlepicker',
      icon: '<svg height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><circle cx="18" cy="18" fill="#fff" r="18"/><path d="m27 20h-6.286l-5.714-10h6.286z" fill="#ffd04d"/><path d="m13 26h10.571l3.429-5h-10.857z" fill="#4688f4"/><path d="m9 20.808 3.194 5.192 5.806-9.23-3.484-5.77z" fill="#1da362"/></g></svg>',
      mounted(element, actions, options) {
        t.initView(element, actions, options).bind(t);
      }
    }
  }
}

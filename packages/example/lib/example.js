const SOURCE_URL = [
  {
    url: 'https://picsum.photos/200/200',
    name: 'Sample image 200x200',
  },
  {
    url: 'https://picsum.photos/300/300',
    name: 'Sample image 300x300',
  },
  {
    url: 'https://picsum.photos/400/400',
    name: 'Sample image 400x400',
  },
  {
    url: 'https://picsum.photos/500/500',
    name: 'Sample image 500x500',
  },
  {
    url: 'https://picsum.photos/600/600',
    name: 'Sample image 600x600',
  },
];

export class FsExample {
  constructor() { }

  toSource() {
    return {
      label: 'My new Custom Source',
      name: 'myCustomSource',
      icon:
          `<svg height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fill-rule="evenodd"><circle cx="18" cy="18" fill="#eee" r="18"/>
                <path
                  d="m9.9 18c0-1.71 1.39-3.1 3.1-3.1h4v-1.9h-4c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9h-4c-1.71
                  0-3.1-1.39-3.1-3.1zm4.1 1h8v-2h-8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39
                  3.1-3.1 3.1h-4v1.9h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="#000" fill-opacity=".7"/>
              </g>
            </svg>`,
      mounted(element, actions) {
        const list = document.createElement('ul');
        list.setAttribute('class', 'fsp-picker--custom-source');

        let toUpload = {};

        const handleClick = (e) => {
          e.stopPropagation();

          const element = e.currentTarget;
          const idx = parseInt(element.dataset.idx);
          const file = sourceUrlsArray[idx];

          if (toUpload[idx]) {
            element.classList.remove('file-selected');
            delete toUpload[idx];
          } else {
            element.classList.add('file-selected');
            toUpload[idx] = file;
          }

          // we can add some state to upload btn if files array is empty
          const finishBtn = document.querySelector('.fsp-picker--custom-source-footer button');
          if (toUpload.length === 0) {
            finishBtn.classList.add('btn-disabled');
          } else {
            finishBtn.classList.remove('btn-disabled');
          }

          return false;
        };

        const handleFinishClick = (e) => {
          e.stopPropagation();

          // if there is no files to upload just do nothing
          if ((!toUpload || Object.keys(toUpload).length === 0) && actions.filesList.length <= 0) {
            return;
          }

          const todo = [];
          // lets take all selected files list and add it to upload queue in picker
          Object.values(toUpload).forEach((file) => todo.push(actions.fetchAndAddUrl(file.url)));

          Promise.all(todo).then(() => {
            console.log('All files has been added to queue');

            // after adding all files to queue we can switch view to upload summary
            actions.showSummaryView();

            // cleanup toUpload object
            toUpload = {};
          });
          return false;
        };

        const handleViewTypeClick = (e) => {
          e.stopPropagation();

          if (element.classList.contains('grid')) {
            element.classList.remove('grid');
          } else {
            element.classList.add('grid');
          }
        };

        SOURCE_URL.forEach((element, idx) => {
          const li = document.createElement('li');
          const span = document.createElement('span');

          li.dataset.idx = idx;
          li.setAttribute('id', `file-${idx}`);

          const thumb = document.createElement('img');
          thumb.setAttribute('src', element.url);

          li.appendChild(thumb);
          span.innerHTML = `${element.name}`;

          li.appendChild(span);

          li.addEventListener('click', handleClick);
          list.appendChild(li);
        });

        // header
        const divHeader = document.createElement('div');
        divHeader.setAttribute('class', 'fsp-picker--custom-source-header');

        let buttonViewType = document.createElement('span');
        buttonViewType.classList.add('view-type');

        divHeader.appendChild(buttonViewType);

        buttonViewType.addEventListener('click', handleViewTypeClick);

        // lets add button that will handle finish selecting file process
        const divFooter = document.createElement('div');
        divFooter.setAttribute('class', 'fsp-picker--custom-source-footer');

        const finishBtn = document.createElement('button');
        finishBtn.innerText = 'View/Edit selected';
        finishBtn.classList.add('btn-disabled');

        if (actions.filesList && actions.filesList.length > 0) {
          finishBtn.classList.remove('btn-disabled');
        }

        const footerSpan = document.createElement('span');
        footerSpan.innerHTML = 'Selected Files: ' + actions.count;

        divFooter.appendChild(footerSpan);
        divFooter.appendChild(finishBtn);

        finishBtn.addEventListener('click', handleFinishClick);

        element.appendChild(divHeader);
        element.appendChild(list);
        element.appendChild(divFooter);
      },
    };
  }
};
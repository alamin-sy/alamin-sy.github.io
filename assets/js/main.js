
(function () {
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.current-year').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  function makeTagList(tags) {
    var list = document.createElement('div');
    list.className = 'tags';
    (Array.isArray(tags) ? tags : []).forEach(function (tag) {
      var item = document.createElement('span');
      item.className = 'tag';
      item.textContent = tag;
      list.appendChild(item);
    });
    return list;
  }

  function makeProjectCard(project, index) {
    var card = document.createElement('a');
    card.className = 'card';
    card.href = project.link || 'work-details.html?id=' + index;
    card.dataset.title = project.title || '';
    card.dataset.tags = (Array.isArray(project.tags) ? project.tags : []).join(' ');

    var image = document.createElement('img');
    image.src = project.image || '';
    image.alt = project.title || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    card.appendChild(image);

    var body = document.createElement('div');
    body.className = 'card-body';
    var title = document.createElement('h3');
    title.textContent = project.title || 'مشروع';
    var description = document.createElement('p');
    description.textContent = project.description || '';
    body.append(title, description);

    if (Array.isArray(project.tags) && project.tags.length) {
      body.appendChild(makeTagList(project.tags));
    }
    card.appendChild(body);
    return card;
  }

  function loadProjectLists(projects) {
    document.querySelectorAll('[data-project-list]').forEach(function (container) {
      var items = container.dataset.projectList === 'latest'
        ? projects.slice().reverse().slice(0, 6)
        : projects;
      container.replaceChildren();

      if (!items.length) {
        var empty = document.createElement('p');
        empty.textContent = 'لا توجد أعمال لعرضها حالياً.';
        container.appendChild(empty);
        return;
      }

      items.forEach(function (project) {
        container.appendChild(makeProjectCard(project, projects.indexOf(project)));
      });
    });

    var search = document.getElementById('search');
    var projectsGrid = document.getElementById('projects');
    if (search && projectsGrid) {
      search.addEventListener('input', function () {
        var query = search.value.trim().toLocaleLowerCase();
        projectsGrid.querySelectorAll('.card').forEach(function (card) {
          var searchable = (card.dataset.title + ' ' + card.dataset.tags).toLocaleLowerCase();
          card.hidden = !searchable.includes(query);
        });
      });
    }
  }

  function safeExternalUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function loadProjectDetails(projects) {
    var container = document.getElementById('projectDetails');
    if (!container) return;

    var id = new URLSearchParams(window.location.search).get('id');
    var index = id === null ? -1 : Number(id);
    var project = Number.isInteger(index) && index >= 0 ? projects[index] : null;
    container.replaceChildren();

    if (!project) {
      var missing = document.createElement('p');
      missing.textContent = 'المشروع غير موجود.';
      container.appendChild(missing);
      return;
    }

    var title = document.createElement('h1');
    title.textContent = project.title || 'تفاصيل المشروع';
    var description = document.createElement('p');
    description.textContent = project.description_long || project.description || '';
    container.append(title, description);

    if (Array.isArray(project.tags) && project.tags.length) {
      var tagsHeading = document.createElement('h2');
      tagsHeading.textContent = 'التقنيات المستخدمة';
      container.append(tagsHeading, makeTagList(project.tags));
    }

    if (Array.isArray(project.screenshots) && project.screenshots.length) {
      var imagesHeading = document.createElement('h2');
      imagesHeading.textContent = 'صور المشروع';
      container.appendChild(imagesHeading);
      var gallery = document.createElement('div');
      gallery.className = 'project-gallery';
      project.screenshots.forEach(function (source) {
        var image = document.createElement('img');
        image.src = source;
        image.alt = project.title || '';
        image.loading = 'lazy';
        gallery.appendChild(image);
      });
      container.appendChild(gallery);
    }

    var externalUrl = project.link1 && project.link1 !== '#'
      ? safeExternalUrl(project.link1)
      : '';
    if (externalUrl) {
      var projectLink = document.createElement('a');
      projectLink.href = externalUrl;
      projectLink.target = '_blank';
      projectLink.rel = 'noopener noreferrer';
      projectLink.textContent = 'رابط المشروع';
      container.appendChild(projectLink);
    }

    var backLink = document.createElement('p');
    var backAnchor = document.createElement('a');
    backAnchor.href = 'portfolio.html';
    backAnchor.textContent = 'العودة إلى جميع الأعمال';
    backLink.appendChild(backAnchor);
    container.appendChild(backLink);
    document.title = (project.title || 'تفاصيل المشروع') + ' - موقعي الشخصي';
  }

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var formData = new FormData(contactForm);
      var recipient = contactForm.dataset.recipient;
      var subject = 'رسالة من الموقع: ' + formData.get('name');
      var body = [
        'الاسم: ' + formData.get('name'),
        'البريد الإلكتروني: ' + formData.get('email'),
        '',
        String(formData.get('message'))
      ].join('\n');
      var status = document.getElementById('contactStatus');
      if (status) status.textContent = 'سيُفتح تطبيق البريد لإكمال إرسال رسالتك.';
      window.location.href = 'mailto:' + encodeURIComponent(recipient)
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  }

  if (document.querySelector('[data-project-list], #projectDetails')) {
    fetch('data/projects.json')
      .then(function (response) {
        if (!response.ok) throw new Error('تعذر تحميل بيانات المشاريع');
        return response.json();
      })
      .then(function (projects) {
        if (!Array.isArray(projects)) throw new Error('صيغة بيانات المشاريع غير صحيحة');
        loadProjectLists(projects);
        loadProjectDetails(projects);
      })
      .catch(function () {
        document.querySelectorAll('[data-project-list], #projectDetails').forEach(function (container) {
          var message = document.createElement('p');
          message.textContent = 'تعذر تحميل بيانات المشاريع حالياً.';
          container.replaceChildren(message);
        });
      });
  }
})();

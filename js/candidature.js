(() => {
  const form = document.querySelector('#audition-application');
  if (!form) return;

  const API_URL = 'https://broadway-api.artsculturealsace.eu/apply';
  const TURNSTILE_SITE_KEY = '0x4AAAAAAEfQ03KVT9lzAUNa';

  const steps = [...form.querySelectorAll('.form-step')];
  const progressItems = [...document.querySelectorAll('.progress-item')];
  const progressFill = document.querySelector('.progress-fill');
  const progressCount = document.querySelector('#progress-count');
  const progressName = document.querySelector('#progress-name');
  const prevButton = form.querySelector('.form-prev');
  const nextButton = form.querySelector('.form-next');
  const submitButton = form.querySelector('.form-submit');
  const errorBox = document.querySelector('#form-errors');
  const review = document.querySelector('#application-review');
  const confirmation = document.querySelector('#demo-confirmation');
  const confirmationMessage = document.querySelector('#confirmation-message');
  const confirmationHelp = document.querySelector('#confirmation-help');
  const applicationCard = document.querySelector('.application-card');
  const progress = document.querySelector('.form-progress');
  const turnstileBlock = document.querySelector('#turnstile-block');
  const turnstileWidget = document.querySelector('#turnstile-widget');

  let currentStep = 0;
  let isSubmitting = false;
  let turnstileWidgetId = null;
  let turnstileToken = '';
  let turnstileRenderTimer = null;

  const stepNames = ['Tes informations', 'Ton expérience', 'Préparer ton audition', 'Récapitulatif'];
  const voiceLabels = {
    soprano: 'Soprano',
    mezzo: 'Mezzo-soprano',
    alto: 'Alto',
    tenor: 'Ténor',
    baritone: 'Baryton',
    bass: 'Basse',
    unknown: 'Je ne sais pas encore'
  };
  const statusLabels = {
    student: 'Étudiant·e',
    training: 'En formation',
    other: 'Autre'
  };
  const musicReadingLabels = {
    easy: 'Je lis facilement une partition',
    some_difficulty: 'Je peux lire une partition avec quelques difficultés',
    little: 'Je lis peu la musique',
    none: 'Je ne lis pas la musique'
  };
  const discoveryLabels = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    poster: 'Affiche',
    university: 'Université / établissement',
    conservatory: 'Conservatoire / école de musique',
    student_network: 'Association / réseau étudiant',
    word_of_mouth: 'Bouche-à-oreille',
    other: 'Autre'
  };

  // Sans date individuelle de convocation, on accepte toute personne pouvant être
  // âgée de 16 à 35 ans au cours du mois d’octobre 2026. La vérification exacte
  // pourra être faite au moment de la convocation.
  const auditionWindowStart = new Date('2026-10-01T12:00:00');
  const auditionWindowEnd = new Date('2026-10-31T12:00:00');

  const clearGlobalError = () => {
    errorBox.textContent = '';
  };

  const removeFieldError = (field) => {
    const container = field.closest('.field') || field.closest('[data-error-group]');
    if (!container) return;
    container.classList.remove('has-error');
    const error = container.querySelector(':scope > .field-error');
    if (error) error.remove();
  };

  const removeGroupError = (group) => {
    if (!group) return;
    group.classList.remove('has-error');
    const error = group.querySelector(':scope > .field-error');
    if (error) error.remove();
  };

  const setError = (field, message) => {
    const container = field.closest('.field');
    if (!container) return;
    removeFieldError(field);
    container.classList.add('has-error');
    const error = document.createElement('small');
    error.className = 'field-error';
    error.textContent = message;
    container.appendChild(error);
  };

  const setGroupError = (group, message) => {
    removeGroupError(group);
    group.classList.add('has-error');
    const error = document.createElement('small');
    error.className = 'field-error';
    error.textContent = message;
    group.appendChild(error);
  };

  const clearErrorsInStep = (stepIndex) => {
    steps[stepIndex].querySelectorAll('.has-error').forEach((element) => element.classList.remove('has-error'));
    steps[stepIndex].querySelectorAll('.field-error').forEach((element) => element.remove());
    clearGlobalError();
  };

  const renderTurnstile = () => {
    if (!turnstileWidget || turnstileWidgetId !== null) return;

    if (!window.turnstile) {
      window.clearTimeout(turnstileRenderTimer);
      turnstileRenderTimer = window.setTimeout(renderTurnstile, 180);
      return;
    }

    turnstileWidgetId = window.turnstile.render(turnstileWidget, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      callback: (token) => {
        turnstileToken = token;
        removeGroupError(turnstileBlock);
      },
      'expired-callback': () => {
        turnstileToken = '';
      },
      'error-callback': () => {
        turnstileToken = '';
        setGroupError(turnstileBlock, 'La vérification de sécurité n’a pas pu se charger. Réessaie dans quelques instants.');
      }
    });
  };

  const resetTurnstile = () => {
    turnstileToken = '';
    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
  };

  const showStep = (index, options = {}) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => {
      const active = i === currentStep;
      step.hidden = !active;
      step.classList.toggle('active', active);
    });
    progressItems.forEach((item, i) => {
      item.classList.toggle('active', i === currentStep);
      item.classList.toggle('complete', i < currentStep);
    });
    progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    progressCount.textContent = `Étape ${currentStep + 1} sur ${steps.length}`;
    progressName.textContent = stepNames[currentStep];
    prevButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    clearGlobalError();
    if (currentStep === steps.length - 1) {
      buildReview();
      renderTurnstile();
    }
    if (options.scroll !== false) {
      applicationCard.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  };

  const fieldsForStep = (stepIndex) => [...steps[stepIndex].querySelectorAll('input, select, textarea')].filter((field) => {
    if (field.disabled) return false;
    if (field.closest('[hidden]')) return false;
    return true;
  });

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;'
  }[char]));

  const ageOn = (birth, reference) => {
    let age = reference.getFullYear() - birth.getFullYear();
    const month = reference.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && reference.getDate() < birth.getDate())) age--;
    return age;
  };

  const potentiallyEligibleInAuditionWindow = (value) => {
    if (!value) return false;
    const birth = new Date(`${value}T12:00:00`);
    if (Number.isNaN(birth.getTime())) return false;
    const ageAtStart = ageOn(birth, auditionWindowStart);
    const ageAtEnd = ageOn(birth, auditionWindowEnd);
    return ageAtStart <= 35 && ageAtEnd >= 16;
  };

  const validateField = (field) => {
    removeFieldError(field);
    const name = field.name;
    const value = field.value.trim();

    if (field.required && !value && field.type !== 'radio' && field.type !== 'checkbox') {
      const messages = {
        first_name:'Indique ton prénom.',
        last_name:'Indique ton nom.',
        birth_date:'Indique ta date de naissance.',
        city:'Indique ta ville de résidence.',
        email:'Indique ton adresse e-mail.',
        phone:'Indique ton numéro de téléphone.',
        institution:'Indique ton établissement ou organisme.',
        vocal_experience:'Parle-nous brièvement de ton expérience du chant.',
        music_reading:'Choisis une réponse.',
        voice_type:'Choisis un type de voix ou « Je ne sais pas encore ».'
      };
      setError(field, messages[name] || 'Complète ce champ.');
      return false;
    }

    if (name === 'birth_date' && value && !potentiallyEligibleInAuditionWindow(value)) {
      setError(field, 'Les auditions sont ouvertes aux personnes âgées de 16 à 35 ans inclus.');
      return false;
    }

    if (name === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setError(field, 'Indique une adresse e-mail valide.');
        return false;
      }
    }

    if (name === 'phone' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        setError(field, 'Indique un numéro de téléphone valide.');
        return false;
      }
    }

    return true;
  };

  const validateStep = (stepIndex) => {
    clearErrorsInStep(stepIndex);
    let firstInvalid = null;
    let valid = true;

    const statusGroup = steps[stepIndex].querySelector('[data-error-group="current_status"]');
    if (statusGroup) {
      const selected = form.querySelector('input[name="current_status"]:checked');
      if (!selected) {
        setGroupError(statusGroup, 'Choisis une réponse.');
        firstInvalid ||= statusGroup.querySelector('input');
        valid = false;
      }
    }

    const documentsGroup = steps[stepIndex].querySelector('[data-error-group="documents_accepted"]');
    if (documentsGroup && !form.elements.documents_accepted.checked) {
      setGroupError(documentsGroup, 'Merci de prendre connaissance des documents avant d’envoyer ta candidature.');
      firstInvalid ||= form.elements.documents_accepted;
      valid = false;
    }

    const recordingGroup = steps[stepIndex].querySelector('[data-error-group="recording_consent"]');
    if (recordingGroup) {
      const selected = form.querySelector('input[name="recording_consent"]:checked');
      if (!selected) {
        setGroupError(recordingGroup, 'Choisis une réponse concernant l’enregistrement de l’audition.');
        firstInvalid ||= recordingGroup.querySelector('input');
        valid = false;
      }
    }

    for (const field of fieldsForStep(stepIndex)) {
      if (field.type === 'radio' || field.type === 'checkbox') continue;
      if (!validateField(field)) {
        firstInvalid ||= field;
        valid = false;
      }
    }

    if (!valid) {
      errorBox.textContent = currentStep === steps.length - 1
        ? 'Merci de vérifier les informations ci-dessous avant d’envoyer ta candidature.'
        : 'Merci de vérifier les informations ci-dessous avant de continuer.';
      if (firstInvalid) {
        const focusTarget = firstInvalid.type === 'radio' ? firstInvalid.closest('fieldset') : firstInvalid;
        focusTarget.scrollIntoView({ behavior:'smooth', block:'center' });
        window.setTimeout(() => firstInvalid.focus({ preventScroll:true }), 220);
      }
    }
    return valid;
  };

  nextButton.addEventListener('click', () => {
    if (validateStep(currentStep)) showStep(currentStep + 1);
  });
  prevButton.addEventListener('click', () => showStep(currentStep - 1));

  form.addEventListener('input', (event) => {
    const field = event.target;
    if (field.matches('input, select, textarea')) removeFieldError(field);
  });
  form.addEventListener('change', (event) => {
    const field = event.target;
    if (field.name === 'current_status') removeGroupError(field.closest('[data-error-group]'));
    if (field.name === 'recording_consent') removeGroupError(field.closest('[data-error-group]'));
    if (field.name === 'documents_accepted') removeGroupError(field.closest('[data-error-group]'));
  });

  const trainingDetails = document.querySelector('#training-details');
  const institution = form.elements.institution;
  form.querySelectorAll('input[name="current_status"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      const show = input.value === 'student' || input.value === 'training';
      trainingDetails.hidden = !show;
      institution.required = show;
      if (!show) {
        institution.value = '';
        form.elements.course.value = '';
        removeFieldError(institution);
      }
    });
  });

  const discovery = document.querySelector('#discovery-source');
  const discoveryOtherWrap = document.querySelector('#discovery-other-wrap');
  discovery.addEventListener('change', () => {
    discoveryOtherWrap.hidden = discovery.value !== 'other';
    if (discoveryOtherWrap.hidden) form.elements.discovery_other.value = '';
  });

  const getStatusLabel = () => {
    const checked = form.querySelector('input[name="current_status"]:checked');
    return checked ? statusLabels[checked.value] || checked.value : '—';
  };

  const formatDate = (value) => {
    if (!value) return 'Non renseigné';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  };

  const valueOrFallback = (value) => {
    const cleaned = String(value || '').trim();
    return cleaned || 'Non renseigné';
  };

  const getDiscoveryLabel = () => {
    const value = form.elements.discovery_source.value;
    if (!value) return 'Non renseigné';
    if (value === 'other') {
      const detail = String(form.elements.discovery_other.value || '').trim();
      return detail ? `Autre — ${detail}` : 'Autre';
    }
    return discoveryLabels[value] || value;
  };

  const reviewItem = (label, value, wide = false) => `
    <div class="review-item${wide ? ' review-item-wide' : ''}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(valueOrFallback(value))}</strong>
    </div>`;

  const reviewSection = (title, items) => `
    <section class="review-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="review-grid">${items.join('')}</div>
    </section>`;

  const buildReview = () => {
    const status = getStatusLabel();
    const voice = voiceLabels[form.elements.voice_type.value] || 'Non renseigné';
    const musicReading = musicReadingLabels[form.elements.music_reading.value] || 'Non renseigné';
    const showTraining = form.elements.current_status.value === 'student' || form.elements.current_status.value === 'training';

    const identityItems = [
      reviewItem('PRÉNOM', form.elements.first_name.value),
      reviewItem('NOM', form.elements.last_name.value),
      reviewItem('DATE DE NAISSANCE', formatDate(form.elements.birth_date.value)),
      reviewItem('VILLE DE RÉSIDENCE', form.elements.city.value),
      reviewItem('E-MAIL', form.elements.email.value),
      reviewItem('TÉLÉPHONE', form.elements.phone.value)
    ];

    const experienceItems = [
      reviewItem('SITUATION ACTUELLE', status, !showTraining),
      ...(showTraining ? [
        reviewItem('ÉTABLISSEMENT / ORGANISME', form.elements.institution.value),
        reviewItem('FORMATION / CURSUS', form.elements.course.value, true)
      ] : []),
      reviewItem('EXPÉRIENCE DU CHANT', form.elements.vocal_experience.value, true),
      reviewItem('LECTURE MUSICALE', musicReading, true),
      reviewItem('INFORMATION COMPLÉMENTAIRE', form.elements.additional_info.value, true),
      reviewItem('DÉCOUVERTE DES AUDITIONS', getDiscoveryLabel(), true)
    ];

    const auditionItems = [
      reviewItem('TYPE DE VOIX', voice, true)
    ];

    review.innerHTML = [
      reviewSection('TES INFORMATIONS', identityItems),
      reviewSection('TON EXPÉRIENCE', experienceItems),
      reviewSection('PRÉPARER TON AUDITION', auditionItems)
    ].join('');
  };

  const buildPayload = () => ({
    first_name: form.elements.first_name.value,
    last_name: form.elements.last_name.value,
    birth_date: form.elements.birth_date.value,
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    city: form.elements.city.value,
    current_status: form.elements.current_status.value,
    institution: form.elements.institution.value,
    course: form.elements.course.value,
    vocal_experience: form.elements.vocal_experience.value,
    music_reading: form.elements.music_reading.value,
    additional_info: form.elements.additional_info.value,
    discovery_source: form.elements.discovery_source.value,
    discovery_other: form.elements.discovery_other.value,
    voice_type: form.elements.voice_type.value,
    recording_consent: form.elements.recording_consent.value,
    documents_accepted: form.elements.documents_accepted.checked,
    turnstile_token: turnstileToken
  });

  const setSubmitting = (submitting) => {
    isSubmitting = submitting;
    submitButton.disabled = submitting;
    prevButton.disabled = submitting;
    submitButton.classList.toggle('is-loading', submitting);
    submitButton.innerHTML = submitting
      ? 'ENVOI EN COURS…'
      : 'ENVOYER MA CANDIDATURE <span aria-hidden="true">→</span>';
  };

  const showSubmissionSuccess = (emailSent) => {
    form.hidden = true;
    progress.hidden = true;
    confirmation.hidden = false;

    if (emailSent) {
      confirmationMessage.textContent = 'Un e-mail de confirmation vient de t’être envoyé à l’adresse indiquée dans le formulaire.';
      confirmationHelp.innerHTML = 'Si tu ne le reçois pas dans les prochaines minutes, pense d’abord à vérifier tes courriers indésirables. S’il n’y est pas non plus, contacte-nous à <a href="mailto:broadway@artsculturealsace.eu">broadway@artsculturealsace.eu</a>.';
    } else {
      confirmationMessage.textContent = 'Ton envoi a été enregistré, mais l’e-mail de confirmation n’a pas pu partir automatiquement.';
      confirmationHelp.innerHTML = 'Tu peux réessayer plus tard ou nous contacter directement à <a href="mailto:broadway@artsculturealsace.eu">broadway@artsculturealsace.eu</a>.';
    }

    applicationCard.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(currentStep)) return;

    removeGroupError(turnstileBlock);
    if (!turnstileToken) {
      setGroupError(turnstileBlock, 'Merci de terminer la vérification de sécurité avant d’envoyer ta candidature.');
      turnstileBlock.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    setSubmitting(true);
    clearGlobalError();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildPayload())
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.ok) {
        if (data.error === 'turnstile_failed' || data.error === 'turnstile_unavailable') {
          resetTurnstile();
          setGroupError(turnstileBlock, 'La vérification de sécurité a expiré ou n’a pas pu être validée. Merci de réessayer.');
          turnstileBlock.scrollIntoView({ behavior:'smooth', block:'center' });
        } else if (data.error === 'validation_failed') {
          errorBox.textContent = 'Certaines informations n’ont pas pu être validées. Merci de vérifier le formulaire puis de réessayer.';
        } else {
          errorBox.textContent = 'L’envoi n’a pas pu aboutir pour le moment. Merci de réessayer dans quelques instants.';
        }
        return;
      }

      showSubmissionSuccess(Boolean(data.email_sent));
    } catch (error) {
      console.error('Application submission error', error);
      resetTurnstile();
      errorBox.textContent = 'Impossible de contacter le service d’inscription pour le moment. Vérifie ta connexion puis réessaie.';
    } finally {
      if (!form.hidden) setSubmitting(false);
    }
  });

  document.querySelectorAll('.placeholder-link[aria-disabled="true"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  showStep(0, { scroll:false });
})();

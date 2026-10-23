// Strings that only exist on the web, written by hand. English defines the keys;
// the other languages must provide every one of them.

const en = {
	your_email_hint: 'Your email',
	location_blocked_in_browser_error:
		"Location access is blocked for this site, so we cannot ask for it again. To proceed, allow location in your browser's site settings (usually the icon next to the address bar) and then press the button below.",
	update_available_message: 'A new version of Martp is available.',
	update_action: 'Update',
	not_now_action: 'Not now',
	too_many_arts_in_a_row_error:
		"You are creating arts very fast. To keep Martp free for everyone, please wait a minute before creating the next one.",
	hourly_art_limit_reached_error:
		"You have created a lot of arts in the last hour. To keep Martp free for everyone, you can create a new one in %s min."
};

type WebStrings = typeof en;

const de: WebStrings = {
	your_email_hint: 'Deine E-Mail',
	location_blocked_in_browser_error:
		'Der Standortzugriff ist für diese Website blockiert, daher können wir nicht erneut danach fragen. Um fortzufahren, erlaube den Standort in den Website-Einstellungen deines Browsers (meist das Symbol neben der Adressleiste) und drücke dann die Schaltfläche unten.',
	update_available_message: 'Eine neue Version von Martp ist verfügbar.',
	update_action: 'Aktualisieren',
	not_now_action: 'Nicht jetzt',
	too_many_arts_in_a_row_error:
		"Du erstellst sehr schnell Kunstwerke. Damit Martp für alle kostenlos bleibt, warte bitte eine Minute, bevor du das nächste erstellst.",
	hourly_art_limit_reached_error:
		"Du hast in der letzten Stunde sehr viele Kunstwerke erstellt. Damit Martp für alle kostenlos bleibt, kannst du in %s Min. ein neues erstellen."
};

const es: WebStrings = {
	your_email_hint: 'Tu correo electrónico',
	location_blocked_in_browser_error:
		'El acceso a la ubicación está bloqueado para este sitio, así que no podemos volver a pedirlo. Para continuar, permite la ubicación en la configuración del sitio de tu navegador (normalmente el icono junto a la barra de direcciones) y luego pulsa el botón de abajo.',
	update_available_message: 'Hay una nueva versión de Martp disponible.',
	update_action: 'Actualizar',
	not_now_action: 'Ahora no',
	too_many_arts_in_a_row_error:
		"Estás creando artes muy rápido. Para que Martp siga siendo gratis para todos, espera un minuto antes de crear la siguiente.",
	hourly_art_limit_reached_error:
		"Has creado muchas artes en la última hora. Para que Martp siga siendo gratis para todos, podrás crear una nueva en %s min."
};

const fr: WebStrings = {
	your_email_hint: 'Votre e-mail',
	location_blocked_in_browser_error:
		"L'accès à la localisation est bloqué pour ce site, nous ne pouvons donc pas le redemander. Pour continuer, autorisez la localisation dans les paramètres du site de votre navigateur (généralement l'icône à côté de la barre d'adresse), puis appuyez sur le bouton ci-dessous.",
	update_available_message: 'Une nouvelle version de Martp est disponible.',
	update_action: 'Mettre à jour',
	not_now_action: 'Plus tard',
	too_many_arts_in_a_row_error:
		"Vous créez des œuvres très rapidement. Pour que Martp reste gratuit pour tout le monde, veuillez attendre une minute avant de créer la suivante.",
	hourly_art_limit_reached_error:
		"Vous avez créé beaucoup d'œuvres au cours de la dernière heure. Pour que Martp reste gratuit pour tout le monde, vous pourrez en créer une nouvelle dans %s min."
};

const ptBR: WebStrings = {
	your_email_hint: 'Seu e-mail',
	location_blocked_in_browser_error:
		'O acesso à localização está bloqueado para este site, então não podemos pedir de novo. Para continuar, permita a localização nas configurações do site no seu navegador (geralmente o ícone ao lado da barra de endereço) e depois toque no botão abaixo.',
	update_available_message: 'Uma nova versão do Martp está disponível.',
	update_action: 'Atualizar',
	not_now_action: 'Agora não',
	too_many_arts_in_a_row_error:
		"Você está criando artes muito rápido. Para manter o Martp gratuito para todos, espere um minuto antes de criar a próxima.",
	hourly_art_limit_reached_error:
		"Você criou muitas artes na última hora. Para manter o Martp gratuito para todos, você poderá criar uma nova em %s min."
};

export default { en, de, es, fr, 'pt-BR': ptBR };

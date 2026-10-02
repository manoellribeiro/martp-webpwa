// Strings that only exist on the web, written by hand. English defines the keys;
// the other languages must provide every one of them.

const en = {
	your_email_hint: 'Your email',
	location_blocked_in_browser_error:
		"Location access is blocked for this site, so we cannot ask for it again. To proceed, allow location in your browser's site settings (usually the icon next to the address bar) and then press the button below."
};

type WebStrings = typeof en;

const de: WebStrings = {
	your_email_hint: 'Deine E-Mail',
	location_blocked_in_browser_error:
		'Der Standortzugriff ist für diese Website blockiert, daher können wir nicht erneut danach fragen. Um fortzufahren, erlaube den Standort in den Website-Einstellungen deines Browsers (meist das Symbol neben der Adressleiste) und drücke dann die Schaltfläche unten.'
};

const es: WebStrings = {
	your_email_hint: 'Tu correo electrónico',
	location_blocked_in_browser_error:
		'El acceso a la ubicación está bloqueado para este sitio, así que no podemos volver a pedirlo. Para continuar, permite la ubicación en la configuración del sitio de tu navegador (normalmente el icono junto a la barra de direcciones) y luego pulsa el botón de abajo.'
};

const fr: WebStrings = {
	your_email_hint: 'Votre e-mail',
	location_blocked_in_browser_error:
		"L'accès à la localisation est bloqué pour ce site, nous ne pouvons donc pas le redemander. Pour continuer, autorisez la localisation dans les paramètres du site de votre navigateur (généralement l'icône à côté de la barre d'adresse), puis appuyez sur le bouton ci-dessous."
};

const ptBR: WebStrings = {
	your_email_hint: 'Seu e-mail',
	location_blocked_in_browser_error:
		'O acesso à localização está bloqueado para este site, então não podemos pedir de novo. Para continuar, permita a localização nas configurações do site no seu navegador (geralmente o ícone ao lado da barra de endereço) e depois toque no botão abaixo.'
};

export default { en, de, es, fr, 'pt-BR': ptBR };

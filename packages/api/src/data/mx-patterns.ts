// Known MX hostnames and patterns used by disposable email infrastructure.
// If a domain's MX records match any of these, it's likely routing through
// a disposable email service even if the domain itself isn't on our blocklist.

/** Exact MX hostnames → provider name */
export const DISPOSABLE_MX_HOSTS: ReadonlyMap<string, string> = new Map([
  // Mailinator
  ['mail.mailinator.com', 'Mailinator'],
  ['mail2.mailinator.com', 'Mailinator'],

  // Guerrilla Mail
  ['mx1.guerrillamail.com', 'Guerrilla Mail'],
  ['mx2.guerrillamail.com', 'Guerrilla Mail'],

  // YOPmail
  ['mx1.yopmail.com', 'YOPmail'],
  ['mx2.yopmail.com', 'YOPmail'],

  // Temp-Mail
  ['mx.temp-mail.org', 'Temp-Mail'],
  ['mx1.temp-mail.org', 'Temp-Mail'],

  // Maildrop
  ['maildrop.cc', 'Maildrop'],

  // Dispostable
  ['mx.dispostable.com', 'Dispostable'],

  // ThrowAwayMail
  ['mx.throwaway.email', 'ThrowAwayMail'],

  // Nada (getnada.com)
  ['mx.getnada.com', 'Nada'],

  // Mailnesia
  ['mailnesia.com', 'Mailnesia'],

  // Sharklasers / Guerrilla network
  ['mx1.sharklasers.com', 'Guerrilla Mail'],

  // Trashmail
  ['mx1.trashmail.com', 'Trashmail'],
  ['mx2.trashmail.com', 'Trashmail'],
  ['mx1.trashmail.me', 'Trashmail'],
  ['mx2.trashmail.me', 'Trashmail'],

  // Mohmal
  ['mx.mohmal.com', 'Mohmal'],

  // TempMailo
  ['mx.tempmailo.com', 'TempMailo'],

  // Burner Mail
  ['mx.burnermail.io', 'Burner Mail'],

  // MailSac
  ['in.mailsac.com', 'MailSac'],

  // Harakiri Mail
  ['harakirimail.com', 'Harakiri Mail'],

  // Jetable
  ['mx.jetable.org', 'Jetable'],

  // Fake Inbox
  ['mx.fakeinbox.com', 'Fake Inbox'],

  // EmailOnDeck
  ['mx.emailondeck.com', 'EmailOnDeck'],
]);

/**
 * Substring patterns in MX hostnames that strongly suggest disposable infrastructure.
 * Checked with includes() — order doesn't matter, all are tested.
 */
export const DISPOSABLE_MX_PATTERNS: readonly { pattern: string; provider: string }[] = [
  { pattern: 'mailinator.com', provider: 'Mailinator' },
  { pattern: 'guerrillamail', provider: 'Guerrilla Mail' },
  { pattern: 'yopmail', provider: 'YOPmail' },
  { pattern: 'temp-mail', provider: 'Temp-Mail' },
  { pattern: 'tempmail', provider: 'Temp-Mail' },
  { pattern: 'throwaway', provider: 'ThrowAwayMail' },
  { pattern: 'trashmail', provider: 'Trashmail' },
  { pattern: 'sharklasers', provider: 'Guerrilla Mail' },
  { pattern: 'dispostable', provider: 'Dispostable' },
  { pattern: 'mailnesia', provider: 'Mailnesia' },
  { pattern: 'maildrop', provider: 'Maildrop' },
  { pattern: 'burnermail', provider: 'Burner Mail' },
  { pattern: 'mailsac', provider: 'MailSac' },
  { pattern: 'fakeinbox', provider: 'Fake Inbox' },
  { pattern: 'mohmal', provider: 'Mohmal' },
  { pattern: 'tempmailo', provider: 'TempMailo' },
  { pattern: 'getairmail', provider: 'AirMail' },
  { pattern: 'harakirimail', provider: 'Harakiri Mail' },
  { pattern: 'discard.email', provider: 'Discard Email' },
  { pattern: 'emailondeck', provider: 'EmailOnDeck' },
];

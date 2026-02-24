export type DomainCategory =
  | 'temporary-inbox'
  | 'forwarding'
  | 'anonymous'
  | 'testing'
  | 'catch-all';

export interface DomainMeta {
  provider: string;
  description: string;
  category: DomainCategory;
  relatedDomains: string[];
}

/** Curated metadata for the top disposable email providers. */
export const DOMAIN_META: Record<string, DomainMeta> = {
  // --- Guerrilla Mail ---
  'guerrillamail.com': {
    provider: 'Guerrilla Mail',
    description:
      'Free disposable email service operating since 2006. Provides temporary inboxes that expire after one hour of inactivity. One of the oldest and most widely used throwaway email services.',
    category: 'temporary-inbox',
    relatedDomains: [
      'guerrillamail.net',
      'guerrillamail.org',
      'guerrillamail.de',
      'guerrillamail.biz',
      'guerrillamailblock.com',
      'sharklasers.com',
      'grr.la',
      'guerrillamail.info',
    ],
  },
  'guerrillamail.net': {
    provider: 'Guerrilla Mail',
    description:
      'Alternate domain for the Guerrilla Mail disposable email service. Functionally identical to guerrillamail.com.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.org', 'sharklasers.com'],
  },
  'guerrillamail.org': {
    provider: 'Guerrilla Mail',
    description:
      'Alternate domain for Guerrilla Mail. Part of the same disposable email network that provides short-lived inboxes.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.net', 'sharklasers.com'],
  },
  'guerrillamail.de': {
    provider: 'Guerrilla Mail',
    description: 'German-targeted domain for the Guerrilla Mail disposable email network.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org'],
  },
  'sharklasers.com': {
    provider: 'Guerrilla Mail',
    description:
      'Alternative domain operated by Guerrilla Mail. Shares the same temporary inbox infrastructure.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.net', 'grr.la'],
  },
  'grr.la': {
    provider: 'Guerrilla Mail',
    description:
      'Short domain alias for Guerrilla Mail disposable inboxes. Same infrastructure, different domain.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'sharklasers.com'],
  },

  // --- Mailinator ---
  'mailinator.com': {
    provider: 'Mailinator',
    description:
      'Public disposable email service where anyone can check any inbox without authentication. Widely used for testing and avoiding spam. All emails are public and auto-deleted after a few hours.',
    category: 'temporary-inbox',
    relatedDomains: [
      'mailinator.net',
      'mailinator2.com',
      'sogetthis.com',
      'mailinater.com',
      'trbvm.com',
      'binkmail.com',
    ],
  },
  'mailinator.net': {
    provider: 'Mailinator',
    description:
      'Alternate domain for the Mailinator public inbox service. Emails are publicly accessible and temporary.',
    category: 'temporary-inbox',
    relatedDomains: ['mailinator.com', 'mailinator2.com'],
  },

  // --- Temp-Mail ---
  'temp-mail.org': {
    provider: 'Temp-Mail',
    description:
      'Popular temporary email service that auto-generates random email addresses. Inboxes are available for a limited time with no registration required.',
    category: 'temporary-inbox',
    relatedDomains: ['temp-mail.io', 'tempmail.com', 'tempmail.net'],
  },

  // --- YOPmail ---
  'yopmail.com': {
    provider: 'YOPmail',
    description:
      'Free disposable email service with a unique feature: inboxes persist for 8 days. Supports custom aliases and has been operating since 2004.',
    category: 'temporary-inbox',
    relatedDomains: ['yopmail.fr', 'yopmail.net', 'yopmail.gq'],
  },
  'yopmail.fr': {
    provider: 'YOPmail',
    description:
      'French domain for YOPmail, a disposable email service that retains messages for up to 8 days.',
    category: 'temporary-inbox',
    relatedDomains: ['yopmail.com', 'yopmail.net'],
  },
  'yopmail.net': {
    provider: 'YOPmail',
    description: 'Alternate domain for the YOPmail disposable email network.',
    category: 'temporary-inbox',
    relatedDomains: ['yopmail.com', 'yopmail.fr'],
  },

  // --- 10MinuteMail ---
  '10minutemail.com': {
    provider: '10 Minute Mail',
    description:
      'Disposable email service that provides a temporary address lasting exactly 10 minutes. One of the most well-known throwaway email services, popular for quick sign-ups.',
    category: 'temporary-inbox',
    relatedDomains: ['10minutemail.net', '10minutemail.co.za'],
  },

  // --- ThrowAwayMail ---
  'throwaway.email': {
    provider: 'ThrowAwayMail',
    description:
      'Disposable email service that provides temporary addresses for anonymous use. Messages auto-delete after a short period.',
    category: 'temporary-inbox',
    relatedDomains: ['throwawaymail.com'],
  },

  // --- Trashmail ---
  'trashmail.com': {
    provider: 'Trashmail',
    description:
      'Long-running disposable email and forwarding service. Provides temporary addresses that can forward a limited number of emails to your real address.',
    category: 'forwarding',
    relatedDomains: ['trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmail.io'],
  },
  'trashmail.me': {
    provider: 'Trashmail',
    description: 'Alternate domain for the Trashmail disposable email forwarding service.',
    category: 'forwarding',
    relatedDomains: ['trashmail.com', 'trashmail.net'],
  },
  'trashmail.net': {
    provider: 'Trashmail',
    description: 'Part of the Trashmail network of disposable email forwarding domains.',
    category: 'forwarding',
    relatedDomains: ['trashmail.com', 'trashmail.me'],
  },

  // --- Maildrop ---
  'maildrop.cc': {
    provider: 'Maildrop',
    description:
      'Free, open-source disposable email service. No registration required — just pick any address @maildrop.cc and check the inbox.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Dispostable ---
  'dispostable.com': {
    provider: 'Dispostable',
    description:
      'Simple disposable email service that provides temporary inboxes for anonymous use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Mailnesia ---
  'mailnesia.com': {
    provider: 'Mailnesia',
    description:
      'Disposable email service with automatic link-clicking for confirmation emails. Designed for quick sign-up verification testing.',
    category: 'testing',
    relatedDomains: [],
  },

  // --- Tempail ---
  'tempail.com': {
    provider: 'Tempail',
    description:
      'Disposable temporary email service providing short-lived inboxes for anonymous use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Mohmal ---
  'mohmal.com': {
    provider: 'Mohmal',
    description:
      'Temporary email service with support for multiple languages. Provides disposable inboxes that expire after 45 minutes.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Burner Mail ---
  'burnermail.io': {
    provider: 'Burner Mail',
    description:
      'Browser extension and service that generates unique burner email addresses. Forwards emails to your real address while hiding your identity.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- MailSac ---
  'mailsac.com': {
    provider: 'MailSac',
    description:
      'Disposable email and email testing service with an API. Used by developers for automated testing and by individuals for throwaway addresses.',
    category: 'testing',
    relatedDomains: [],
  },

  // --- Nada ---
  'getnada.com': {
    provider: 'Nada',
    description:
      'Temporary email service that provides disposable inboxes with a clean interface. No registration required.',
    category: 'temporary-inbox',
    relatedDomains: ['getnada.cc'],
  },

  // --- Jetable ---
  'jetable.org': {
    provider: 'Jetable',
    description:
      'French disposable email service ("jetable" means "disposable" in French). Creates temporary forwarding addresses.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- EmailOnDeck ---
  'emailondeck.com': {
    provider: 'EmailOnDeck',
    description:
      'Disposable email service focused on privacy. Provides temporary addresses that are deleted after a short period.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- TempMailo ---
  'tempmailo.com': {
    provider: 'TempMailo',
    description: 'Disposable email service that provides temporary inboxes lasting one hour.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Fake Inbox ---
  'fakeinbox.com': {
    provider: 'Fake Inbox',
    description: 'Disposable email service providing temporary anonymous inboxes for one-time use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Harakiri Mail ---
  'harakirimail.com': {
    provider: 'Harakiri Mail',
    description:
      'Disposable email service. The name references self-destruction — emails are automatically deleted after a set time.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Discard Email ---
  'discard.email': {
    provider: 'Discard Email',
    description:
      'Disposable email service that allows you to receive emails at a temporary address without registration.',
    category: 'temporary-inbox',
    relatedDomains: ['discardmail.com', 'discardmail.de'],
  },

  // --- Tempmail.com ---
  'tempmail.com': {
    provider: 'TempMail',
    description:
      'One of the most popular disposable email services. Provides auto-generated temporary addresses with a simple interface.',
    category: 'temporary-inbox',
    relatedDomains: ['tempmail.net', 'temp-mail.org'],
  },

  // --- Guerrilla Mail extended aliases ---
  'guerrillamailblock.com': {
    provider: 'Guerrilla Mail',
    description:
      'Part of the Guerrilla Mail disposable email network. Provides temporary inboxes under an alternate domain.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'sharklasers.com'],
  },

  // --- Mailcatch ---
  'mailcatch.com': {
    provider: 'MailCatch',
    description:
      'Disposable email service that catches all incoming mail at any address under its domain. No setup required.',
    category: 'catch-all',
    relatedDomains: [],
  },

  // --- Mintemail ---
  'mintemail.com': {
    provider: 'MintEmail',
    description:
      'Temporary email service that provides disposable addresses with a clean, minimal interface.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- MyTemp ---
  'mytemp.email': {
    provider: 'MyTemp',
    description:
      'Disposable email service that generates temporary addresses for anonymous email reception.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Tempr ---
  'tempr.email': {
    provider: 'Tempr',
    description: 'Disposable email service providing short-lived temporary email addresses.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- ThrowAwayMail ---
  'throwawaymail.com': {
    provider: 'ThrowAwayMail',
    description:
      'Disposable email service that lets you receive emails at a temporary address without creating an account.',
    category: 'temporary-inbox',
    relatedDomains: ['throwaway.email'],
  },

  // --- Crazymailing ---
  'crazymailing.com': {
    provider: 'CrazyMailing',
    description: 'Disposable email service providing temporary inboxes for anonymous use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Mailnull ---
  'mailnull.com': {
    provider: 'MailNull',
    description:
      'Disposable email forwarding service. Creates temporary aliases that forward to your real address, then expire.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- Spamgourmet ---
  'spamgourmet.com': {
    provider: 'Spamgourmet',
    description:
      'Disposable email address service that lets you set a limit on how many messages each address can receive before it stops working.',
    category: 'forwarding',
    relatedDomains: ['spamgourmet.net', 'spamgourmet.org'],
  },

  // --- AirMail (getairmail) ---
  'getairmail.com': {
    provider: 'AirMail',
    description:
      'Disposable email service that generates temporary addresses for quick anonymous use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Mailexpire ---
  'mailexpire.com': {
    provider: 'MailExpire',
    description:
      'Disposable email service that creates temporary addresses which expire after a set time period.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Tempinbox ---
  'tempinbox.com': {
    provider: 'TempInbox',
    description:
      'Disposable email service that provides temporary inboxes for receiving emails anonymously.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Incognitomail ---
  'incognitomail.org': {
    provider: 'Incognito Mail',
    description: 'Privacy-focused disposable email service for anonymous email reception.',
    category: 'anonymous',
    relatedDomains: ['incognitomail.com'],
  },

  // --- Anonymbox ---
  'anonymbox.com': {
    provider: 'AnonymBox',
    description:
      'Disposable email service focused on anonymity. Provides temporary addresses with no registration.',
    category: 'anonymous',
    relatedDomains: [],
  },

  // --- Filzmail ---
  'filzmail.com': {
    provider: 'Filzmail',
    description: 'Disposable email service providing temporary email addresses for one-time use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Mailtemp ---
  'mail-temp.com': {
    provider: 'MailTemp',
    description:
      'Temporary email service that generates disposable addresses for anonymous email reception.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Spambox ---
  'spambox.us': {
    provider: 'SpamBox',
    description: 'Disposable email service that catches spam so your real inbox stays clean.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- TrashMail.de ---
  'trashmail.de': {
    provider: 'Trashmail',
    description: 'German domain for the Trashmail disposable email and forwarding service.',
    category: 'forwarding',
    relatedDomains: ['trashmail.com', 'trashmail.net', 'trashmail.me'],
  },

  // --- MailDrop aliases ---
  'mailme.lv': {
    provider: 'MailMe',
    description: 'Latvian-based disposable email service providing temporary inboxes.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- MyTrashMail ---
  'mytrashmail.com': {
    provider: 'MyTrashMail',
    description:
      'Disposable email forwarding service that creates temporary addresses forwarding to your real email.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- Mailzilla ---
  'mailzilla.com': {
    provider: 'Mailzilla',
    description: 'Disposable email service providing temporary inboxes for short-term use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- TempMail Plus ---
  'tempmail.plus': {
    provider: 'TempMail Plus',
    description:
      'Enhanced temporary email service with a clean interface and auto-generated addresses.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- 33Mail ---
  '33mail.com': {
    provider: '33Mail',
    description:
      'Email alias service that creates unlimited disposable addresses forwarding to a single real inbox. Aliases can be disabled at any time.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- Mailforspam ---
  'mailforspam.com': {
    provider: 'MailForSpam',
    description:
      'Disposable email service designed specifically for handling spam signups and temporary registrations.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Temp-mail.de ---
  'temp-mail.de': {
    provider: 'Temp-Mail DE',
    description: 'German temporary email service providing disposable addresses for anonymous use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Emailfake ---
  'emailfake.com': {
    provider: 'EmailFake',
    description:
      'Disposable email service that generates fake email addresses for temporary use. Supports custom domain selection.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Guerrilla extended ---
  'guerrillamail.info': {
    provider: 'Guerrilla Mail',
    description:
      'Part of the Guerrilla Mail disposable email network operating under an alternate domain.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.net', 'sharklasers.com'],
  },
  'guerrillamail.biz': {
    provider: 'Guerrilla Mail',
    description: 'Business-themed domain for the Guerrilla Mail disposable email network.',
    category: 'temporary-inbox',
    relatedDomains: ['guerrillamail.com', 'guerrillamail.net'],
  },

  // --- Mailinator extended ---
  'mailinator2.com': {
    provider: 'Mailinator',
    description:
      'Alternate domain for the Mailinator disposable email service. All inboxes are publicly accessible.',
    category: 'temporary-inbox',
    relatedDomains: ['mailinator.com', 'mailinator.net'],
  },

  // --- Tempail extended ---
  'tempalias.com': {
    provider: 'TempAlias',
    description: 'Disposable email aliasing service that creates temporary forwarding addresses.',
    category: 'forwarding',
    relatedDomains: [],
  },

  // --- AnonAddy / addy.io ---
  'anonaddy.com': {
    provider: 'AnonAddy',
    description:
      'Open-source anonymous email forwarding service. Creates unlimited aliases that forward to your real address.',
    category: 'forwarding',
    relatedDomains: ['anonaddy.me'],
  },

  // --- Spam4.me ---
  'spam4.me': {
    provider: 'Spam4',
    description:
      'Disposable email service designed for receiving spam signups and temporary registrations.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Nwytg.net ---
  'nwytg.net': {
    provider: 'NWYTG',
    description:
      'Disposable email domain commonly found on multiple blocklists. Used for temporary email reception.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- Disposable.email ---
  'disposable.email': {
    provider: 'Disposable Email',
    description:
      'Aptly named disposable email service that provides temporary addresses for one-time use.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },

  // --- TempMail.ninja ---
  'tempmail.ninja': {
    provider: 'TempMail Ninja',
    description:
      'Fast disposable email service providing instant temporary addresses with no registration.',
    category: 'temporary-inbox',
    relatedDomains: [],
  },
};

/** Top domains to pre-build at deploy time (highest search traffic potential). */
export const SEED_DOMAINS: string[] = [
  // Major providers with high search volume
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'tempmail.com',
  '10minutemail.com',
  'throwaway.email',
  'trashmail.com',
  'maildrop.cc',
  'dispostable.com',
  'mailnesia.com',
  'mohmal.com',
  'burnermail.io',
  'mailsac.com',
  'getnada.com',
  'emailondeck.com',
  'tempmailo.com',
  'fakeinbox.com',
  'harakirimail.com',
  'discard.email',
  'mailcatch.com',
  'throwawaymail.com',
  'getairmail.com',
  'tempinbox.com',
  'anonymbox.com',
  'spamgourmet.com',
  '33mail.com',
  'mailforspam.com',
  'emailfake.com',
  'anonaddy.com',
  'disposable.email',
  'tempmail.plus',
  // Guerrilla Mail network
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.de',
  'guerrillamail.biz',
  'guerrillamail.info',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  // Mailinator network
  'mailinator.net',
  'mailinator2.com',
  // YOPmail network
  'yopmail.fr',
  'yopmail.net',
  // Trashmail network
  'trashmail.me',
  'trashmail.net',
  'trashmail.de',
  // Other common disposable domains with high volume
  'tempail.com',
  'mailnull.com',
  'mailexpire.com',
  'mytrashmail.com',
  'incognitomail.org',
  'spambox.us',
  'mail-temp.com',
  'spam4.me',
  'jetable.org',
  'mintemail.com',
  'tempr.email',
  'mytemp.email',
  'temp-mail.de',
  'crazymailing.com',
  'mailme.lv',
  'mailzilla.com',
  'filzmail.com',
  'nwytg.net',
  'tempalias.com',
  'tempmail.ninja',
  // Popular .tk/.ml/.ga disposable domains
  'yomail.info',
  'mailtemp.info',
  'tmpmail.net',
  'tmpmail.org',
  'binkmail.com',
  'sogetthis.com',
  'trbvm.com',
  'discardmail.com',
  'discardmail.de',
  'spamgourmet.net',
  'spamgourmet.org',
  'getnada.cc',
  'anonaddy.me',
  '10minutemail.net',
  '10minutemail.co.za',
  'incognitomail.com',
];

const CATEGORY_LABELS: Record<DomainCategory, string> = {
  'temporary-inbox': 'Temporary Inbox',
  forwarding: 'Email Forwarding',
  anonymous: 'Anonymous Email',
  testing: 'Testing Service',
  'catch-all': 'Catch-All Service',
};

export function getCategoryLabel(category: DomainCategory): string {
  return CATEGORY_LABELS[category];
}

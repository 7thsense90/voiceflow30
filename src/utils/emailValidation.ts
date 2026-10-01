/**
 * Comprehensive Email Validation Utility
 *
 * Validates syntax, RFC conformity, rejects example/placeholder domains (e.g., example.com, test.com),
 * and strictly prevents registration with disposable / temporary email providers (including Yopmail,
 * Mailinator, Guerrilla Mail, Temp-Mail, etc.).
 */

// IETF RFC 2606 & standard placeholder / demo domains
const EXAMPLE_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test.com',
  'test.org',
  'test.net',
  'testing.com',
  'sample.com',
  'sample.org',
  'sample.net',
  'demo.com',
  'dummy.com',
  'fake.com',
  'fakemail.com',
  'invalid.com',
  'none.com',
  'nonexistent.com',
  'domain.com',
  'myemail.com',
  'asdf.com',
  'qwerty.com',
  'placeholder.com',
  'samplemail.com',
  'testmail.com',
]);

// Reserved top-level domains that are not real TLDs
const RESERVED_TLDS = new Set([
  'example',
  'invalid',
  'test',
  'localhost',
  'local',
  'internal',
]);

// Known disposable, burner, and temporary email domains (including Yopmail and its alternate domains)
const DISPOSABLE_DOMAINS = new Set([
  // Yopmail and aliases
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'hide.biz.st',
  'mymail.infos.st',
  // Mailinator & Guerrilla Mail
  'mailinator.com',
  'mailinator.net',
  'mailinator2.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  // Temp-Mail and 10MinuteMail
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.co.uk',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'getnada.com',
  'nada.ltd',
  'inboxkitten.com',
  'maildrop.cc',
  'mohmal.com',
  'mohmal.im',
  'tempail.com',
  'burnermail.io',
  'crazymailing.com',
  'fakeinbox.com',
  'dropmail.me',
  'emailondeck.com',
  'mytemp.email',
  'mytempemail.com',
  'generator.email',
  'fakemailgenerator.com',
  'getairmail.com',
  'zillamail.com',
  'mailnesia.com',
  'mytempmail.com',
  'disposablemail.com',
  'tempmailaddress.com',
  'tempinbox.com',
  'byom.de',
  'yomail.info',
  'trashymail.com',
  'sharklasers.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that an email is authentic, formatted correctly, and not from an example or disposable domain.
 */
export function validateRealEmail(email: string): EmailValidationResult {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return {
      isValid: false,
      error: 'Please enter an email address.',
    };
  }

  // Syntax check conforming to email specification
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: 'Please provide a valid, correctly formatted email address (e.g. name@gmail.com).',
    };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Please provide a valid email address with a single @ symbol.',
    };
  }

  const [localPart, domain] = parts;

  // Local part checks
  if (localPart.length < 2) {
    return {
      isValid: false,
      error: 'The email username before @ must be at least 2 characters.',
    };
  }

  const dummyLocalParts = new Set(['test', 'demo', 'sample', 'dummy', 'fake', 'asdf', 'qwerty', 'throwaway']);
  if (dummyLocalParts.has(localPart)) {
    return {
      isValid: false,
      error: `"${localPart}" is a generic test prefix. Please use your genuine, active email address.`,
    };
  }

  // Domain checks
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (RESERVED_TLDS.has(tld)) {
    return {
      isValid: false,
      error: `Emails ending in .${tld} are reserved/test domains and cannot be used for registration.`,
    };
  }

  if (EXAMPLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `"${domain}" is an example/placeholder domain. Please enter your real, active email address (e.g. Gmail, Outlook, Yahoo, or personal domain).`,
    };
  }

  // Check for disposable domains or subdomains of known disposable services (e.g., xxx.yopmail.com)
  if (
    DISPOSABLE_DOMAINS.has(domain) ||
    domain.includes('yopmail') ||
    domain.includes('mailinator') ||
    domain.includes('guerrillamail') ||
    domain.includes('tempmail') ||
    domain.includes('trashmail') ||
    domain.includes('dispostable') ||
    domain.includes('10minutemail')
  ) {
    return {
      isValid: false,
      error: 'Temporary and disposable email providers (e.g. Yopmail, Mailinator) are strictly prohibited. Please provide a genuine, permanent email address.',
    };
  }

  // Ensure TLD has at least 2 characters (e.g., .com, .net, .co.uk)
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Please provide a valid email domain with a recognized top-level extension.',
    };
  }

  return { isValid: true };
}

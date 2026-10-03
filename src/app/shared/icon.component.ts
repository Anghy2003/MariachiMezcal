import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Íconos de línea fina, dibujados a mano en SVG (sin librerías genéricas). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('whatsapp') {
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.7Z" />
          <path d="M9 8.5c.2-.6.8-.7 1.1-.2l.8 1.6c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.6.8c.5.3.4.9-.2 1.1-2.9 1-7.4-3.5-6.4-6.4Z" fill="currentColor" stroke="none" />
        }
        @case ('instagram') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
        }
        @case ('facebook') {
          <path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.5-1.5H17V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.2H8.5v3H11V21" />
        }
        @case ('tiktok') {
          <path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.3-3.8" /><path d="M14 3.5c.4 2.6 2.2 4.4 5 4.6" />
        }
        @case ('phone') {
          <path d="M5 4h3l1.5 4.2-2 1.3a11 11 0 0 0 7 7l1.3-2L20 16v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />
        }
        @case ('pin') {
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
        }
        @case ('lock') {
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        }
        @case ('cart') {
          <path d="M6.5 7h11l-1 11.5a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('play') {
          <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('sound') {
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
        }
        @case ('mute') {
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4Z" /><path d="m16 9.5 5 5M21 9.5l-5 5" />
        }
        @case ('menu') {
          <path d="M4 8h16M4 16h10" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5Z" />
        }
        @case ('audio') {
          <path d="M4 14v-4M8 17V7M12 20V4M16 16V8M20 13v-2" />
        }
        @case ('shield') {
          <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6Z" /><path d="m9 12 2 2 4-4" />
        }
        @case ('alert') {
          <path d="M12 4 21 19H3Z" /><path d="M12 10v4M12 16.8v.2" />
        }
        @case ('mic') {
          <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
        }
        @case ('music') {
          <path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" />
        }
        @case ('gift') {
          <rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9h18M12 9v11M12 9S10.5 4 8 5s1 4 4 4c3 0 6-3 4-4s-4 4-4 4" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: 1.2em; height: 1.2em; flex: none; }
    svg { width: 100%; height: 100%; }
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
}

import { INVOICE_PDF_DATA_URL } from './seedPdf.js';

/** Support agent = admin panel ka current user */
export const SUPPORT = {
  name: 'Riya Sharma',
  shortName: 'Riya',
  role: 'Eden Care · Support',
  initials: 'RS',
  tone: 0,
};

/** User panel ka current user */
export const CURRENT_USER = { name: 'Aarav Mehta', initials: 'AM', tone: 1 };

export const QUICK_EMOJIS = [
  '😀','😂','🙂','😍','😊','😎','🤝','👍','🙏','👏','🔥','🎉',
  '❤️','💙','✨','✅','📦','🚚','⏰','📎','📷','💬','🌿','🙌',
];

const now = Date.now();
const ago = (minutes) => new Date(now - minutes * 60_000).toISOString();

const invoiceAttachment = (id = 'file-invoice') => ({
  id,
  name: 'EDN-48217-Invoice.pdf',
  size: 1112,
  mime: 'application/pdf',
  kind: 'file',
  dataUrl: INVOICE_PDF_DATA_URL,
});

/** message factory: from = 'user' | 'support' */
const msg = (id, from, text, minutes, extra = {}) => ({
  id,
  from,
  text,
  attachments: [],
  createdAt: ago(minutes),
  edited: false,
  status: from === 'user' ? 'sent' : 'read',
  ...extra,
});

const replyTo = (source, preview) => ({ id: source.id, from: source.from, preview });

/* ----------------------------- conversations ----------------------------- */

const aaravMessages = () => {
  const m1 = msg('a1', 'support', 'Hey Aarav 👋 Welcome to Eden.', 26 * 60 + 6);
  const m2 = msg(
    'a2',
    'support',
    "I'm Riya from the Eden Care team — I'll be looking after your order today.",
    26 * 60 + 5,
  );
  const m3 = msg('a3', 'user', 'Hi Riya! Thanks. I have a quick question about my order.', 26 * 60 + 2, {
    status: 'read',
  });
  const m4 = msg('a4', 'support', 'Sure, go ahead 🙂', 26 * 60 + 1);
  const m5 = msg(
    'a5',
    'user',
    "I placed order #EDN-48217 yesterday but I still haven't received the tracking link.",
    46,
    { status: 'read' },
  );
  const m6 = msg('a6', 'support', 'Let me check that for you right away.', 44);
  const m7 = msg('a7', 'support', 'Here is your invoice for the order.', 43, {
    attachments: [invoiceAttachment('a-invoice')],
  });
  const m8 = msg(
    'a8',
    'support',
    'Your parcel was picked up this morning and it is on the way. Delivery is expected on 29 Nov, between 10 am and 2 pm.',
    42,
  );
  const m9 = msg('a9', 'user', 'Perfect, that was fast 😄 Thanks for the update!', 20, {
    status: 'read',
    replyTo: replyTo(m8, 'Your parcel was picked up this morning and it is on the way.'),
  });
  const m10 = msg('a10', 'support', 'Anytime! Anything else I can help you with?', 19);
  const m11 = msg('a11', 'user', "No that's all for now, thank you!", 4, { status: 'read' });
  return [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11];
};

const priyaMessages = () => {
  const p1 = msg('p1', 'user', "Hi, my order was supposed to arrive today but it's still showing 'out for delivery'.", 58, { status: 'read' });
  const p2 = msg('p2', 'support', 'Sorry about that, Priya. Let me check with the courier right away.', 55);
  const p3 = msg('p3', 'support', 'Courier says it will be delivered before 7 pm today.', 40);
  const p4 = msg('p4', 'user', 'Okay, please confirm once it is delivered 🙏', 12);
  return [p1, p2, p3, p4];
};

const rohanMessages = () => {
  const r1 = msg('r1', 'user', 'I want to return the shoes, size is tight.', 3 * 60 + 20, { status: 'read' });
  const r2 = msg('r2', 'support', 'No problem. I have raised a return request — pickup will be scheduled tomorrow.', 3 * 60 + 10);
  const r3 = msg('r3', 'user', 'And the refund? How many days does it take?', 2 * 60 + 55, { status: 'read' });
  const r4 = msg('r4', 'support', 'Refund is processed within 3–5 working days after pickup.', 2 * 60 + 50);
  const r5 = msg('r5', 'user', 'Got it, thanks. Waiting for the pickup OTP then.', 90);
  return [r1, r2, r3, r4, r5];
};

const snehaMessages = () => {
  const s1 = msg('s1', 'user', 'Hello! I received the kurta in M, can I exchange it for L?', 5 * 60, { status: 'read' });
  const s2 = msg('s2', 'support', 'Sure Sneha, exchange is available on this item. Shall I arrange a pickup?', 4 * 60 + 50);
  const s3 = msg('s3', 'user', 'Yes please, same address.', 4 * 60 + 45, { status: 'read' });
  const s4 = msg('s4', 'support', 'Done ✅ Pickup is booked for tomorrow, 11 am – 2 pm.', 4 * 60 + 30);
  const s5 = msg('s5', 'user', 'Perfect, thank you so much!', 4 * 60 + 20, { status: 'read' });
  return [s1, s2, s3, s4, s5];
};

const kabirMessages = () => {
  const k1 = msg('k1', 'user', 'Bhaiya delivery address change kar sakte hain? New flat shift ho gaya.', 26 * 60 + 40, { status: 'read' });
  const k2 = msg('k2', 'support', 'Haan bilkul. Naya address bhej dijiye, main update kar deta hoon.', 26 * 60 + 30);
  const k3 = msg('k3', 'user', 'Flat 402, Shreeji Residency, Vaishali Nagar, Jaipur — 302021', 26 * 60 + 25, { status: 'read' });
  const k4 = msg('k4', 'support', 'Address updated ✔ Courier will deliver to the new address.', 26 * 60 + 10);
  const k5 = msg('k5', 'user', 'Thank you! Order kab tak aayega?', 26 * 60 + 5);
  const k6 = msg('k6', 'user', 'And kya main invoice WhatsApp par le sakta hoon?', 26 * 60 + 4);
  return [k1, k2, k3, k4, k5, k6];
};

const ananyaMessages = () => {
  const n1 = msg('n1', 'user', 'Hi, I need a GST invoice for my last order.', 54 * 60, { status: 'read' });
  const n2 = msg('n2', 'support', 'Sure — sharing the GST invoice here.', 53 * 60, {
    attachments: [invoiceAttachment('n-invoice')],
  });
  const n3 = msg('n3', 'support', 'You can download it from the attachment above.', 53 * 60);
  const n4 = msg('n4', 'user', 'Received, thank you!', 52 * 60, { status: 'read' });
  return [n1, n2, n3, n4];
};

const ananyaText = msg('n5', 'support', 'Happy to help. Let me know if you need anything else 🌿', 51 * 60);

/** Saare demo threads — admin inbox isi list se banti hai */
export const seedThreads = () => [
  {
    id: 'aarav-mehta',
    user: {
      name: 'Aarav Mehta',
      initials: 'AM',
      city: 'Jaipur',
      phone: '+91 98290 41127',
      tone: 1,
      online: true,
    },
    messages: aaravMessages(),
  },
  {
    id: 'priya-nair',
    user: {
      name: 'Priya Nair',
      initials: 'PN',
      city: 'Mumbai',
      phone: '+91 98330 22941',
      tone: 2,
      online: true,
    },
    messages: priyaMessages(),
  },
  {
    id: 'kabir-singh',
    user: {
      name: 'Kabir Singh',
      initials: 'KS',
      city: 'Jaipur',
      phone: '+91 90244 87120',
      tone: 5,
      online: false,
      lastSeen: 'Last seen 12 min ago',
    },
    messages: kabirMessages(),
  },
  {
    id: 'rohan-gupta',
    user: {
      name: 'Rohan Gupta',
      initials: 'RG',
      city: 'New Delhi',
      phone: '+91 98110 33402',
      tone: 3,
      online: false,
      lastSeen: 'Last seen 1 hr ago',
    },
    messages: rohanMessages(),
  },
  {
    id: 'sneha-kapoor',
    user: {
      name: 'Sneha Kapoor',
      initials: 'SK',
      city: 'Bengaluru',
      phone: '+91 98450 77219',
      tone: 4,
      online: false,
      lastSeen: 'Last seen 4 hr ago',
    },
    messages: snehaMessages(),
  },
  {
    id: 'ananya-verma',
    user: {
      name: 'Ananya Verma',
      initials: 'AV',
      city: 'Pune',
      phone: '+91 98508 61133',
      tone: 6,
      online: false,
      lastSeen: 'Last seen yesterday',
    },
    messages: [...ananyaMessages(), ananyaText],
  },
];

/** User panel ka thread id (Aarav = user panel) */
export const USER_PANEL_THREAD_ID = 'aarav-mehta';

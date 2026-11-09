/* English strings and the t()/loc() helpers (site is English only; Arabic was removed).
   Later phases add their own keys. */

const STRINGS = {
  en: {
    'skip': 'Skip to content',
    'nav.shop': 'Shop', 'nav.collections': 'Collections', 'nav.all': 'All products',
    'nav.about': 'About', 'nav.contact': 'Contact', 'nav.cart': 'Cart', 'nav.menu': 'Menu',
    'common.view_all': 'View all', 'common.shop_all': 'Shop all products',
    'common.wa': 'Chat on WhatsApp', 'common.error': 'Something went wrong loading the store. Please refresh.',

    'hero.default.eyebrow': 'Designed & printed in Lebanon',
    'hero.default.title': 'Handmade-feel pieces, 3D printed with care',
    'hero.default.subtitle': 'Home decor, lighting and gifts designed and printed in our Lebanese studio.',
    'hero.default.cta': 'Shop now', 'hero.default.link': 'shop.html',
    'hero.christmas.eyebrow': 'The Christmas Collection',
    'hero.christmas.alt': 'A glowing 3D printed Christmas village with snowy houses, a church and a boulangerie under a starry mountain sky',
    'hero.default.alt': '',
    'hero.christmas.title': 'Make this Christmas glow',
    'hero.christmas.subtitle': 'Ornaments, lights and gifts, designed and 3D printed in Lebanon. Gift-ready and delivered to your door.',
    'hero.christmas.cta': 'Shop Christmas', 'hero.christmas.link': 'collection.html?c=christmas',
    'hero.valentine.eyebrow': "Valentine's",
    'hero.valentine.title': 'Gifts made with love',
    'hero.valentine.subtitle': 'Personal, printed-in-Lebanon gifts for the people you love.',
    'hero.valentine.cta': "Shop Valentine's", 'hero.valentine.link': 'collection.html?c=valentine',

    'countdown.left': '{d} days {h} hrs left',
    'home.collection_cta': 'View the collection',
    'home.collections': 'Shop by collection',
    'home.bestsellers': 'Best sellers',
    'home.bestsellers_sub': 'The pieces our customers love most.',
    'how.title': 'How it works',
    'how.1.t': 'Order', 'how.1.p': 'Pick your piece and order in a minute. No account needed.',
    'how.2.t': 'We print it', 'how.2.p': 'We print and finish it by hand in our studio in Lebanon.',
    'how.3.t': 'Delivered to your door', 'how.3.p': 'Pay cash on delivery anywhere in Lebanon.',
    'story.eyebrow': 'Printed in Lebanon',
    'story.title': 'Every piece is designed and printed by us',
    'story.p': 'No middlemen, no imports. We design each piece, print it layer by layer, and finish it in our own studio, so you get something made with care and made to last.',
    'story.cta': 'Our story',
    'trust.1.t': 'Cash on delivery', 'trust.1.p': 'Pay when it arrives',
    'trust.2.t': 'Delivery all over Lebanon', 'trust.2.p': 'To your door',
    'trust.3.t': 'Made in Lebanon', 'trust.3.p': 'Designed and printed locally',
    'trust.4.t': 'Gift-ready packaging', 'trust.4.p': 'Boxed and ready to give',
    'gift.title': 'Send a gift to Lebanon',
    'gift.p': 'Living abroad? Order from anywhere and we deliver to your family in Lebanon, gift-wrapped, with your message and no prices in the box.',
    'gift.cta': 'Shop gifts',
    'reviews.title': 'What our customers say', 'reviews.sub': 'Real comments from people who ordered from KUBIK 3D.',
    'insta.title': 'Follow our process', 'insta.cta': 'Follow on Instagram',

    'card.add': 'Add to cart', 'card.choose': 'Choose options', 'card.added': 'Added to cart',
    'card.sold_out': 'Sold out', 'card.ask_wa': 'Ask on WhatsApp',
    'card.coming_soon': 'Coming soon', 'card.notify_wa': 'Notify me on WhatsApp',
    'card.ships_in': 'Ships in {n} days',
    'card.wa_ask_msg': 'Hi KUBIK 3D, is "{name}" available?',
    'card.wa_notify_msg': 'Hi KUBIK 3D, please let me know when "{name}" is available.',
    'badge.NEW': 'New', 'badge.BEST_SELLER': 'Best seller', 'badge.LIMITED': 'Limited',
    'badge.GIFT_IDEA': 'Perfect gift', 'badge.BACK_IN_STOCK': 'Back in stock',

    'footer.about': 'Home decor, lighting and gifts, designed and 3D printed in Lebanon.',
    'footer.collections': 'Collections', 'footer.help': 'Help', 'footer.follow': 'Follow us',
    'footer.faq': 'FAQ', 'footer.delivery': 'Delivery', 'footer.contact': 'Contact',
    'footer.made': 'Designed & printed in Lebanon', 'footer.rights': 'All rights reserved.',
    'pay.cod': 'Cash on delivery','pay.delivery': 'Delivery across all Lebanon',
  },
};

/** Set <html lang dir>. Call first on every page. */
export function initI18n() {
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
}

/** t('card.ships_in', {n: 3}) */
export function t(key, vars = {}) {
  return (STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/** Pick a data field: loc(product,'name') → name_en || name */
export function loc(obj, base) {
  return obj[`${base}_en`] || obj[base] || '';
}

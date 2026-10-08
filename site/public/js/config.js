// Header + footer content. Edit freely – layout/styling lives in css/site.css.
window.SITE = {
  name: 'YOUR MAGAZINE',
  nav: [
    { t: 'LATEST', h: '/' },
    { t: 'STYLE', h: '/' },
    { t: 'SNEAKERS', h: '/' },
    { t: 'CULTURE', h: '/' },
  ],
  account: [
    { t: 'SAVED', h: '#' },
    { t: 'SIGN IN', h: '#' },
  ],
  footer: {
    cols: [
      { h: 'READER SERVICE', links: [['FAQ', '#'], ['Contact the editors', '#'], ['Advertise with us', '#'], ['Submit a story', '#']] },
      { h: 'ABOUT US', links: [['Imprint', '#'], ['Privacy policy', '#'], ['Cookie policy', '#'], ['Cookie settings', '#']] },
      { h: 'FOLLOW US', links: [['Instagram', '#'], ['TikTok', '#'], ['YouTube', '#']] },
      { h: 'THE TEAM', lines: ['Country / Region: Czech Republic', 'Language: English'] },
      { h: 'CONTACT US', lines: ['Our editors are available Mon–Fri 9:30–19:00', 'E-mail: hello@yourmagazine.com'] },
    ],
    newsletter: {
      title: 'SUBSCRIBE TO OUR NEWSLETTER',
      text: 'Sign up to get the latest stories, drops and news straight to your inbox.',
      label: 'E-mail*',
      note: 'By submitting this form you agree to the processing of your personal data for the purpose of sending the newsletter.',
      button: 'SUBSCRIBE',
    },
    copy: '© 2026 YOUR MAGAZINE',
  },
};

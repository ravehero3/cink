// The ONE article layout. Every article uses exactly this block order.
// To change the layout for all articles, edit this list (and css/site.css tokens).
//   type: 'text' | 'image' | 'instagram'
//   image blocks also get a small credit line underneath.
window.TEMPLATE = {
  hero: { id: 'hero', type: 'image', ratio: '3 / 2', size: '1200 × 800 px', ratioLabel: '3:2', credit: true },
  body: [
    { id: 't1', type: 'text' },
    { id: 't2', type: 'text' },
    { id: 'ig1', type: 'instagram' },
    { id: 't3', type: 'text' },
    { id: 'img1', type: 'image', ratio: '3 / 2', size: '1200 × 800 px', ratioLabel: '3:2', credit: true },
    { id: 't4', type: 'text' },
    { id: 't5', type: 'text' },
    { id: 'ig2', type: 'instagram' },
    { id: 't6', type: 'text' },
    { id: 't7', type: 'text' },
    { id: 'ig3', type: 'instagram' },
    { id: 't8', type: 'text' },
    { id: 'img2', type: 'image', ratio: '3 / 2', size: '1200 × 800 px', ratioLabel: '3:2', credit: true },
    { id: 't9', type: 'text' },
    { id: 't10', type: 'text' },
    { id: 'ig4', type: 'instagram' },
    { id: 't11', type: 'text' },
  ],
  avatar: { id: 'avatar', type: 'image', ratio: '1 / 1', size: '320 × 320 px', ratioLabel: '1:1' },
};

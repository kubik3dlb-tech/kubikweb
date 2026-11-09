# KUBIK 3D

The online store for KUBIK 3D: home decor, lighting and gifts, designed and 3D printed in Lebanon.

It is a plain HTML, CSS and JavaScript website with no build step. Customers fill their cart and send the order to the store on WhatsApp, and pay cash on delivery.

## Folders

```
index.html, shop.html, ...   One file per page, all in this top folder
css/                         Styles and seasonal themes
js/                          Site code (js/pages has one file per page, js/ui has shared parts)
data/                        Products, collections, settings, reviews and discounts
assets/images/               Website photos (assets/images/products for product photos)
assets/logo/                 Logo
```

## Common changes

| To change | Edit |
|---|---|
| Products, prices, photos, stock | `data/products.json` |
| Collections and their banners | `data/collections.json` |
| WhatsApp number, social links, announcement, Christmas deadline | `data/settings.json` |
| Seasonal theme (`default`, `christmas`, `valentine`) | `"theme"` in `data/settings.json` |

Keep website photos under about 300 KB where you can, so pages load quickly on phones.

## Preview on your computer

The site needs a small local web server. Opening `index.html` directly shows a blank page.

```
python -m http.server 8080
```

Then open http://localhost:8080

## Publish with GitHub Pages

1. Push this folder to a public GitHub repository.
2. In the repository, go to **Settings > Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
4. After a minute or two, the site is live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

Every push to `main` updates the live site.

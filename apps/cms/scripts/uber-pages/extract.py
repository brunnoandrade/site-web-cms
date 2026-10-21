"""
Extracts the Uber Conta product pages from the current site (https://ubercontabrasil.com.br) into
scripts/uber-pages/data/<slug>.json and downloads their images and videos to
src/endpoints/seed/uber-conta-assets/. The site is Nuxt: each HTML carries the CMS content in
<script id="__NUXT_DATA__">, so no scraping of the markup is needed.

Usage: python3 scripts/uber-pages/extract.py [slug ...]   (no slug = all pages; needs node_modules for sharp)
SVG icons and logos are rasterized to PNG with sharp (the media library refuses SVG).
"""
import json, os, re, subprocess, sys, urllib.request

BASE = 'https://ubercontabrasil.com.br'
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')
ASSETS = os.path.abspath(os.path.join(HERE, '../../src/endpoints/seed/uber-conta-assets'))
OTHERS = ['sobre', 'informacoes-financeiras']
PRODUCTS = 'antecipacao-do-fgts cartao cashback cdb conta-digital credito-pessoal credito-rapido debitos-veiculares descontos km-de-vantagens pix seguro-celular tag-veloe uber-chip'.split()


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=60).read()


def nuxt(html):
    m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    return json.loads(m.group(1))


def resolve(d, i, depth=0, seen=()):
    v = d[i]
    if depth > 12 or i in seen:
        return None
    if isinstance(v, dict):
        return {k: (resolve(d, x, depth + 1, seen + (i,)) if isinstance(x, int) and not isinstance(x, bool) else x) for k, x in v.items()}
    if isinstance(v, list):
        if v and v[0] in ('ShallowReactive', 'Reactive', 'Ref', 'ShallowRef', 'EmptyRef'):
            return resolve(d, v[1], depth, seen + (i,))
        return [resolve(d, x, depth + 1, seen + (i,)) if isinstance(x, int) and not isinstance(x, bool) else x for x in v]
    return v


def find_page(d):
    for i, v in enumerate(d):
        if isinstance(v, dict) and 'content' in v and 'slug' in v and 'title' in v and 'keywords' in v:
            return resolve(d, i)


downloaded = {}


def asset(media):
    """Downloads a Strapi media object; returns the local file name (SVG becomes PNG)."""
    if not media or not media.get('url'):
        return None
    url = media['url']
    if url in downloaded:
        return downloaded[url]
    name = os.path.basename(url.split('?')[0])
    out = name
    if name.endswith('.svg'):
        out = name[:-4] + '.png'
    path = os.path.join(ASSETS, out)
    if not os.path.exists(path):
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
        if name.endswith('.svg'):
            tmp = path + '.svg'
            open(tmp, 'wb').write(raw)
            w, h = media.get('width') or 1, media.get('height') or 1
            # Icons become 96px squares; wide logos keep their proportions (480px wide).
            resize = "resize(480)" if w / h > 1.4 else "resize(96,96,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})"
            subprocess.run(['node', '-e', "require('sharp')(process.argv[1],{density:384})." + resize + ".png().toFile(process.argv[2])", tmp, path], check=True, cwd=os.path.join(HERE, '../..'))
            os.remove(tmp)
        else:
            open(path, 'wb').write(raw)
    downloaded[url] = out
    return out


def pair(desktop, mobile):
    """Desktop/mobile images are swapped in some pages: the wider one is the desktop one."""
    a, b = asset(desktop), asset(mobile)
    if desktop and mobile and (desktop.get('width') or 0) < (mobile.get('width') or 0):
        a, b = b, a
    return a, b


def clean_html(html):
    html = re.sub(r'<li>\s*-\s*', '<li>', html or '')
    return html.strip()


def text_of(value):
    """Strapi rich-ish strings: <br> becomes a line break, <strong>x</strong> becomes **x**."""
    if value is None:
        return None
    value = re.sub(r'<br\s*/?>', '\n', value)
    value = re.sub(r'</?strong>', '**', value)
    return re.sub(r'<[^>]+>', '', value).strip()


def label_of(url):
    if 'play.google' in url:
        return 'Google Play'
    if 'apps.apple' in url:
        return 'App Store'
    return url


def build_about(slug):
    page = find_page(nuxt(fetch('/' + slug).decode()))
    out = {'kind': 'about', 'slug': slug, 'title': page['title'], 'metaDescription': page.get('description'), 'keywords': page.get('keywords')}
    for c in page['content']:
        kind = c['__component'].replace('site.', '')
        if kind == 'hero':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['hero'] = {'title': text_of(c['title']), 'text': c.get('text'), 'cta': c.get('button_text'), 'ctaUrl': c.get('button_url'), 'logo': asset(c.get('logo')), 'tone': 'onLight' if c.get('style') == 'dark' else 'onDark', 'image': img, 'imageMobile': mob}
        elif kind == 'partner':
            out['partner'] = {'heading': text_of(c['title']), 'text': text_of(c.get('description')), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'video': asset(c.get('video_desktop')), 'videoMobile': asset(c.get('video_mobile'))}
        elif kind == 'story':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['story'] = {'heading': text_of(c['title']), 'text': c.get('description'), 'image': img, 'imageMobile': mob, 'items': [{'icon': asset(i.get('icon')), 'title': i['title'], 'text': i.get('description')} for i in c['items']]}
        elif kind == 'timeline':
            out['timeline'] = {'heading': text_of(c['title']), 'text': text_of(c.get('description')), 'items': [{'icon': asset(i.get('icon')), 'period': i['year'], 'title': i['title'], 'text': i.get('description')} for i in c['items']]}
        elif kind == 'image-content':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['imageContent'] = {'heading': text_of(c['title']), 'text': text_of(c.get('description')), 'logo': asset(c.get('logo')), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'newTab': c.get('button_target') == '_blank', 'image': img, 'imageMobile': mob}
        elif kind == 'talk':
            out['contacts'] = {'eyebrow': c.get('label'), 'heading': c['title'], 'text': text_of(c.get('description')), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'),
                               'groups': [{'title': g.get('title'), 'entries': [{'title': b['title'], 'description': text_of(b.get('description')), 'phone': b.get('phone'), 'url': b.get('link'), 'icon': asset(b.get('icon'))} for b in g['blocks']]} for g in c['contacts']]}
        else:
            print('  unknown component', kind, file=sys.stderr)
    return out


def build_documents(slug):
    page = find_page(nuxt(fetch('/' + slug).decode()))
    out = {'kind': 'documents', 'slug': slug, 'title': page['title'], 'metaDescription': page.get('description'), 'keywords': page.get('keywords')}
    for c in page['content']:
        kind = c['__component'].replace('site.', '')
        if kind == 'hero':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['hero'] = {'title': text_of(c['title']), 'text': c.get('text'), 'cta': c.get('button_text'), 'ctaUrl': c.get('button_url'), 'tone': 'onLight' if c.get('style') == 'dark' else 'onDark', 'image': img, 'imageMobile': mob}
        elif kind == 'documents':
            groups = []
            for g in c['list']:
                items = []
                for i in g['items']:
                    links = []
                    for l in i['links']:
                        u = l['url']
                        links.append({'label': label_of(u) if not u.endswith('.pdf') else 'Documento', 'file': asset({'url': u}) if u.endswith('.pdf') else None, 'url': None if u.endswith('.pdf') else u})
                    items.append({'title': i['title'], 'icon': asset(i.get('icon')), 'links': links})
                groups.append({'title': g['title'], 'items': items})
            out['groups'] = groups
        else:
            print('  unknown component', kind, file=sys.stderr)
    return out


def no_br(o):
    """Product pages: the editors used <br> inside plain texts; the platform wraps by itself."""
    if isinstance(o, str):
        return re.sub(r'\s*<br\s*/?>\s*', ' ', o) if not o.startswith('<p') and not o.startswith('<ol') and not o.startswith('<ul') else o
    if isinstance(o, list):
        return [no_br(x) for x in o]
    if isinstance(o, dict):
        return {k: (v if k == 'answer' else no_br(v)) for k, v in o.items()}
    return o


def split_legend(legend):
    """'Texto <a href="#sobre">Saber mais.</a>' -> (texto, {label, url}). The "#sobre" anchor does not exist on those pages: it points to /sobre."""
    if not legend:
        return legend, None
    m = re.search(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', legend)
    if not m:
        return legend, None
    url = '/sobre' if m.group(1) == '#sobre' else m.group(1)
    return legend[:m.start()].strip(), {'label': m.group(2), 'url': url}


def build(slug):
    page = find_page(nuxt(fetch('/' + slug).decode()))
    out = {'slug': slug, 'title': page['title'], 'metaDescription': page.get('description'), 'keywords': page.get('keywords')}
    for c in page['content']:
        kind = c['__component'].replace('site.', '')
        if kind == 'hero':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            legend, legend_link = split_legend(c.get('legend'))
            out['hero'] = {'tagline': c.get('tagline'), 'title': c['title'], 'text': c.get('text'), 'legend': legend, 'legendLink': legend_link, 'cta': c.get('button_text'), 'ctaUrl': c.get('button_url'), 'image': img, 'imageMobile': mob}
        elif kind == 'feature':
            out['features'] = {'heading': c['title'], 'description': c.get('description'), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'image': asset(c.get('image')), 'video': asset(c.get('video')) if c.get('type_media') == 'video' else None, 'items': [{'icon': asset(i.get('icon')), 'title': i['title'], 'text': i.get('description')} for i in c['items']]}
        elif kind == 'acquire':
            steps = []
            for i in c['items']:
                img, mob = pair(i.get('image_desktop'), i.get('image_mobile'))
                steps.append({'title': i['title'], 'text': i.get('description'), 'image': img, 'imageMobile': mob})
            out['steps'] = {'heading': c['title'], 'text': c.get('description'), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'items': steps}
        elif kind == 'increase':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['increase'] = {'icon': asset(c.get('icon')), 'heading': c['title'], 'text': c.get('description'), 'legend': c.get('legend'), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'image': img, 'imageMobile': mob, 'items': [{'icon': asset(i.get('icon')), 'text': i['text']} for i in c['items']]}
        elif kind == 'posts':
            out['posts'] = {'eyebrow': c.get('description'), 'heading': c['title'], 'button': c.get('button_text'), 'buttonUrl': c.get('button_url')}
        elif kind == 'image-divider':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['band'] = {'image': img, 'imageMobile': mob, 'style': c.get('style')}
        elif kind == 'faq':
            out['faqs'] = [{'question': f['question'], 'answer': clean_html(f['answer']), 'slug': f.get('slug'), 'category': (f.get('faq_category') or {}).get('slug')} for f in c['faqs']]
            out['faqSection'] = {'heading': c['title'], 'button': c.get('button_text'), 'buttonUrl': c.get('button_url')}
        elif kind == 'related-solution':
            img, mob = pair(c.get('image_desktop'), c.get('image_mobile'))
            out['related'] = {'heading': c['title'], 'text': c.get('description'), 'legend': c.get('text'), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'image': img, 'imageMobile': mob,
                              'items': [{'title': i['title'], 'text': i.get('description'), 'icon': asset(i.get('icon')), 'url': i['url']} for i in c['items'] if i['url'].strip('/') != slug]}
        else:
            print('  unknown component', kind, file=sys.stderr)
    return no_br(out)


if __name__ == '__main__':
    for slug in sys.argv[1:] or PRODUCTS + OTHERS:
        print(slug)
        data = build_about(slug) if slug == 'sobre' else build_documents(slug) if slug == 'informacoes-financeiras' else build(slug)
        json.dump(data, open(os.path.join(DATA, slug + '.json'), 'w'), ensure_ascii=False, indent=2)
        open(os.path.join(DATA, slug + '.json'), 'a').write('\n')

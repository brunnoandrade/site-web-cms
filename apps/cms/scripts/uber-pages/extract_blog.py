"""
Extracts the Uber Conta blog from the current site into scripts/uber-pages/data-help/blog.json
(hero, categories, posts with their HTML) and downloads the images. Posts are the 11 of the
sitemap. Usage: python3 scripts/uber-pages/extract_blog.py
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract as ex  # noqa: E402

SLUGS = '''antecipe-seu-saque-aniversario-fgts-com-a-uber-conta
autoatendimento-o-que-e-e-quais-sao-as-vantagens
cashback-uber-conta-como-economizar-e-ter-dinheiro-de-volta
cdb-uber-conta-voce-dirige-seu-dinheiro-rende
mensalidade-uber-conta-isencao-valores-e-muito-mais
os-5-erros-financeiros-que-fazem-motoristas-perder-dinheiro-sem-perceber
quais-sao-as-vantagens-da-uber-conta
seguro-celular-uber-conta-proteja-sua-ferramenta-indispensavel
tudo-sobre-o-uber-conta-credito-pessoal
uber-conta-credito-rapido-tudo-o-que-voce-precisa-saber
uber-conta-km-de-vantagens-como-abastecer-com-cashback'''.split()


def async_data(path):
    d = ex.nuxt(ex.fetch(path).decode())
    out = []
    for v in d[:20]:
        if isinstance(v, dict):
            for k, x in v.items():
                if k.startswith('$f') and isinstance(x, int):
                    out.append(ex.resolve(d, x))
    return out


def local_images(html):
    """Downloads the images of a post and points <img src> to the local file name."""
    def swap(m):
        name = ex.asset({'url': m.group(1)})
        return m.group(0).replace(m.group(1), name)
    return re.sub(r'<img[^>]*?src="([^"]+)"', swap, html)


def main():
    out = {}
    for r in async_data('/blog'):
        if isinstance(r, dict) and 'content' in r and r['content'] and r['content'][0].get('__component') == 'site.hero-blog':
            c = r['content'][0]
            img, mob = ex.pair(c.get('image_desktop'), c.get('image_mobile'))
            out['title'] = r['title']
            out['metaDescription'] = r.get('description')
            out['hero'] = {'tagline': c.get('tagline'), 'title': c['title'], 'text': c.get('text'), 'image': img, 'imageMobile': mob}
    posts, categories = [], {}
    for slug in SLUGS:
        for r in async_data('/blog/' + slug):
            if isinstance(r, dict) and 'data' in r and isinstance(r['data'], dict) and 'post' in r['data']:
                p = r['data']['post']
                cats = [{'title': c['title'], 'slug': c['slug']} for c in p.get('categories') or []]
                for c in cats:
                    categories.setdefault(c['slug'], c['title'])
                posts.append({'title': p['title'], 'slug': p['slug'], 'description': (p.get('description') or '').strip(), 'publishedAt': p['publishedAt'], 'image': ex.asset(p.get('image')), 'categories': [c['slug'] for c in cats], 'author': (p.get('author') or {}).get('slug'), 'html': local_images(p['content'])})
    out['categories'] = [{'title': t, 'slug': s} for s, t in categories.items()]
    out['posts'] = posts
    print(len(posts), 'posts;', len(categories), 'categories', file=sys.stderr)
    os.makedirs(os.path.join(ex.HERE, 'data-help'), exist_ok=True)
    with open(os.path.join(ex.HERE, 'data-help', 'blog.json'), 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write('\n')


main()

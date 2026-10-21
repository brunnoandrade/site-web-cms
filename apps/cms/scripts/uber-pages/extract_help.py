"""
Extracts the Uber Conta help center from the current site into scripts/uber-pages/data-help/help.json
(hero, categories with their groups and questions, the questions with their answers, and the blocks
at the end of the home page) and downloads the images. Same approach as extract.py (Nuxt payload).

Usage: python3 scripts/uber-pages/extract_help.py
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract as ex  # noqa: E402


def requests(d):
    out = {}
    for v in d[:20]:
        if isinstance(v, dict):
            for k, x in v.items():
                if (k.startswith('/') or k.startswith('\\u002F')) and isinstance(x, int):
                    out[k] = ex.resolve(d, x)
    return out


def payload(path):
    return requests(ex.nuxt(ex.fetch(path).decode()))


def first(reqs, prefix):
    return next(v for k, v in reqs.items() if k.startswith(prefix))


def main():
    home = payload('/central-de-ajuda')
    content = first(home, '/help-center')['data']['content']
    out = {'title': first(home, '/help-center')['data']['title'], 'metaDescription': first(home, '/help-center')['data'].get('description')}
    faqs = {f['slug']: f for f in first(home, '/faqs')['data']}
    categories = []
    for c in content:
        kind = c['__component'].replace('site.', '')
        if kind == 'help-hero':
            img, mob = ex.pair(c.get('image_desktop'), c.get('image_mobile'))
            out['hero'] = {'tagline': c.get('tagline'), 'title': c['title'], 'text': c.get('text'), 'image': img, 'imageMobile': mob}
        elif kind == 'help-search':
            out['searchPlaceholder'] = c.get('placeholder')
        elif kind == 'help-categories':
            for cat in c['faq_categories']:
                page = payload('/central-de-ajuda/categorias?slug=' + cat['slug'])
                detail = first(page, '/faq-categories')['data'][0]
                groups = []
                for g in detail['faqs']:
                    groups.append({'title': g.get('title'), 'faqs': [f['slug'] for f in g['faqs']]})
                categories.append({'title': cat['title'], 'slug': cat['slug'], 'description': cat.get('description'), 'icon': ex.asset(cat.get('icon')), 'groups': groups})
        elif kind == 'image-content':
            img, mob = ex.pair(c.get('image_desktop'), c.get('image_mobile'))
            out['imageContent'] = {'eyebrow': c.get('tagline'), 'heading': ex.text_of(c['title']), 'text': ex.text_of(c.get('description')), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'), 'newTab': c.get('button_target') == '_blank', 'logo': ex.asset(c.get('logo')), 'image': img, 'imageMobile': mob}
        elif kind == 'talk':
            out['contacts'] = {'eyebrow': c.get('label'), 'heading': c['title'], 'text': ex.text_of(c.get('description')), 'button': c.get('button_text'), 'buttonUrl': c.get('button_url'),
                               'groups': [{'title': g.get('title'), 'entries': [{'title': b['title'], 'description': b.get('description'), 'phone': b.get('phone'), 'url': b.get('link'), 'icon': ex.asset(b.get('icon'))} for b in g['blocks']]} for g in c['contacts']]}
        else:
            print('unknown component', kind, file=sys.stderr)
    out['categories'] = categories
    categorized = {slug: cat['slug'] for cat in categories for g in cat['groups'] for slug in g['faqs']}
    out['faqs'] = [{'question': f['question'], 'slug': s, 'category': categorized.get(s), 'answer': ex.clean_html(f['answer'])} for s, f in faqs.items()]
    missing = [f['slug'] for f in out['faqs'] if not f['category']]
    print(len(out['faqs']), 'questions;', len(categories), 'categories; without category:', missing, file=sys.stderr)
    os.makedirs(os.path.join(ex.HERE, 'data-help'), exist_ok=True)
    with open(os.path.join(ex.HERE, 'data-help', 'help.json'), 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write('\n')


main()

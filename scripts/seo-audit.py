#!/usr/bin/env python3
"""Compares the SEO tags (<head> and JSON-LD) of a reference site with another environment, URL by URL.

Usage: python3 scripts/seo-audit.py [--ref https://ubercontabrasil.com.br] [--target http://uberconta.localhost:3000]
                                    [--urls docs/checklist-uber-conta.md] [--out docs/seo-audit-uber-conta.md] [--json out.json]
URLs come from the paths written between backticks in the table of the given file. Exit code 1 when a hard check fails.
"""
import argparse, json, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit

KEYS = ['title', 'description', 'keywords', 'robots', 'canonical', 'og:title', 'og:description', 'og:image', 'og:type',
        'og:site_name', 'twitter:card', 'twitter:title', 'twitter:image', 'theme-color', 'author']


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (seo-audit)'})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status, response.read().decode('utf8', 'replace'), response.geturl()
    except urllib.error.HTTPError as error:
        return error.code, '', url
    except Exception as error:  # noqa: BLE001
        return 0, str(error), url


def parse(html):
    head = re.search(r'<head[^>]*>(.*?)</head>', html, re.S)
    head = head.group(1) if head else html
    tags = {}
    title = re.search(r'<title[^>]*>(.*?)</title>', head, re.S)
    tags['title'] = title.group(1).strip() if title else None
    for meta in re.findall(r'<meta\s+([^>]*?)/?>', head, re.S):
        attrs = dict(re.findall(r'([\w:-]+)="([^"]*)"', meta))
        key = attrs.get('name') or attrs.get('property')
        if key and 'content' in attrs:
            tags.setdefault(key, attrs['content'])
    for link in re.findall(r'<link\s+([^>]*?)/?>', head, re.S):
        attrs = dict(re.findall(r'([\w:-]+)="([^"]*)"', link))
        if attrs.get('rel') == 'canonical':
            tags['canonical'] = attrs.get('href')
    types = []
    for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        try:
            data = json.loads(raw)
        except ValueError:
            continue
        for node in (data.get('@graph') if isinstance(data, dict) and '@graph' in data else [data]):
            kind = node.get('@type') if isinstance(node, dict) else None
            types += kind if isinstance(kind, list) else [kind] if kind else []
    tags['jsonld'] = sorted(set(types))
    return tags


def path_of(value):
    split = urlsplit(value or '')
    return (split.path or '/').rstrip('/') + (('?' + split.query) if split.query else '') or '/'


def suffix_free(value):
    return re.sub(r'\s*[•|]\s*Uber Conta$', '', value or '')


# Differences accepted on purpose: (path prefix, tag) -> reason. They are listed in the report but do not fail it.
KNOWN = {
    ('/central-de-ajuda/categorias', 'canonical'): 'o site atual aponta todas as categorias para /central-de-ajuda/categorias (sem ?slug=), o que junta as páginas; aqui cada categoria é o próprio canonical',
    ('/central-de-ajuda/categorias', 'title'): 'sem ?slug= o site atual mostra a primeira categoria; aqui redireciona para /central-de-ajuda',
    ('/central-de-ajuda/categorias', 'description'): 'sem ?slug= o site atual mostra a primeira categoria; aqui redireciona para /central-de-ajuda',
    ('/central-de-ajuda/categorias', 'og:title'): 'idem',
    ('/central-de-ajuda/categorias', 'twitter:title'): 'idem',
    ('/central-de-ajuda/categorias', 'status'): 'sem ?slug= redireciona para /central-de-ajuda',
    ('/central-de-ajuda/como-faco-para-rastrear-a-entrega-do-meu-cartao', 'description'): 'o texto do site atual usa "- " digitado como marcador de lista; aqui é uma lista de verdade (sem o hífen)',
    ('/central-de-ajuda/busca', 'og:title'): 'o site atual mantém o sufixo da marca no og:title da busca (as demais páginas não)',
    ('/central-de-ajuda/busca', 'twitter:title'): 'o site atual não envia twitter:title na busca',
}


def known(path, issue):
    key = issue.split(': ')[0].split(' ')[0]
    for (prefix, tag), reason in KNOWN.items():
        if path.startswith(prefix) and key == tag:
            return reason
    return None


def compare(path, ref, target):
    issues = []
    if target['status'] != ref['status']:
        issues.append(f"status {target['status']} (ref {ref['status']})")
    if not target['tags']:
        return issues
    a, b = ref['tags'], target['tags']
    for tags in (a, b):
        for key in ('description', 'title', 'keywords'):
            if tags.get(key):
                tags[key] = tags[key].strip()
    if a.get('title') != b.get('title'):
        issues.append(f"title: «{b.get('title')}» (ref «{a.get('title')}»)")
    if sorted((a.get('robots') or '').replace(' ', '').split(',')) != sorted((b.get('robots') or '').replace(' ', '').split(',')):
        issues.append(f"robots: «{b.get('robots')}» (ref «{a.get('robots')}»)")
    for key in ['description', 'keywords', 'og:type', 'og:site_name', 'twitter:card']:
        if a.get(key) != b.get(key):
            issues.append(f"{key}: «{b.get(key)}» (ref «{a.get(key)}»)")
    for key in ['og:title', 'twitter:title']:
        if suffix_free(a.get(key)) != suffix_free(b.get(key)) or a.get(key) != b.get(key):
            issues.append(f"{key}: «{b.get(key)}» (ref «{a.get(key)}»)")
    if path_of(a.get('canonical')) != path_of(b.get('canonical')):
        issues.append(f"canonical: {b.get('canonical')} (ref {a.get('canonical')})")
    if not b.get('og:image'):
        issues.append('og:image ausente')
    if a['jsonld'] != b['jsonld']:
        issues.append(f"json-ld: {b['jsonld']} (ref {a['jsonld']})")
    return issues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ref', default='https://ubercontabrasil.com.br')
    parser.add_argument('--target', default='http://uberconta.localhost:3000')
    parser.add_argument('--urls', default='docs/checklist-uber-conta.md')
    parser.add_argument('--out')
    parser.add_argument('--json')
    args = parser.parse_args()
    paths = []
    for line in open(args.urls, encoding='utf8'):
        match = re.search(r'\|\s*`(/[^`]*)`\s*\|', line)
        if match:
            paths.append(match.group(1))

    def one(path):
        results = {}
        for name, base in (('ref', args.ref), ('target', args.target)):
            status, body, final = fetch(base.rstrip('/') + path)
            results[name] = {'status': status, 'final': final, 'tags': parse(body) if status == 200 else None}
        return path, results

    with ThreadPoolExecutor(6) as pool:
        rows = list(pool.map(one, paths))
    report, failures = [], 0
    for path, result in rows:
        found = compare(path, result['ref'], result['target'])
        issues = [i for i in found if not known(path, i)]
        notes = [f"{i} — esperado: {known(path, i)}" for i in found if known(path, i)]
        failures += bool(issues)
        report.append((path, issues, notes))
    lines = [f'# Auditoria de SEO: {args.target} contra {args.ref}', '', f'{len(rows) - failures} de {len(rows)} URLs sem diferenças.', '']
    for path, issues, notes in report:
        lines.append(f"- {'✅' if not issues else '❌'} `{path}`")
        lines += [f'  - {issue}' for issue in issues]
        lines += [f'  - ℹ️ {note}' for note in notes]
    text = '\n'.join(lines) + '\n'
    if args.out:
        open(args.out, 'w', encoding='utf8').write(text)
    if args.json:
        json.dump(dict(rows), open(args.json, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(text if not args.out else f'{len(rows) - failures}/{len(rows)} sem diferenças; relatório em {args.out}')
    sys.exit(1 if failures else 0)


main()
